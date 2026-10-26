# Vibecoding Project Tracker — Design

**Status:** Design direction supplied by the project owner. Reference images and implementation tokens are recorded below.

## 1. Mood and references

A compact desktop workspace with pale lavender surfaces, crisp blue actions, readable task cards and a prominent context editor.

- [Board and task editor reference](docs/design/board-reference.png): FlowTask layout, navigation, deliverable links, Kanban cards and right-side editor.
- [Style reference](docs/design/style-reference.png): Syntropic Control palette and typography.

Use the style reference's explicitly labelled colours and fonts as the source of truth. Supporting surface, border and status colours below are implementation choices based on the mockup, not exact sampled values. Avoid heavy gradients and oversized dashboard cards. The light theme follows the reference; the added dark theme preserves its hierarchy and accents.

## 2. Colour palette

These names map to Tailwind utilities such as `bg-brand-primary`, `bg-surface-panel` and `text-ink-muted`.

| Token | Hex | Use |
|---|---|---|
| `brand-primary` | `#3B82F6` | Primary brand blue, selection and focus accents |
| `brand-secondary` | `#10B981` | Secondary green, positive accents |
| `brand-accent` | `#6366F1` | Tertiary indigo accents |
| `brand-action` | `#0057C2` | Filled primary buttons and blue text on pale surfaces |
| `surface-page` | `#F8F7FF` | Main workspace background |
| `surface-panel` | `#F1F2FF` | Sidebar, columns and editor sections |
| `surface-card` | `#FFFFFF` | Task cards and deliverable strip |
| `surface-selected` | `#DCE4FF` | Selected navigation and task accents |
| `border-subtle` | `#DDE1EF` | Card, input and panel outlines |
| `ink-primary` | `#0F172A` | Neutral from the style reference; headings and primary text |
| `ink-body` | `#444B5A` | Body text |
| `ink-muted` | `#596477` | Captions and secondary labels |
| `type-feature` | `#1D4ED8` | Feature text/icon with pale blue background |
| `type-bug` | `#B91C1C` | Bug text/icon with pale red background |
| `due-safe` | `#047857` | Time remaining, with green text/icon |
| `due-warning` | `#92400E` | Needs attention, with amber text/icon |
| `due-overdue` | `#B91C1C` | Overdue, with red text/icon |
| `due-neutral` | `#475569` | Completed or undated task metadata |
| `tint-feature` | `#DBEAFE` | Feature badge fill |
| `tint-bug` | `#FEE2E2` | Bug and overdue badge fill |
| `tint-safe` | `#ECFDF5` | Time remaining badge fill |
| `tint-warning` | `#FEF3C7` | Needs-attention badge fill |
| `tint-neutral` | `#F1F5F9` | Neutral badge fill |

Always pair type and urgency colours with readable labels and icons. The implementation uses local calendar dates: future dates beyond tomorrow are green, today and tomorrow are amber, and dates before today are red. Completed tasks and undated tasks are neutral. A task becomes overdue on the day after its due date. Card backgrounds use the matching pale tint; the feature/bug accent remains visible. Urgency refreshes every 30 seconds and when the page regains focus.

## 3. Typography and spacing

| Role | Font | Treatment |
|---|---|---|
| Headings | Geist, sans-serif fallback | 24px semibold page title; 16px semibold section headings |
| Body and controls | Geist, sans-serif fallback | 14px regular body text; 14–16px medium task titles |
| Labels, task IDs and code | JetBrains Mono, monospace fallback | 12px labels; 13px context/code text |

Use a 4px spacing scale, typically 8px between related controls, 12–16px card padding and 24px workspace padding. Font families are configured in Tailwind; the font files still need loading when the interface is implemented.

## 4. Layout and components

- **App shell:** a pale lavender left sidebar, compact top toolbar and a spacious main board area. The mockup's sidebar is approximately 300px wide at a 1600px viewport.
- **Navigation:** icon-and-label rows, blue selected state, muted section labels and small counts. Build navigation only for supported views.
- **Board header:** project title, task count and prominent Add Task action; compact filters can sit beside them when implemented.
- **Deliverables:** a white bordered strip above the Kanban with four clearly labelled link slots for Presentation, Demo, Report and Documentation.
- **Columns:** four fixed stages in order: To Do, In Progress, Review, Done. Each uses a pale panel, a status dot, label, count and add action. Keep desktop columns readable with horizontal scrolling when needed.
- **Cards:** white fill, thin subtle border, small shadow and 6px corners. Type and ID sit above the title; description and urgency follow; an assignee row sits below a divider. Selected cards receive a blue outline.
- **Buttons:** compact rectangular controls with 4px corners, icon plus label where useful, solid blue primary fill, pale secondary fill and outlined alternatives. Provide a visible keyboard focus ring.
- **Task editor:** a large right-aligned overlay, approximately 620px wide on the reference desktop viewport, with a visible board behind it. Include a title bar, close control, task fields, long-text context and a pinned footer with delete, discard and save actions. Allow the content area to scroll.
- **Context:** a bordered lavender section with a clear heading, readable long-text area and prominent Copy Context action. Preserve whitespace in debugging logs and errors.
- **Inputs:** pale or white fills, subtle outlines, persistent labels and clear focus states.
- **Empty states:** short muted guidance and an Add Task action.
- **Status changes:** drag cards between columns or onto another card to insert before it. Dropping on column space appends the card. A status selector on every card provides a keyboard-accessible alternative. Highlight the active drop target; persist status and card order together.
- **Keyboard behaviour:** controls have accessible names; the editor traps focus while open, closes with Escape and restores focus to its trigger.

