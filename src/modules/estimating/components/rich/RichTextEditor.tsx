import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { emptyDoc, ensureDocJson } from './tiptapHelpers';

export function RichTextEditor({
  value,
  onChange,
  minHeight = 140,
}: {
  value: any;
  onChange: (next: any) => void;
  minHeight?: number;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: ensureDocJson(value),
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none',
        style: `min-height:${minHeight}px;`,
      },
    },
  });

  useEffect(() => {
    if (editor && value) {
      const current = editor.getJSON();
      const next = ensureDocJson(value);
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        editor.commands.setContent(next);
      }
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rounded border">
      <div className="border-b p-2 flex flex-wrap gap-2 text-xs">
        <button type="button" className="px-2 py-1 rounded border hover:bg-slate-50" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className="px-2 py-1 rounded border hover:bg-slate-50" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className="px-2 py-1 rounded border hover:bg-slate-50" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullets
        </button>
        <button type="button" className="px-2 py-1 rounded border hover:bg-slate-50" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbered
        </button>
        <button type="button" className="px-2 py-1 rounded border hover:bg-slate-50" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className="px-2 py-1 rounded border hover:bg-slate-50" onClick={() => editor.chain().focus().setParagraph().run()}>
          P
        </button>
      </div>
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

