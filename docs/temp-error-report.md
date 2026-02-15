# Temporary Error Report (2026-02-15)

This file consolidates all current linting and TypeScript errors found in the project.

## Summary

- **TypeScript Errors (`tsc --noEmit`):** 45
- **Lint Problems (`eslint`):** 24 (17 errors, 7 warnings)

*Note: There is an overlap between these two lists. TypeScript errors are higher priority.*

---

## 1. TypeScript Compiler Errors (`tsc --noEmit`)

### Critical Errors (Breaking Changes)
- **File**: `src/app/(admin)/admin/projects/page.tsx`
  - **Error**: `Property 'map' does not exist on type 'PaginatedProjects'`.
  - **Reason**: `getProjects` was refactored to return `{ projects: [], pagination: {} }`. Code needs to access `result.projects`.
  - **Fix**: Change `projects.map` to `projects.projects.map`.
- **File**: `src/app/(public)/works/page.tsx`
  - **Error**: `Type 'string[]' is not assignable to type '("completed" | "archived" | "registered")[]'`.
  - **Reason**: `statusFilter` needs to be correctly typed.
  - **Fix**: Cast `statusFilter` to the correct type.
- **File**: `src/lib/actions/posts.ts`, `src/lib/actions/projects.ts`, `src/lib/actions/in-progress.ts`
  - **Error**: Multiple errors like `Property 'slug' does not exist on type 'never'`.
  - **Reason**: Supabase client queries are not correctly typed, leading to `never` type inference.
  - **Fix**: Apply explicit types from `types/database.ts` to query results and function signatures. (Partially done, will complete).
- **File**: `src/types/database.ts`
  - **Error**: `Unexpected any`.
  - **Reason**: A type is defined as `any`.
  - **Fix**: Replace `any` with a more specific type, likely `JSONContent` from Tiptap.

### Test Setup Errors
- **File**: `src/components/editor/__tests__/TiptapEditor.test.tsx`
  - **Error**: `Cannot find module 'vitest'`, `Cannot find module '@testing-library/react'`.
  - **Reason**: Required dev dependencies for testing are not installed.
  - **Fix**: Install `vitest`, `@testing-library/react`, and `jsdom` as dev dependencies.

### Other Type Errors
- **File**: `docs/mocks/admin/admin/dashboard/page.tsx`
  - **Error**: `This comparison appears to be unintentional...`.
  - **Fix**: Correct the logic in the comparison.
- **File**: `src/components/editor/extensions/ResizableImage.tsx`
  - **Error**: Incompatible return types in `addOptions`.
  - **Fix**: Correct the type definition.
- **File**: `src/components/editor/extensions/TableWithDelete.tsx`
  - **Error**: `Property 'node' does not exist on type 'Selection'`.
  - **Fix**: Use a type guard or appropriate method to access the node.

---

## 2. ESLint Errors & Warnings

### Critical Errors
- **File**: `src/components/admin/TechStackInput.tsx`, `src/app/(admin)/admin/posts/preview/page.tsx`
  - **Error**: `react-hooks/set-state-in-effect`.
  - **Reason**: Calling `setState` directly inside a `useEffect` hook.
  - **Fix**: Refactor to use a `useState` initializer function that reads from `localStorage` or correctly handle prop-to-state synchronization.

### Other `any` type errors
- **Files**: Various, including `src/app/api/backup/route.ts`, `src/components/admin/ProjectForm.tsx`, `src/components/projects/TechStackChart.tsx`, etc.
  - **Error**: `@typescript-eslint/no-explicit-any`.
  - **Reason**: Use of the `any` type.
  - **Fix**: Replace `any` with specific types.

### Warnings
- **Files**: Various.
  - **Warning**: `@typescript-eslint/no-unused-vars`, `react-hooks/exhaustive-deps`, `@next/next/no-img-element`.
  - **Reason**: Unused variables, missing dependency array entries, using `<img>` instead of `<Image>`.
  - **Fix**: Remove unused variables, add dependencies to hooks, and switch to `next/image`.

---
