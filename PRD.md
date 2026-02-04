# Product Requirement Document (PRD): School Knowledge Management App

## 1. Executive Summary
The School Knowledge Management (KM) App is a "Mobile First" web application designed to help teachers capture, organize, and share tacit knowledge effortlessly. Unlike traditional KM systems that require formal writing, this app focuses on **Voice-to-Text** and **AI-Assisted Reflection** to lower the barrier of entry. It supports a flow from "Personal Knowledge" to "Group Wisdom (PLC)" and finally to "Institutional Knowledge (Curator)".

## 2. User Roles
1.  **Teacher:** The primary creator. Captures daily insights, reflections, and teaching techniques.
2.  **Curator (Admin/Head of Academic):** The editor. Reviews high-value proposals, organizes the school's knowledge pipeline, and verifies "Best Practices".

## 3. Core User Flows
### 3.1. The "Capture" Flow
- **Goal:** Capture knowledge immediately after an event (e.g., a class, a meeting).
- **Methods:**
    - **Voice Record:** Real-time Speech-to-Text (Web Speech API).
    - **Quick Note:** Typing with tag selection.
- **Output:** A draft record in the review state.

### 3.2. The "Review & Reflect" Flow
- **Goal:** Turn raw data into structured insight.
- **Features:**
    - Playback audio.
    - Read transcript.
    - **AI Reflection (Mockup):** System generates "Key Points", "Questions", and "Suggestions" automatically.
    - **Decision:** Save as Private (Vault), Share to PLC (Team), or Submit as Proposal (School).

### 3.3. The "Curator" Flow
- **Goal:** Manage the school's knowledge assets.
- **Dashboard:**
    - **Inbox:** Incoming proposals from teachers.
    - **Pipeline:** Tracks status (Proposed -> In Trial -> Tested -> Recommended).
    - **Analytics:** Heatmap of hot topics (e.g., "Active Learning").

## 4. Functional Requirements

### 4.1. Frontend / UI
- **Mobile First:** Optimized for `max-w-md` but functional on desktop.
- **Responsiveness:** Tailwind CSS v4.
- **Navigation:** Bottom tab bar for Teachers; Dashboard view for Curators.

### 4.2. Knowledge Capture
- **Speech-to-Text:** Must support real-time streaming of text.
- **Permissions:** Handle microphone denial gracefully with clear UI instructions.

### 4.3. Data Management (Current State: LocalStorage)
- **Persistence:** All data is currently stored in browser `localStorage`.
- **Sync:** `window.addEventListener('storage')` is used to sync data across tabs/components.

### 4.4. Analytics
- **Charts:** Use `recharts` for visualizing knowledge trends.

## 5. Technical Constraints
- **Framework:** React + Tailwind CSS v4.
- **Icons:** Lucide React.
- **Animation:** Motion (framer-motion).
- **Environment:** Browser-based (no native shell).

## 6. Future Roadmap (Refactor Targets)
- **Backend:** Migrate `localStorage` to Supabase (PostgreSQL).
- **State Management:** Move from Prop Drilling/LocalStorage to React Context or Zustand.
- **Design System:** Extract reusable components (Buttons, Inputs, Cards) from page files.
