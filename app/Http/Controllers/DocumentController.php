<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(): Response
    {
        $ownedDocuments = Auth::user()->ownedDocuments()->latest()->get();
        $sharedDocuments = Auth::user()->sharedDocuments()->latest()->get();

        return Inertia::render('documents/index', [
            'documents' => $ownedDocuments,
            'sharedDocuments' => $sharedDocuments,
        ]);
    }

    public function store(): RedirectResponse
    {
        $document = Document::create([
            'owner_id' => Auth::id(),
            'title' => 'Untitled Document',
            'content' => '',
        ]);

        return redirect()->route('documents.show', $document);
    }

    public function show(Document $document): Response
    {
        $this->authorizeDocument($document);

        return Inertia::render('documents/show', [
            'document' => $document->load(['uploads', 'sharedUsers']),
            'currentUserId' => Auth::id(),
        ]);
    }

    public function update(Request $request, Document $document)
    {
        abort_unless(
            $document->owner_id === Auth::id() ||
            $document->sharedUsers()->whereKey(Auth::id())->exists(),
            403
        );

        try {
            $data = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'content' => ['nullable', 'string'],
            ]);

            $document->update($data);

            return redirect()->back();
        } catch (\Exception $e) {
            \Log::error('Update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    public function destroy(Document $document)
    {
        abort_unless(
            $document->owner_id === Auth::id(),
            403
        );

        $document->uploads()->delete();
        $document->sharedUsers()->detach();
        $document->delete();

        return redirect()->back();
    }

    public function share(Request $request, Document $document): RedirectResponse
    {
        abort_unless($document->owner_id === Auth::id(), 403);

        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'permission' => ['required', 'in:view,edit'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot share a document with yourself.');
        }

        if ($document->sharedUsers()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with('error', 'This user already has access to the document.');
        }

        $document->sharedUsers()->attach($user->id, [
            'permission' => $request->permission,
        ]);

        return redirect()->back()->with('success', 'Document shared successfully!');
    }

    public function updateShare(Request $request, Document $document, User $user): RedirectResponse
    {
        abort_unless($document->owner_id === Auth::id(), 403);

        $request->validate([
            'permission' => ['required', 'in:view,edit'],
        ]);

        $document->sharedUsers()->updateExistingPivot($user->id, [
            'permission' => $request->permission,
        ]);

        return redirect()->back()->with('success', 'Permission updated successfully!');
    }

    public function removeShare(Document $document, User $user): RedirectResponse
    {
        abort_unless($document->owner_id === Auth::id(), 403);

        $document->sharedUsers()->detach($user->id);

        return redirect()->back()->with('success', 'User removed from document.');
    }

    private function authorizeDocument(Document $document)
    {
        abort_unless(
            $document->owner_id === Auth::id() ||
            $document->sharedUsers()->whereKey(Auth::id())->exists(),
            403
        );
    }
}