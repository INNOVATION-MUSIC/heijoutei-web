'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image as TiptapImage } from '@tiptap/extension-image'
import { Link as TiptapLink } from '@tiptap/extension-link'
import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

function ToolbarButton({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs transition-colors ${
        active ? 'bg-[#d9b86b]/20 text-[#d9b86b]' : 'text-[#9a9aa8] hover:bg-white/5 hover:text-[#ebe5db]'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${crypto.randomUUID()}.${ext}`
    const { data, error } = await supabase.storage.from('media').upload(filename, file, { contentType: file.type })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
      editor.chain().focus().setImage({ src: publicUrl }).run()
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function setLink() {
    const url = window.prompt('リンク先URL')
    if (url === null) return
    if (url === '') editor.chain().focus().unsetLink().run()
    else editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[#2f2f3c] px-2 py-1.5">
      <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>太字</ToolbarButton>
      <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>斜体</ToolbarButton>
      <span className="mx-1 h-4 w-px bg-[#2f2f3c]" />
      <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
      <ToolbarButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
      <span className="mx-1 h-4 w-px bg-[#2f2f3c]" />
      <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• 箇条書き</ToolbarButton>
      <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. 番号</ToolbarButton>
      <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>引用</ToolbarButton>
      <span className="mx-1 h-4 w-px bg-[#2f2f3c]" />
      <ToolbarButton active={editor.isActive('link')} onClick={setLink}>リンク</ToolbarButton>
      <ToolbarButton onClick={() => fileRef.current?.click()}>画像</ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>罫線</ToolbarButton>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
    </div>
  )
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false, // Next SSR でのハイドレーション不整合を防ぐ
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false }),
      TiptapLink.configure({ openOnClick: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-60 px-4 py-3 focus:outline-none text-[#ebe5db]',
      },
    },
  })

  if (!editor) {
    return <div className="min-h-72 rounded-lg border border-[#2f2f3c] bg-[#0a0a0f]" />
  }

  return (
    <div className="rounded-lg border border-[#2f2f3c] bg-[#0a0a0f]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
