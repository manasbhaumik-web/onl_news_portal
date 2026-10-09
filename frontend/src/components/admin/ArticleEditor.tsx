import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Heading2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface ArticleEditorProps {
  initialContent?: string;
  onSave: (content: string, title: string) => void;
  isSaving?: boolean;
}

export default function ArticleEditor({ initialContent = '', onSave, isSaving }: ArticleEditorProps) {
  const [title, setTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <input
          type="text"
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 mb-4"
        />
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 flex gap-2 overflow-x-auto">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('heading') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <Heading2 className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <Bold className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <Italic className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-2" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <List className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <ListOrdered className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 self-center mx-2" />
        <button onClick={addLink} className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <LinkIcon className="w-5 h-5" />
        </button>
        <button onClick={addImage} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>

      <EditorContent editor={editor} />

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
        <Button 
          disabled={!title || editor.isEmpty || isSaving}
          onClick={() => onSave(editor.getHTML(), title)}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
      </div>
    </div>
  );
}
