// resources/js/Pages/documents/Index.tsx
import { Head, router } from '@inertiajs/react';
import { FileUp, LoaderCircle, Plus, CheckCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import DocumentCard from '@/components/documents/DocumentCard';

interface Document {
    id: number;
    title: string;
    updated_at: string;
}

interface Props {
    documents: Document[];
    sharedDocuments: Document[];
}

export default function Index({ documents: initialDocuments, sharedDocuments: initialSharedDocuments }: Props) {
    const [documents, setDocuments] = useState(initialDocuments);
    const [sharedDocuments, setSharedDocuments] = useState(initialSharedDocuments);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        setDocuments(initialDocuments);
        setSharedDocuments(initialSharedDocuments);
    }, [initialDocuments, initialSharedDocuments]);

    const createDocument = () => {
        router.post('/documents', {}, {
            onSuccess: () => {
                toast.success('Document created successfully', {
                    position: 'top-right',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2000,
                });
            },
            onError: () => {
                toast.error('Failed to create document', {
                    position: 'top-right',
                    duration: 3000,
                });
            },
        });
    };

    const importDocument = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFile) {
            setUploadError('Choose a .txt, .md, or .docx file to import.');
            return;
        }

        const validExtensions = ['.txt', '.md', '.markdown', '.docx'];
        const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            setUploadError('Please upload a .txt, .md, or .docx file.');
            return;
        }

        const maxSize = fileExtension === '.docx' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            setUploadError(`Maximum file size is ${maxSize / (1024 * 1024)}MB for ${fileExtension} files.`);
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        setUploadError(null);

        router.post('/uploads', formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Document imported successfully', {
                    position: 'top-right',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 3000,
                });
                router.reload();
            },
            onError: (errors) => {
                setUploadError(errors.file ?? 'Upload failed. Please try another file.');
                toast.error('Import failed', {
                    position: 'top-right',
                    duration: 3000,
                    description: errors.file || 'Please try again',
                });
            },
            onFinish: () => {
                setUploading(false);
            },
        });
    };

    const handleDocumentDelete = (documentId: number) => {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    };

    const totalDocuments = documents.length + sharedDocuments.length;

    return (
        <>
            <Head title="Documents" />

            <div className="w-full max-w-none space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            My Documents
                        </h1>
                        <p className="text-muted-foreground">
                            {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} total
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={createDocument}>
                            <Plus className="h-4 w-4" />
                            New Document
                        </Button>
                    </div>
                </div>

                <form
                    onSubmit={importDocument}
                    className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h2 className="font-semibold">Import a document</h2>
                        <p className="text-sm text-muted-foreground">
                            Upload a .txt, .md, or .docx file and convert it into an editable document.
                        </p>
                        {uploadError && (
                            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={(event) => {
                                setSelectedFile(event.target.files?.[0] ?? null);
                                setUploadError(null);
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FileUp className="h-4 w-4" />
                            {selectedFile ? selectedFile.name : 'Choose file'}
                        </Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileUp className="h-4 w-4" />
                            )}
                            Import
                        </Button>
                    </div>
                </form>

                {/* Owned Documents */}
                {documents.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-3">My Documents</h2>
                        <div className="grid gap-4">
                            {documents.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    onDelete={handleDocumentDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {sharedDocuments.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Shared With Me</h2>
                        <div className="grid gap-4">
                            {sharedDocuments.map((document) => (
                                <DocumentCard
                                    key={document.id}
                                    document={document}
                                    isShared={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {totalDocuments === 0 && (
                    <div className="rounded-lg border p-10 text-center">
                        <p className="text-gray-500">No documents yet. Create your first document!</p>
                    </div>
                )}
            </div>
        </>
    );
}