## 5. Voice and microcopy

Use short, direct wording consistent with the supplied mockup.

| Location | Text |
|---|---|
| Add action | Add Task |
| Empty column | No tasks yet. Add a task to get started. |
| Context action | Copy Context for AI |
| Successful copy | Context copied. Ready to paste into your AI tool. |
| Save action | Save Changes |
| Discard action | Discard |
| Delete confirmation | Delete this task? This cannot be undone. |
| Assignee change | Assigned to {name}. |
| Successful local save | Saved locally. |

Show save confirmation only after storage succeeds.

## 6. Wordmark

The board reference uses **FlowTask**, with a small blue square containing a white workflow icon and a dark semibold wordmark. Use that as the provisional visual treatment. The separate style sheet is labelled **Syntropic Control**; the final product name has not been explicitly selected between the references.

## 7. Design scope

This document captures the visual direction for the existing PRD. The reference also shows agent execution, analytics, multiple boards, comments/subtasks and attachments; their appearance in the mockup does not change the PRD's optional or deferred feature status. Do not display fabricated live agent activity.

Use consistent light and dark themes, an existing outline icon set and restrained transitions of around 150–200ms. Board and editor implementation follow in the build milestones.

## 8. Secret sauce: drag-and-drop and board insights

The owner selected drag-and-drop and live charts as the secret-sauce feature. Below the Kanban, show task distribution by stage, completion percentage, feature/bug mix, deadline health and open workload by assignee. Summary figures show total tasks, open tasks, work in progress (In Progress + Review) and overdue open tasks. Use labelled bars and a completion ring, with visible numeric values and sensible empty states. These charts describe the current board; historical throughput and cycle time are not collected.

## 9. Accessibility improvements

- Provide skip links to the task board and insights, visible on keyboard focus.
- Keep status selection available alongside dragging. Up/Down buttons reorder tasks within a column and announce their new position.
- Restore focus to the moved task or its status selector after movement, to the task title after saving, and to Add Task after deletion.
- Open the editor with focus on its title field; keep Tab/Shift+Tab inside it and allow Escape to dismiss it. Default focus to Keep task when requesting deletion confirmation.
- Use controls at least 44px high, visible focus outlines and darker muted text (`#596477`) for sufficient contrast on lavender panels.
- Reflow columns to two or one per row on smaller viewports; use a single-column modal form at narrow widths. Deliverables stop sticking on narrow screens so they do not obscure the board.
- Respect `prefers-reduced-motion` by disabling animations and transitions.

Validation: automated WCAG A/AA checks with axe on the desktop board, task modal, 320px board and 320px modal found no violations in the tested states. Browser interaction checks covered keyboard reordering, focus restoration, dialog focus containment, Escape, skip links and reduced motion. These checks do not constitute a full accessibility conformance audit or a screen-reader user test.

## 10. Sprints

The sprint selector switches the entire board, including task context, task order, deliverable links and live insights. New sprints start empty. Existing local board data is loaded into Sprint 1; the original storage keys are retained as a migration backup. Sprint data and selection are saved together under `vibetracker.sprints.v1`. Deletion requires confirmation and removes only the chosen sprint. Deleting the final sprint shows an empty workspace with a New sprint action. Failed storage writes leave the current workspace intact.

Sprint navigation lives in the left sidebar: a named sprint list with task counts, selected-state highlighting and a New sprint action. Creation uses a short inline name form. Each sprint page ends with Edit sprint and Delete sprint actions below the charts. Editing changes the sprint name without changing its tasks or links; deletion retains its explicit confirmation step.

## 11. Light and dark mode

The sidebar contains a keyboard-accessible Dark mode switch. On first visit the theme follows the system colour preference; an explicit choice is saved separately under `vibetracker.theme` and applied before the app renders on subsequent visits. Both themes use semantic CSS colour variables for surfaces, text, task types, deadline states and charts. Solid action buttons retain high-contrast white labels. Theme changes do not modify sprint or task data.

### Moving tasks between sprints and language preferences

- Each task card has a **Move to sprint…** dropdown listing the other sprints. Create a sprint from the sidebar, then select it from this dropdown to transfer a task. The task keeps its ID, status, assignee, dates and AI context, and is appended to the destination sprint. Both boards are saved together; a failed storage write leaves the task in its original sprint.
- The sidebar **Language / Iaith** setting offers English and Cymraeg. It translates interface labels, form guidance, status messages, deadlines and charts, updates the document language for assistive technology, and persists under `vibetracker.language`.
- User-written sprint names, task titles, descriptions, names and AI context stay exactly as entered. Translation strings live in `src/welsh.json`.

### Team members (FR28)

The sidebar Team section lists members and accepts new names for assignment across all sprints. Names are trimmed; blank names and case-insensitive duplicates are rejected. Members are stored with the workspace in browser storage, and are only added to the interface after a successful save. Existing workspaces retain their tasks and gain a team list seeded from the original names and existing assignees. Both new and existing task editors use this shared list. Interface labels support English and Welsh; member names remain as entered.
