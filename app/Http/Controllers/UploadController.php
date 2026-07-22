<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Upload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Parsedown;
use PhpOffice\PhpWord\IOFactory;

class UploadController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:txt,md,markdown,docx', 'max:5120'],
        ]);

        $file = $data['file'];
        $originalName = $file->getClientOriginalName();
        $title = Str::limit(pathinfo($originalName, PATHINFO_FILENAME) ?: 'Imported Document', 255, '');
        
        $extension = $file->getClientOriginalExtension();
        $content = file_get_contents($file->getRealPath()) ?: '';

        if (in_array($extension, ['md', 'markdown'])) {
            $htmlContent = $this->markdownToHtml($content);
        } elseif ($extension === 'docx') {
            $htmlContent = $this->docxToHtml($file->getRealPath());
        } else {
            $htmlContent = $this->plainTextToHtml($content);
        }

        $document = Document::create([
            'owner_id' => Auth::id(),
            'title' => $title,
            'content' => $htmlContent,
        ]);

        $path = $file->store('uploads');

        Upload::create([
            'document_id' => $document->id,
            'original_name' => $originalName,
            'stored_name' => basename($path),
            'mime_type' => $file->getClientMimeType() ?: 'text/plain',
            'path' => $path,
            'size' => Storage::size($path),
        ]);

        return redirect()->route('documents.show', $document);
    }

    private function docxToHtml(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath);
            $html = [];
            
            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    $html[] = $this->parseElement($element);
                }
            }

            $htmlContent = implode('', $html);
            
            if (empty(trim(strip_tags($htmlContent)))) {
                return $this->fallbackDocxParser($filePath);
            }
            
            return $htmlContent;
        } catch (\Exception $e) {
            \Log::error('DOCX parsing failed:', ['error' => $e->getMessage()]);
            return $this->fallbackDocxParser($filePath);
        }
    }

    private function parseElement($element): string
    {
        if (method_exists($element, 'getStyle')) {
            $style = $element->getStyle();
            if ($style) {
                $styleName = $style->getStyleName();
                if ($styleName) {
                    $styleName = strtolower($styleName);
                    if (strpos($styleName, 'heading 1') !== false) {
                        return '<h1>' . $this->getElementText($element) . '</h1>';
                    }
                    if (strpos($styleName, 'heading 2') !== false) {
                        return '<h2>' . $this->getElementText($element) . '</h2>';
                    }
                    if (strpos($styleName, 'heading 3') !== false) {
                        return '<h3>' . $this->getElementText($element) . '</h3>';
                    }
                    if (strpos($styleName, 'title') !== false) {
                        return '<h1>' . $this->getElementText($element) . '</h1>';
                    }
                    if (strpos($styleName, 'subtitle') !== false) {
                        return '<h2>' . $this->getElementText($element) . '</h2>';
                    }
                }
            }
        }
        if (method_exists($element, 'getElements')) {
            if ($this->isListItem($element)) {
                $text = $this->getElementText($element);
                if (!empty(trim($text))) {
                    return '<li>' . $this->formatTextRun($element) . '</li>';
                }
                return '';
            }

            $fontSize = $this->getFontSize($element);
            if ($fontSize >= 24) {
                return '<h1>' . $this->getElementText($element) . '</h1>';
            } elseif ($fontSize >= 18) {
                return '<h2>' . $this->getElementText($element) . '</h2>';
            } elseif ($fontSize >= 14) {
                return '<h3>' . $this->getElementText($element) . '</h3>';
            }

            $text = $this->getElementText($element);
            if (!empty(trim($text))) {
                $formattedText = $this->formatTextRun($element);
                return '<p>' . $formattedText . '</p>';
            }
            return '';
        }

        if (method_exists($element, 'getText')) {
            $text = $element->getText();
            if (!empty(trim($text))) {
                return '<p>' . nl2br(e(trim($text))) . '</p>';
            }
        }

        return '';
    }

    private function isListItem($element): bool
    {
        if (method_exists($element, 'getStyle')) {
            $style = $element->getStyle();
            if ($style && method_exists($style, 'getListType')) {
                return true;
            }
        }
        return false;
    }

    private function getElementText($element): string
    {
        $text = '';
        
        if (method_exists($element, 'getElements')) {
            foreach ($element->getElements() as $child) {
                if (method_exists($child, 'getText')) {
                    $text .= $child->getText();
                }
            }
        } elseif (method_exists($element, 'getText')) {
            $text = $element->getText();
        }
        
        return trim($text);
    }

    private function formatTextRun($element): string
    {
        $html = '';
        
        if (!method_exists($element, 'getElements')) {
            return $this->getElementText($element);
        }

        foreach ($element->getElements() as $child) {
            if (!method_exists($child, 'getText')) {
                continue;
            }

            $text = $child->getText();
            if (empty(trim($text))) {
                continue;
            }

            $formatted = e($text);
            
            if (method_exists($child, 'getFontStyle')) {
                $style = $child->getFontStyle();
                if ($style) {
                    if ($style->isBold()) {
                        $formatted = '<strong>' . $formatted . '</strong>';
                    }
                    if ($style->isItalic()) {
                        $formatted = '<em>' . $formatted . '</em>';
                    }
                    if ($style->getUnderline() !== 'none' && $style->getUnderline() !== null) {
                        $formatted = '<u>' . $formatted . '</u>';
                    }
                }
            }

            $html .= $formatted;
        }

        return $html;
    }

    /**
     * Get font size from element
     */
    private function getFontSize($element): int
    {
        if (method_exists($element, 'getElements')) {
            foreach ($element->getElements() as $child) {
                if (method_exists($child, 'getFontStyle')) {
                    $style = $child->getFontStyle();
                    if ($style && method_exists($style, 'getSize')) {
                        return $style->getSize() ?: 0;
                    }
                }
            }
        }
        return 0;
    }

    private function fallbackDocxParser(string $filePath): string
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($filePath) === true) {
                $xml = $zip->getFromName('word/document.xml');
                $zip->close();
                
                if ($xml) {
                    // Load XML and preserve formatting
                    $dom = new \DOMDocument();
                    $dom->loadXML($xml);
                    
                    $html = [];
                    
                    $paragraphs = $dom->getElementsByTagName('p');
                    foreach ($paragraphs as $paragraph) {
                        $text = '';
                        $isHeading = false;
                        $headingLevel = 0;
                        
                        $pStyle = $paragraph->getAttribute('w:style');
                        if ($pStyle) {
                            $pStyle = strtolower($pStyle);
                            if (strpos($pStyle, 'heading1') !== false) {
                                $isHeading = true;
                                $headingLevel = 1;
                            } elseif (strpos($pStyle, 'heading2') !== false) {
                                $isHeading = true;
                                $headingLevel = 2;
                            } elseif (strpos($pStyle, 'heading3') !== false) {
                                $isHeading = true;
                                $headingLevel = 3;
                            }
                        }
                        
                        $runs = $paragraph->getElementsByTagName('r');
                        foreach ($runs as $run) {
                            $tElements = $run->getElementsByTagName('t');
                            foreach ($tElements as $t) {
                                $text .= $t->nodeValue;
                            }
                        }
                        
                        $text = trim($text);
                        if (empty($text)) {
                            continue;
                        }
 
                        if (preg_match('/^[•\-*]\s+/', $text)) {
                            $text = preg_replace('/^[•\-*]\s+/', '', $text);
                            $html[] = '<li>' . e($text) . '</li>';
                            continue;
                        }
                        
                        if (preg_match('/^\d+\.\s+/', $text)) {
                            $text = preg_replace('/^\d+\.\s+/', '', $text);
                            $html[] = '<li>' . e($text) . '</li>';
                            continue;
                        }

                        if ($isHeading) {
                            $html[] = '<h' . $headingLevel . '>' . e($text) . '</h' . $headingLevel . '>';
                        } else {
                            $html[] = '<p>' . nl2br(e($text)) . '</p>';
                        }
                    }

                    $result = [];
                    $inList = false;
                    foreach ($html as $item) {
                        if (strpos($item, '<li>') !== false) {
                            if (!$inList) {
                                $result[] = '<ul>';
                                $inList = true;
                            }
                            $result[] = $item;
                        } else {
                            if ($inList) {
                                $result[] = '</ul>';
                                $inList = false;
                            }
                            $result[] = $item;
                        }
                    }
                    if ($inList) {
                        $result[] = '</ul>';
                    }
                    
                    $content = implode('', $result);
                    return $content ?: '<p>Imported DOCX content</p>';
                }
            }
            return '<p>Failed to parse DOCX file</p>';
        } catch (\Exception $e) {
            \Log::error('Fallback DOCX parsing failed:', ['error' => $e->getMessage()]);
            return '<p>Failed to parse DOCX file. Please ensure it is a valid Word document.</p>';
        }
    }

    private function markdownToHtml(string $content): string
    {
        $parsedown = new Parsedown();
        $parsedown->setSafeMode(true);
        return $parsedown->text($content);
    }

    private function plainTextToHtml(string $content): string
    {
        $normalized = trim(str_replace(["\r\n", "\r"], "\n", $content));

        if ($normalized === '') {
            return '';
        }

        $paragraphs = preg_split("/\n{2,}/", $normalized);
        
        $html = [];
        foreach ($paragraphs as $paragraph) {
            $trimmed = trim($paragraph);
            
            if ($this->isHeading($trimmed)) {
                $html[] = '<h2>' . e($trimmed) . '</h2>';
                continue;
            }

            $lines = explode("\n", $trimmed);
            $listItems = [];
            $isList = false;
            
            foreach ($lines as $line) {
                $line = trim($line);
                if (preg_match('/^[-•*]\s+(.+)$/', $line, $matches)) {
                    $isList = true;
                    $listItems[] = $matches[1];
                } elseif (preg_match('/^\d+\.\s+(.+)$/', $line, $matches)) {
                    $isList = true;
                    $listItems[] = $matches[1];
                } else {
                    if (!empty($line)) {
                        $listItems[] = $line;
                    }
                }
            }

            if ($isList && !empty($listItems)) {
                $html[] = '<ul>';
                foreach ($listItems as $item) {
                    $html[] = '<li>' . nl2br(e($item), false) . '</li>';
                }
                $html[] = '</ul>';
                continue;
            }

            $html[] = '<p>' . nl2br(e($trimmed), false) . '</p>';
        }

        return implode('', $html);
    }

    private function isHeading(string $text): bool
    {
        if (strtoupper($text) === $text && strlen($text) < 100) {
            return true;
        }
        
        if (substr($text, -1) === ':') {
            return true;
        }
        
        if (preg_match('/^(\d+[\.\)]|\w\.)\s+/', $text)) {
            return true;
        }
        
        return false;
    }

    public function destroy(Upload $upload): \Illuminate\Http\Response
    {
        abort_unless(
            $upload->document->owner_id === Auth::id() ||
            $upload->document->sharedUsers()->whereKey(Auth::id())->exists(),
            403
        );

        Storage::delete($upload->path);
        $upload->delete();

        return response()->noContent();
    }
}