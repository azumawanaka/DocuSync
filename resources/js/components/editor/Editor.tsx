import { router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDebounce } from '@/hooks/use-debounce';

import Toolbar from './Toolbar';
import StatusBar from './StatusBar';

interface Props {
    documentId: number;
    title: string;
    content: string;
}

export default function Editor({ documentId, title: initialTitle, content: initialContent }: Props) {
    const [title, setTitle] = useState(initialTitle);
    const [editorContent, setEditorContent] = useState(initialContent);
    
    const debouncedTitle = useDebounce(title, 800);
    const debouncedContent = useDebounce(editorContent, 800);
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const isSaving = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: {
                    HTMLAttributes: {
                        class: 'bold',
                    },
                },
                italic: {
                    HTMLAttributes: {
                        class: 'italic',
                    },
                },
                strike: {
                    HTMLAttributes: {
                        class: 'strike',
                    },
                },
                code: {
                    HTMLAttributes: {
                        class: 'code',
                    },
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing...',
            }),
        ],
        content: initialContent,
        immediatelyRender: false,

        onUpdate({ editor }) {
            setEditorContent(editor.getHTML());
        },
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    useEffect(() => {
        const titleChanged = debouncedTitle.trim() && debouncedTitle !== initialTitle;
        const contentChanged = debouncedContent && debouncedContent !== initialContent;

        if (!titleChanged && !contentChanged) {
            return;
        }

        if (isSaving.current) return;
        isSaving.current = true;

        setSaveStatus('saving');

        router.put(
            `/documents/${documentId}`,
            { 
                title: debouncedTitle,
                content: debouncedContent
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    isSaving.current = false;
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                },
                onError: (errors) => {
                    isSaving.current = false;
                    setSaveStatus('error');
                    console.error('Failed to save:', errors);
                    setTimeout(() => setSaveStatus('idle'), 3000);
                },
            },
        );
    }, [debouncedTitle, debouncedContent, documentId, initialTitle, initialContent]);

    useEffect(() => {
        if (initialTitle !== title) {
            setTitle(initialTitle);
        }
    }, [initialTitle]);

    useEffect(() => {
        if (initialContent !== editorContent) {
            setEditorContent(initialContent);
        }
    }, [initialContent]);

    if (!editor) return null;

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">

            <StatusBar saveStatus={saveStatus} />
    
            <div className="p-4 pb-2 mb-2 border-b-1 border-gray-200">
                <input
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-gray-300"
                    placeholder="Untitled Document"
                />
            </div>

            <Toolbar editor={editor} />

            <div className="min-h-[500px] p-6">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}