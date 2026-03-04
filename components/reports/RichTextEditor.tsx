'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? 'Escreva o conteúdo do relatório...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] text-sm text-white/80',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const toolbarBtn = (action: () => void, active: boolean, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={action}
      className={`p-1.5 transition-colors ${active ? 'text-white bg-white/10' : 'text-white/30 hover:text-white'}`}
    >
      {icon}
    </button>
  )

  return (
    <div className="border border-[#222] bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#222] flex-wrap">
        {toolbarBtn(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive('bold'),
          <Bold size={14} />
        )}
        {toolbarBtn(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive('italic'),
          <Italic size={14} />
        )}
        <div className="w-px h-4 bg-[#333] mx-1" />
        {toolbarBtn(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive('heading', { level: 2 }),
          <Heading2 size={14} />
        )}
        {toolbarBtn(
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          editor.isActive('heading', { level: 3 }),
          <Heading3 size={14} />
        )}
        <div className="w-px h-4 bg-[#333] mx-1" />
        {toolbarBtn(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive('bulletList'),
          <List size={14} />
        )}
        {toolbarBtn(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive('orderedList'),
          <ListOrdered size={14} />
        )}
        {toolbarBtn(
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive('blockquote'),
          <Quote size={14} />
        )}
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
