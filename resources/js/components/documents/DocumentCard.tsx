import { Link, router } from '@inertiajs/react';
import { FileText, Trash2, CheckCircle, Users, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Document {
    id: number;
    title: string;
    updated_at: string;
    owner_id?: number;
}

interface Props {
    document: Document;
    onDelete?: (id: number) => void;
    isShared?: boolean;
}

export default function DocumentCard({ document, onDelete, isShared = false }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
            return;
        }

        setIsDeleting(true);

        router.delete(`/documents/${document.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsDeleting(false);
            },
            onSuccess: () => {
                toast.success('Document deleted successfully', {
                    position: 'top-right',
                    duration: 3000,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                });
                if (onDelete) onDelete(document.id);
            },
            onError: (errors) => {
                toast.error('Failed to delete document', {
                    position: 'top-right',
                    duration: 3000,
                    description: errors.message || 'Please try again',
                });
            },
        });
    };

    return (
        <Link href={`/documents/${document.id}`}>
            <Card className="transition-all hover:shadow-md hover:-translate-y-1 relative">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-lg bg-muted p-3 relative">
                        <FileText className="h-6 w-6" />
                        {isShared && (
                            <div className="absolute -top-1 -right-1">
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold">
                                {document.title}
                            </h2>
                            {isShared && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    Shared
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {new Date(document.updated_at).toLocaleString()}
                        </p>
                    </div>

                    {!isShared && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}