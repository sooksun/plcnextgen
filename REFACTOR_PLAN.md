# Refactor Plan

This document outlines the specific tasks for Cursor AI to improve the codebase quality and maintainability.

## Phase 1: Type Safety & Organization
- [x] Create `/types/index.ts`.
- [x] Move `RecordItem`, `TranscriptLine`, `ShareLevel`, `ProposalStatus`, etc., from individual components to `/types/index.ts`.
- [x] Ensure all components import types from this central location.

## Phase 2: Component Decomposition & UI Adoption
- [x] **Adopt Existing UI Kit:** The project already has shadcn/ui components in `/components/ui`.
    - [x] Refactor `RecordsScreen.tsx` to use `Button`, `Input`, `Card`, `Badge`.
    - [x] Refactor `CuratorDashboardScreen.tsx` to use `Card`, `Button`, `Badge` (from `ui/badge.tsx` instead of manual classes).
- [x] **Feature Components:**
    - [x] Extract `AudioPlayer` from `RecordReviewScreen.tsx`.
    - [x] Extract `PipelineColumn` from `CuratorDashboardScreen.tsx`.
    - [x] Extract `RecordCard` from `RecordsScreen.tsx`.

## Phase 3: State Management (Hook-ification)
- [x] Create `/hooks` folder.
- [x] **`useSpeechRecognition`**: Encapsulate the Web Speech API logic from `RecordCaptureScreen.tsx`.
- [x] **`useNotes`**: Encapsulate the `localStorage` CRUD operations (`load`, `save`, `delete`, `search`).
    - Move the `window.addEventListener` logic inside this hook.
    - Provide a clean API: `const { notes, addNote, updateNote } = useNotes();`

## Phase 4: Code Cleanup
- [x] Remove hardcoded mock data in `CuratorDashboardScreen` and replace with data derived from `useNotes` (or keep mocks clearly separated in a `/data/mocks.ts` file).
- [x] Standardize color tokens. (Currently hardcoded as `bg-blue-600`, `text-purple-700`, etc. Consider using semantic names if possible, or consistent Tailwind utility patterns).

## Phase 5: Testing Preparation
- [x] Ensure all components accept `className` or `style` props for easier testing/layout adjustments.
- [x] Verify that `id`s used for keys are unique.
