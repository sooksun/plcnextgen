# 3D Mobile-First Theme — Light & Dark

React + Tailwind CSS theme with 3D depth (gradients, shadows), mobile-first, Light/Dark mode, WCAG AA contrast.

---

## 1. Color System (HEX + usage)

| Token | Light (HEX) | Dark (HEX) | Usage |
|-------|-------------|------------|--------|
| **primary** | `#2563eb` | `#3b82f6` | CTAs, links |
| **secondary** | `#475569` | `#94a3b8` | Secondary actions |
| **accent** | `#f1f5f9` | `#1e293b` | Hover/selected surfaces |
| **background** | `#f8fafc` | `#0f172a` | Page background |
| **surface / card** | `#ffffff` | `#1e293b` | Cards, panels |
| **text-primary** | `#0f172a` | `#f8fafc` | Main text |
| **text-secondary** | `#475569` | `#cbd5e1` | Secondary text |
| **text-muted** | `#94a3b8` | `#64748b` | Placeholders, hints |
| **success** | `#059669` | `#10b981` | Success states |
| **warning** | `#d97706` | `#f59e0b` | Warnings |
| **error** | `#dc2626` | `#ef4444` | Errors, destructive |

---

## 2. Tailwind v3 config (reference)

If you use **Tailwind v3** with `tailwind.config.js`, extend theme like this:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', foreground: '#ffffff' },
        secondary: { DEFAULT: '#475569', foreground: '#ffffff' },
        accent: { DEFAULT: '#f1f5f9', foreground: '#0f172a' },
        background: '#f8fafc',
        surface: '#ffffff',
        card: { DEFAULT: '#ffffff', foreground: '#0f172a' },
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',
        success: { DEFAULT: '#059669', foreground: '#ffffff' },
        warning: { DEFAULT: '#d97706', foreground: '#ffffff' },
        error: { DEFAULT: '#dc2626', foreground: '#ffffff' },
      },
      boxShadow: {
        'elevated': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
        'card-3d': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'modal-3d': '0 25px 50px -12px rgba(0,0,0,0.15)',
        'button-3d': '0 2px 4px -1px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'button-pressed': '0 1px 2px 0 rgba(0,0,0,0.1) inset',
      },
      borderRadius: {
        'touch': '1rem',
        'touch-lg': '1.25rem',
      },
    },
  },
  plugins: [],
};
```

Dark mode colors in the same config are usually applied via `dark:` variants when `class="dark"` is on `html`; you can use a plugin or CSS variables for dark values.

---

## 3. This project (Tailwind v4)

- **Theme file:** `src/styles/theme-3d.css`  
  - Defines `:root` and `.dark` CSS variables.  
  - Import in `src/main.tsx`: `import './styles/theme-3d.css';`
- **Dark mode:** Add class `dark` to `<html>` (or a wrapper). Toggle via script or `next-themes`.
- **Utility classes:**  
  `gradient-surface`, `gradient-primary`, `gradient-card-3d`,  
  `shadow-elevated`, `shadow-card-3d`, `shadow-modal-3d`, `shadow-button-3d`, `shadow-button-pressed`,  
  `focus-ring-3d`, `radius-touch`, `radius-touch-lg`,  
  `bg-theme-primary`, `bg-theme-success`, `text-theme-muted`, etc.

---

## 4. Example components

Located in `src/components/ui/theme-3d/`:

- **Button3D** — primary, secondary, outline, ghost, success, destructive; sizes sm/md/lg; 3D shadow + pressed state.
- **Card3D** — gradient surface, 3D shadow, rounded-2xl; Card3DHeader, Card3DTitle, Card3DDescription.
- **AppHeader3D** — sticky header with gradient surface, title, left/right slots.
- **Input3D** — label, error, hint; rounded-xl, min-h 48px, focus ring.

### Usage

```tsx
import { Button3D, Card3D, Card3DTitle, Card3DDescription, AppHeader3D, Input3D } from '@/components/ui/theme-3d';

// Button
<Button3D variant="primary" size="md">บันทึก</Button3D>
<Button3D variant="outline" size="lg" className="w-full">ยกเลิก</Button3D>

// Card
<Card3D>
  <Card3DTitle>หัวข้อ</Card3DTitle>
  <Card3DDescription>คำอธิบาย</Card3DDescription>
  <p className="text-theme-secondary text-sm">เนื้อหา</p>
</Card3D>

// Header
<AppHeader3D
  title="บันทึกเสียง"
  leftAction={<button type="button">←</button>}
  rightAction={<button type="button">ออก</button>}
/>

// Input
<Input3D label="ชื่อ" placeholder="กรอกชื่อ" error={errors.name} />
```

---

## 5. Interaction states

| State | Behavior |
|-------|----------|
| **Hover** | Slight opacity or bg change (e.g. `hover:opacity-95`, `hover:bg-accent`). |
| **Active / pressed** | `active:shadow-button-pressed active:translate-y-0.5` for “sink” effect. |
| **Focus** | `focus-ring-3d` (visible ring, no outline). Use `focus-visible` where appropriate. |
| **Disabled** | `disabled:opacity-50 disabled:cursor-not-allowed`; avoid removing focus ring for keyboard. |

---

## 6. Best practices

1. **Mobile first** — Base styles for small screens; use `sm:`, `md:` for larger.
2. **Touch targets** — Buttons/inputs min height 44px (e.g. `min-h-[44px]`), use `rounded-xl` or `rounded-2xl`.
3. **Dark mode** — Prefer CSS variables (e.g. `var(--primary)`) and toggle `.dark` on `html`.
4. **Contrast** — Use `text-primary` on `background`; `primary-foreground` on `primary`; keep success/warning/error text on white/dark as in the table.
5. **3D depth** — Use one of `shadow-elevated`, `shadow-card-3d`, `shadow-modal-3d` per level; avoid mixing too many shadows on one element.
