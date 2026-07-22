import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Editor from '@/components/editor/Editor';
import ShareModal from '@/components/documents/ShareModal';

interface Document {
    id: number;
    title: string;
    content: string;
    uploads: any[];
    sharedUsers: any[];
    owner_id: number;
}

interface Props {
    document: Document;
    currentUserId: number;
}

export default function Show({ document, currentUserId }: Props) {
    const [showShareModal, setShowShareModal] = useState(false);
    const isOwner = document.owner_id === currentUserId;

    return (
        <>
            <Head title={document.title} />

            <div className="w-full max-w-none space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex-1" />
                    <Button
                        onClick={() => setShowShareModal(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                        {document.sharedUsers && document.sharedUsers.length > 0 && (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {document.sharedUsers.length}
                            </span>
                        )}
                    </Button>
                </div>

                <Editor
                    documentId={document.id}
                    title={document.title}
                    content={document.content}
                />

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    documentId={document.id}
                    documentTitle={document.title}
                    sharedUsers={document.sharedUsers || []}
                    isOwner={isOwner}
                />
            </div>
        </>
    );
}