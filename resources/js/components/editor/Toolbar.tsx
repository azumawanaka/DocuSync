import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Underline,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Undo2,
    Redo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    editor: Editor;
}

export default function Toolbar({ editor }: Props) {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!editor) return;

        const updateHandler = () => {
            forceUpdate({});
        };

        editor.on('update', updateHandler);
        editor.on('selectionUpdate', updateHandler);
        editor.on('transaction', updateHandler);

        return () => {
            editor.off('update', updateHandler);
            editor.off('selectionUpdate', updateHandler);
            editor.off('transaction', updateHandler);
        };
    }, [editor]);


    return (
        <div className="flex flex-wrap items-center gap-2 border-b p-2">

            <Button
                type="button"
                variant={editor.isActive('bold') ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant={editor.isActive('italic') ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant={editor.isActive('underline') ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant={editor.isActive('bulletList') ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant={editor.isActive('orderedList') ? 'default' : 'outline'}
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo2 className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo2 className="h-4 w-4" />
            </Button>
        </div>
    );
}