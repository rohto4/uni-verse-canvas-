/**
 * ColumnLayout - 二段組レイアウト拡張
 *
 * PC: 左右に並べて表示
 * スマホ: スワイプ切替 or 同時表示（縦スタック）を切り替え可能
 */

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react"
import { useState, useRef } from "react"
import { Columns2, Rows2, ChevronLeft, ChevronRight } from "lucide-react"

// カラムラッパーノード
export const ColumnLayout = Node.create({
  name: "columnLayout",
  group: "block",
  content: "columnItem columnItem",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column-layout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column-layout",
        class: "column-layout-wrapper",
      }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnLayoutView)
  },
})

// 各カラムノード
export const ColumnItem = Node.create({
  name: "columnItem",
  group: "",
  content: "block+",
  defining: true,
  isolating: true,

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
})

// React コンポーネント: カラムレイアウトビュー
function ColumnLayoutView() {
  const [viewMode, setViewMode] = useState<"side" | "stack">("side")
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)

  const toggleViewMode = () => {
    setViewMode(viewMode === "side" ? "stack" : "side")
  }

  // スワイプハンドラー（モバイル用）
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < 1) {
        setCurrentIndex(1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(0)
      }
    }
  }

  return (
    <NodeViewWrapper className="column-layout-outer">
      {/* コントロールバー */}
      <div className="column-controls">
        <span className="column-label">二段組</span>
        <div className="column-control-buttons">
          <button
            type="button"
            onClick={toggleViewMode}
            className={`column-mode-btn ${viewMode === "side" ? "active" : ""}`}
            title="横並び表示"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleViewMode}
            className={`column-mode-btn ${viewMode === "stack" ? "active" : ""}`}
            title="縦積み表示"
          >
            <Rows2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* コンテンツ領域 */}
      <div
        className={`column-content ${viewMode === "stack" ? "column-stack" : "column-side"}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <NodeViewContent className="column-inner" />
      </div>

      {/* モバイル用ナビゲーション（スワイプモード時） */}
      <div className="column-mobile-nav">
        <button
          type="button"
          onClick={() => setCurrentIndex(0)}
          className={`column-nav-dot ${currentIndex === 0 ? "active" : ""}`}
        />
        <button
          type="button"
          onClick={() => setCurrentIndex(1)}
          className={`column-nav-dot ${currentIndex === 1 ? "active" : ""}`}
        />
      </div>
    </NodeViewWrapper>
  )
}

export default ColumnLayout
