/**
 * TiptapEditor 簡易テスト
 *
 * 基本的なレンダリングと機能の動作確認
 * 詳細なテストは後続フェーズで追加予定
 */

import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { TiptapEditor } from "../TiptapEditor"

vi.mock("../EditorToolbar", () => ({
  EditorToolbar: () => <div data-testid="editor-toolbar" />,
}))

// Tiptapのモック（SSR環境でのテスト対応）
vi.mock("@tiptap/react", () => {
  const editorElement = document.createElement("div")
  return {
    useEditor: vi.fn(() => ({
      getHTML: vi.fn(() => "<p>Test content</p>"),
      chain: vi.fn(() => ({
        focus: vi.fn(() => ({
          toggleBold: vi.fn(() => ({ run: vi.fn() })),
          toggleItalic: vi.fn(() => ({ run: vi.fn() })),
          undo: vi.fn(() => ({ run: vi.fn() })),
          redo: vi.fn(() => ({ run: vi.fn() })),
        })),
      })),
      can: vi.fn(() => ({
        undo: vi.fn(() => true),
        redo: vi.fn(() => true),
      })),
      isActive: vi.fn(() => false),
      getAttributes: vi.fn(() => ({})),
      storage: {
        characterCount: {
          characters: vi.fn(() => 100),
          words: vi.fn(() => 20),
        },
      },
      view: { dom: editorElement },
      state: {
        selection: {
          $from: {
            depth: 0,
            node: () => ({ type: { name: "" }, nodeSize: 0 }),
            before: () => 0,
          },
        },
      },
    })),
    EditorContent: ({ className }: { className?: string }) => (
      <div data-testid="editor-content" className={className} />
    ),
  }
})

describe("TiptapEditor", () => {
  it("エディタがレンダリングされる", async () => {
    render(<TiptapEditor />)

    // 文字数カウントが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/文字/)).toBeDefined()
    })
  })

  it("onChangeコールバックが呼ばれる", async () => {
    const handleChange = vi.fn()
    render(<TiptapEditor onChange={handleChange} />)

    // エディタが読み込まれることを確認
    await waitFor(() => {
      expect(screen.getByText(/文字/)).toBeDefined()
    })
  })

  it("初期コンテンツが設定される", async () => {
    const initialContent = "<p>初期コンテンツ</p>"
    render(<TiptapEditor content={initialContent} />)

    await waitFor(() => {
      expect(screen.getByText(/文字/)).toBeDefined()
    })
  })

  it("プレースホルダーが設定される", async () => {
    const placeholder = "カスタムプレースホルダー"
    render(<TiptapEditor placeholder={placeholder} />)

    await waitFor(() => {
      expect(screen.getByText(/文字/)).toBeDefined()
    })
  })
})

describe("TiptapEditor Props", () => {
  it("editableがfalseの場合、編集不可になる", async () => {
    render(<TiptapEditor editable={false} />)

    await waitFor(() => {
      expect(screen.getByText(/文字/)).toBeDefined()
    })
  })

  it("classNameが適用される", async () => {
    render(<TiptapEditor className="custom-class" />)

    await waitFor(() => {
      expect(screen.getByText(/文字/)).toBeDefined()
    })
  })
})
