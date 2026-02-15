import Image from "@tiptap/extension-image"
import type { ImageOptions } from "@tiptap/extension-image"
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import React from "react"

const ResizableImageView = ({ node, updateAttributes, selected }: NodeViewProps) => {
  const [isResizing, setIsResizing] = React.useState(false)
  const [startWidth, setStartWidth] = React.useState(0)
  const [startX, setStartX] = React.useState(0)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // 初回レンダリング時にwidthが未設定なら600pxをデフォルトに
  React.useEffect(() => {
    if (!node.attrs.width && imgRef.current) {
      imgRef.current.onload = () => {
        const naturalWidth = imgRef.current?.naturalWidth || 600
        const defaultWidth = Math.min(600, naturalWidth)
        updateAttributes({ width: defaultWidth })
      }
    }
  }, [node.attrs.width, updateAttributes])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(imgRef.current?.width || 0)

    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current) return
      const diff = e.clientX - startX
      const newWidth = Math.max(100, Math.min(1600, startWidth + diff))
      updateAttributes({ width: newWidth })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <NodeViewWrapper className="resizable-image-wrapper">
      <div
        className={`resizable-image-container ${isResizing ? "resizing" : ""} ${selected ? "selected" : ""}`}
        style={{ width: node.attrs.width ? `${node.attrs.width}px` : "auto" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className="rounded-lg max-w-full h-auto"
          style={{
            width: node.attrs.width ? `${node.attrs.width}px` : "auto",
            height: "auto",
          }}
          draggable={false}
        />
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          title="ドラッグしてリサイズ"
        />
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Image.extend({
  name: "resizableImage",

  addOptions() {
    return {
      ...(this.parent?.() as ImageOptions),
      inline: false,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {}
          const element = dom as HTMLElement
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width'),
          }
        },
      },
      {
        tag: 'div[data-type="resizable-image"]',
        contentElement: 'img',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {}
          const element = dom as HTMLElement
          const img = element.querySelector('img')
          if (!img) return {}
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'img',
      {
        ...HTMLAttributes,
        src: node.attrs.src,
        alt: node.attrs.alt,
        title: node.attrs.title,
        width: node.attrs.width,
      },
    ]
  },
})
