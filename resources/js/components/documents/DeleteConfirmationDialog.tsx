import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    documentTitle: string;
}

export default function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    documentTitle,
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-red-100 p-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Delete Document</h3>
                </div>

                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "{documentTitle}"? <br/>This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}