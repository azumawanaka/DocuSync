import { useState, useRef } from 'react';
import { Upload, X, FileText, File, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface UploadFile {
    id: number;
    original_name: string;
    stored_name: string;
    mime_type: string;
    size: number;
    path: string;
    created_at: string;
}

interface Props {
    documentId: number;
    uploads: UploadFile[];
    onUpload?: () => void;
}

export default function FileUpload({ documentId, uploads = [], onUpload }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const uploadFile = (file: File) => {
        // 2MB max from controller
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File too large', {
                description: 'Maximum file size is 2MB',
            });
            return;
        }

        const allowedTypes = ['text/plain', 'text/markdown'];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|markdown)$/i)) {
            toast.error('Unsupported file type', {
                description: 'Only .txt, .md, and .markdown files are supported',
            });
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        router.post(
            `/documents/uploads`,
            formData,
            {
                preserveScroll: true,
                preserveState: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onSuccess: () => {
                    setIsUploading(false);
                    toast.success('File imported successfully!', {
                        description: 'Your document has been created from the imported file.',
                    });
                    if (onUpload) onUpload();
                },
                onError: (errors) => {
                    setIsUploading(false);
                    toast.error('Import failed', {
                        description: errors.message || 'Please try again',
                    });
                },
            }
        );
    };

    const handleDelete = (uploadId: number) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        router.delete(`/uploads/${uploadId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('File deleted');
                if (onUpload) onUpload();
            },
            onError: () => {
                toast.error('Failed to delete file');
            },
        });
    };

    const getFileIcon = (mimeType: string, fileName: string) => {
        if (fileName.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            return <File className="h-4 w-4 text-blue-500" />;
        }
        if (fileName.match(/\.(txt|md|markdown)$/i)) {
            return <FileText className="h-4 w-4 text-green-500" />;
        }
        return <File className="h-4 w-4 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".txt,.md,.markdown"
                />

                <div className="flex flex-col items-center gap-2">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-600">Importing file...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-600">
                                Drag & drop a file here, or{' '}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    browse
                                </button>
                            </p>
                            <p className="text-xs text-gray-400">
                                Supports: .txt, .md, .markdown (max 2MB)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {uploads.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                        Attachments ({uploads.length})
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {uploads.map((upload) => (
                            <div
                                key={upload.id}
                                className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {getFileIcon(upload.mime_type, upload.original_name)}
                                    <span className="text-sm text-gray-700 truncate">
                                        {upload.original_name}
                                    </span>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        ({formatFileSize(upload.size)})
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(upload.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}