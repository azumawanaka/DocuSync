<?php

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated users can import a text file as an editable document', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->createWithContent(
        'meeting-notes.txt',
        "Kickoff notes\nNext step: review draft"
    );

    $response = $this->actingAs($user)->post(route('uploads.store'), [
        'file' => $file,
    ]);

    $document = Document::query()->firstOrFail();

    $response->assertRedirect(route('documents.show', $document));
    expect($document->owner_id)->toBe($user->id)
        ->and($document->title)->toBe('meeting-notes')
        ->and($document->content)->toBe('<p>Kickoff notes<br>Next step: review draft</p>')
        ->and($document->uploads)->toHaveCount(1);

    Storage::disk('local')->assertExists($document->uploads->first()->path);
});

test('document imports only accept text and markdown files', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('photo.jpg', 10, 'image/jpeg');

    $this->actingAs($user)->post(route('uploads.store'), [
        'file' => $file,
    ])->assertSessionHasErrors('file');
});
