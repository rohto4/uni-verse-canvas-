'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Link } from '@tiptap/extension-link'
import { Youtube } from '@tiptap/extension-youtube'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import type { JSONContent } from '@tiptap/core'
import { ResizableImage } from '@/components/editor/extensions/ResizableImage'
import { ColumnLayout, ColumnItem } from '@/components/editor/extensions/ColumnLayout'

const lowlight = createLowlight(common)

interface ProjectContentProps {
  content: JSONContent
}

export function ProjectContent({ content }: ProjectContentProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: true }),
      Youtube.configure({ width: 640, height: 360 }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Subscript,
      Superscript,
      Color,
      TextStyle,
      HorizontalRule,
      ResizableImage,
      ColumnLayout,
      ColumnItem,
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
