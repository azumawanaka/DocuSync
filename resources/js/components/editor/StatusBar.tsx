import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Props {
    saveStatus: string;
}

export default function StatusBar({ saveStatus }: Props) {
    return (
        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-1.5">
            <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saving' && (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-gray-500">Saving...</span>
                    </>
                )}
                {saveStatus === 'saved' && (
                    <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Saved</span>
                    </>
                )}
                {saveStatus === 'error' && (
                    <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Save failed</span>
                    </>
                )}
                {saveStatus === 'idle' && (
                    <span className="text-xs text-gray-400">All changes saved</span>
                )}
            </div>
            <span className="text-xs text-gray-400">
                {new Date().toLocaleTimeString()}
            </span>
        </div>
    );
}