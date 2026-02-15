'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import type { JSONContent } from '@tiptap/core'
import { ResizableImage } from '@/components/editor/extensions/ResizableImage'
import { ColumnLayout, ColumnItem } from '@/components/editor/extensions/ColumnLayout'
import Heading from '@tiptap/extension-heading'
import { mergeAttributes } from '@tiptap/core'

const lowlight = createLowlight(common)

// Helper to create a slug from text, must be same as in TableOfContents
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface PostContentProps {
  content: JSONContent
}

export function PostContent({ content }: PostContentProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to use custom one
      }),
      Heading.extend({
        renderHTML({ node, HTMLAttributes }) {
          const hasLevel = this.options.levels.includes(node.attrs.level)
          const level = hasLevel ? node.attrs.level : this.options.levels[0]

          if (level === 2 || level === 3) {
            const id = slugify(node.textContent)
            return [
                `h${level}`,
                mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { id }),
                0,
            ]
          }
          return [
            `h${level}`,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0,
          ]
        },
      }).configure({ levels: [1, 2, 3, 4] }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: true, autolink: true }),
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
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} className="tiptap" />
}
