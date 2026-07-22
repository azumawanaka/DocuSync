import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { X, Edit2, Eye, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SharedUser {
    id: number;
    name: string;
    email: string;
    pivot: {
        permission: string;
    };
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    documentId: number;
    documentTitle: string;
    sharedUsers: SharedUser[];
    isOwner: boolean;
}

export default function ShareModal({ 
    isOpen, 
    onClose, 
    documentId, 
    documentTitle,
    sharedUsers,
    isOwner 
}: Props) {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit'>('view');
    const [isSharing, setIsSharing] = useState(false);

    if (!isOpen) return null;

    const handleShare = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setIsSharing(true);

        router.post(
            `/documents/${documentId}/share`,
            {
                email: email.trim(),
                permission: permission,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsSharing(false);
                    setEmail('');
                    toast.success('Document shared successfully!');
                },
                onError: (errors) => {
                    setIsSharing(false);
                    toast.error('Failed to share document', {
                        description: errors.message || 'Please try again',
                    });
                },
            }
        );
    };

    const handleRemoveShare = (userId: number, userName: string) => {
        if (!confirm(`Remove ${userName} from this document?`)) return;

        router.delete(`/documents/${documentId}/share/${userId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('User removed successfully');
            },
            onError: () => {
                toast.error('Failed to remove user');
            },
        });
    };

    const handleUpdatePermission = (userId: number, currentPermission: string) => {
        const newPermission = currentPermission === 'view' ? 'edit' : 'view';
        
        router.put(
            `/documents/${documentId}/share/${userId}`,
            { permission: newPermission },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(`Permission updated to ${newPermission}`);
                },
                onError: () => {
                    toast.error('Failed to update permission');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Share Document</h3>
                    <p className="text-sm text-gray-500">{documentTitle}</p>
                </div>

                {isOwner ? (
                    <form onSubmit={handleShare} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Email
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter user email"
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isSharing}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Permission
                            </label>
                            <select
                                value={permission}
                                onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSharing}
                            >
                                <option value="view">View Only</option>
                                <option value="edit">Can Edit</option>
                            </select>
                        </div>

                        <Button type="submit" disabled={isSharing} className="w-full">
                            {isSharing ? 'Sharing...' : 'Share Document'}
                        </Button>
                    </form>
                ) : (
                    <p className="text-sm text-gray-500">
                        You are a shared user. Only the owner can manage sharing.
                    </p>
                )}

                {sharedUsers.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Shared With ({sharedUsers.length})
                        </h4>
                        <div className="space-y-2">
                            {sharedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="rounded-full bg-blue-100 p-1.5 flex-shrink-0">
                                            <User className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            user.pivot.permission === 'edit' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {user.pivot.permission === 'edit' ? 'Can Edit' : 'View Only'}
                                        </span>

                                        {isOwner && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdatePermission(user.id, user.pivot.permission)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Toggle permission"
                                                >
                                                    {user.pivot.permission === 'edit' ? (
                                                        <Eye className="h-4 w-4" />
                                                    ) : (
                                                        <Edit2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveShare(user.id, user.name)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Remove user"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}