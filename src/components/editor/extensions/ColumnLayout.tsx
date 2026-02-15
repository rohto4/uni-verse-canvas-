import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react"
import React from "react"
import { Columns2, Rows2, X } from "lucide-react"

export const ColumnLayout = Node.create({
  name: "columnLayout",
  group: "block",
  content: "columnItem columnItem",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      bgColor: {
        default: "none",
        parseHTML: (element) => element.getAttribute("data-bg-color") || "none",
        renderHTML: (attributes) => {
          return {
            "data-bg-color": attributes.bgColor,
          }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="column-layout"]' }]
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column-layout",
        "data-bg-color": node.attrs.bgColor,
        class: "column-layout-wrapper",
      }),
      0,
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ColumnLayoutView)
  },
})

export const ColumnItem = Node.create({
  name: "columnItem",
  content: "block+",
  defining: true,
  isolating: true,
  selectable: false,
  parseHTML() {
    return [{ tag: 'div[data-type="column-item"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column-item",
        class: "column-item",
      }),
      0,
    ]
  },
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        if ($from.parent.type.name === this.name && $from.parent.content.size === 0) {
          return false
        }
        return false
      },
    }
  },
})

function ColumnLayoutView({ node, deleteNode }: any) {
  const [viewMode, setViewMode] = React.useState<"side" | "stack">("side")
  const bgColor = node.attrs.bgColor || "none"

  return (
    <NodeViewWrapper className="column-layout-outer">
      <div className="column-controls">
        <span className="column-label">二段組レイアウト</span>
        <div className="column-control-buttons">
          <button
            type="button"
            onClick={() => setViewMode("side")}
            className={`column-mode-btn ${viewMode === "side" ? "active" : ""}`}
            title="横並び表示"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("stack")}
            className={`column-mode-btn ${viewMode === "stack" ? "active" : ""}`}
            title="縦積み表示"
          >
            <Rows2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={deleteNode}
            className="column-delete-btn"
            title="削除"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div
        className={`column-content ${viewMode === "stack" ? "column-stack" : "column-side"}`}
        data-bg-color={bgColor}
      >
        <NodeViewContent className="column-inner" />
      </div>
    </NodeViewWrapper>
  )
}

export default ColumnLayout
