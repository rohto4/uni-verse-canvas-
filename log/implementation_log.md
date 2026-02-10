# Implementation Log (Updated)

## 2026-02-10: Article CRUD Implementation (Completed)

### Implemented Features (Step 3 & 4)
1.  **Admin Post List (`src/app/(admin)/admin/posts/page.tsx`)**
    - Replaced mock data with `getPosts` Server Action.
    - Implemented search and status filter.
    - Implemented delete functionality with confirmation.

2.  **Admin Post Edit (`src/app/(admin)/admin/posts/[id]/page.tsx`)**
    - Implemented data fetching using `getPostById` and `useParams`.
    - Integrated `updatePost` Server Action.
    - Added delete button in edit page.
    - Reused `TiptapEditor` logic from Create page.

3.  **Refactoring**
    - Added `getPostById` to `src/lib/actions/posts.ts`.
    - Fixed Tiptap JSON handling in editor integration.

### Remaining Issues
- **Image Upload**: Still placeholder UI. Need to implement Supabase Storage upload.
- **Type Definitions**: `never` type errors in Server Actions due to `supabase-js` type mismatch. Bypassed with `as any` casting.
- **Pagination UI**: Not implemented in Admin List yet (backend supports it).
