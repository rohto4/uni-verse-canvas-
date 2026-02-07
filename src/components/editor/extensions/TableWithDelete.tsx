import { Table } from "@tiptap/extension-table"
import { Plugin, PluginKey } from "@tiptap/pm/state"

export const TableWithDelete = Table.extend({
  name: "table",

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      new Plugin({
        key: new PluginKey('tableDelete'),
        props: {
          handleKeyDown: (view, event) => {
            const { state, dispatch } = view
            const { selection } = state
            const { $from, empty } = selection

            // Deleteキー: テーブル全体が選択されている場合に削除
            if (event.key === 'Delete') {
              if (selection.node?.type.name === 'table') {
                const tr = state.tr.deleteSelection()
                dispatch(tr)
                return true
              }
            }

            // Backspaceキー: テーブル直後の段落先頭で押された場合に削除
            if (event.key === 'Backspace' && empty && $from.parentOffset === 0) {
              const nodeBefore = $from.nodeBefore
              if (nodeBefore && nodeBefore.type.name === 'table') {
                const pos = $from.pos - nodeBefore.nodeSize
                const tr = state.tr.delete(pos - 1, $from.pos - 1)
                dispatch(tr)
                return true
              }
            }

            return false
          },
        },
      }),
    ]
  },
})
