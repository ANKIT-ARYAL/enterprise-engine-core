'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useCallback } from 'react';

export function RichTextEditor({ content, onChange }: { content: string, onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      editor?.chain().focus().setImage({ src: data.url }).run();
    } else {
      alert('Upload failed');
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-[var(--radius)] overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex gap-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-semibold">B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-sm italic">I</button>
        <label className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-sm cursor-pointer text-blue-600 font-semibold">
          Upload Img
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files?.[0]) uploadImage(e.target.files[0]);
            }} 
          />
        </label>
      </div>
      <div className="p-4 min-h-[200px] prose dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
