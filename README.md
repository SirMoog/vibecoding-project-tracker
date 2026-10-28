# Vibecoding Project Tracker — Hackathon Starter

You're forking this repo as the starting point for the **UXD Vibecoding Hackathon 2026**. The goal of the hackathon is to ship a Vibecoding Project Tracker in ~3 hours: a Kanban-style tool that tracks your vibecoding tasks and stores the prompts that produced them.

This starter gives you:

- A pre-written **PRD** (`PRD.md`) — read it. You don't write the PRD this year; your Milestone 2 is to review, fill in the team-specific TODOs, and commit.
- A pre-written **DESIGN.md** with the design-system slots Person B fills in during M3 (in parallel with M2).
- A **Vite + React + Tailwind** scaffold with the boilerplate already configured.
- The locked `Task` data model and `STAGES` constant in `src/App.jsx`.
- A `useLocalStorage` hook so persistence is one line.
- Empty TODO markers for every milestone, so AI tools can find them.

What you build, starting at M4:

- The four-column Kanban board.
- The add / edit / delete modal.
- The Prompt Context field (the differentiator).
- The "Copy as Prompt Context" button (the demo's hero moment).
- And everything else through M13.

## Quick start

```bash
# 1. Fork this repo on GitHub. Then clone YOUR fork:
git clone https://github.com/<your-team>/<your-fork>.git
cd <your-fork>

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). You should see a placeholder page with the team starter header and "Build the four-column board here · M3" in the middle. That's expected — M3 is your first build milestone.

## Milestone workflow

Every milestone ends with a git tag push. The Hackathon Portal dashboard watches your tags and updates the scoreboard in near real time.

```bash
git add .
git commit -m "<tag-name>"
git tag <tag-name>
git push --tags
```

Replace `<tag-name>` with the tag for the milestone you just finished — see the table below. Tag names are lowercase, hyphenated, exact.

| # | Tag | What it means |
|---|---|---|
| 1 | `git-linked` | Repo registered on the portal, webhook delivers test ping |
| 2 | `prd-done` | PRD reviewed, team-specific TODOs filled in |
| 3 | `design-done` | DESIGN.md filled in, color tokens pasted into `tailwind.config.js` (parallel to M2) |
| 4 | `data-model` | Four-column board renders with 3-4 mock tasks |
| 5 | `crud-modal` | Add / edit / delete tasks via a modal, persisted to localStorage |
| 6 | `tag-style` | Feature vs. bug visual distinction |
| 7 | `task-owner` | Assignee badge on each card + "Hand off to..." dropdown |
| 8 | `due-tint` | Cards change color as deadlines approach |
| 9 | `context` | Curated Context field on the task modal (paste-ready briefing) |
| 10 | `copy-prompt` | One-click copy formatted prompt to clipboard |
| 11 | `project-deliverables` | Deliverable Anchor Board pinned above the Kanban |
| 12 | `secret-sauce` | The one thing that makes your tracker uniquely yours (open-ended) |
| 13 | `pitch-ready` | Demo dataset loaded, pitch rehearsed |

## Repo map

```
.
├── PRD.md              ← READ THIS FIRST · review + fill in TODOs for M2
├── DESIGN.md           ← Person B fills this in for M3 (parallel to M2)
├── README.md           ← you are here
├── package.json
├── vite.config.js
├── tailwind.config.js  ← M3 design tokens land here too
├── postcss.config.js
├── index.html
├── .gitignore
└── src/
    ├── main.jsx        ← React entry point — don't change
    ├── index.css       ← Tailwind directives — don't change
    └── App.jsx         ← all your code goes here (or split into more files)
```

## Deploy (any time after M3)

Vercel's free tier deploys a Vite + React app in one click:

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. Import your fork.
3. Accept the defaults (Vite is auto-detected). Click Deploy.
4. Drop the resulting URL into PRD §11 and into your team chat.

Re-deploys happen automatically on every push to `main`.

## A word about prompts

Once M9 (`context`) is done, keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks on real tasks — those become part of your Module 5 "Vibe Coding History" deliverable. Free credit, just by using your own tool.

---

*UXD Vibecoding Hackathon 2026 · Prof. Dr. Ignacio Alvarez*

## Assessor demo and report scope

For a first-load demonstration, open the prototype in a fresh browser profile or private window. Existing saved workspaces are deliberately preserved and do not receive replacement demo data.

- Sprint 1 starts with six sample tickets. Open **Build the task editor** to see a labelled sample handover with requirements, an AI conversation summary, a simulated error log and next steps. **Copy Context** copies that briefing.
- The **Demo** deliverable links to the deployed prototype. Other deliverables remain empty until real links are supplied.
- **Sprint 2** starts empty so the transfer control is immediately enabled. Transfer the context-bearing ticket, open Sprint 2 and verify its details.
- The sample tickets include all four team members plus an unassigned ticket. The open-workload chart has one assigned task per member. The editor supports reassignment and clearing via **Unassigned**.
- Dates are set relative to the first load: yesterday, tomorrow and next week, plus completed and undated examples. The workspace is saved at initialization so these dates do not shift on reload. They naturally age after the initial demo.
- The header says **Team board**. There is one browser-local workspace and one team, without sign-in or shared accounts.

### Corrections for the attached coursework report

These IDs refer to *Adopting technology work (v1)*, not the earlier PRD numbering.

- **NFR8 (proposed report change, not yet confirmed):** change MVP from Yes to No and label it “Implemented defensive behaviour; outside the assessed demonstration”. Failed saves are handled in code and have been tested by forcing storage failures, but no normal first-load screenshot demonstrates that failure. Retain the handling in the application.
- **FR22–24, NFR14, DR16, DR20 and DR21:** currently **not implemented or demonstrated**. Treating them as future/out-of-scope requirements is proposed and still requires confirmation. “No” in the MVP column alone does not distinguish them from completed extensions.
- **DR2:** the current implementation stores member names, not stable member IDs. Revise this claim to “Store a non-blank, case-insensitively unique display name for each team member” or leave stable IDs as future work. **DR7** should describe a member-name reference or empty value, not imply a separate ID relationship.
- **FR16:** use [the drag handle](evidence/drag-handle.png) and [the mid-drag state](evidence/mid-drag.png). Browser verification also performed a real mouse drag and confirmed the saved status changed to Review.

The Word attachment is unchanged. Apply these scope corrections to its requirement tables and distinguish implemented extensions from future work in the prototype mapping.

Evidence captured locally on 28 October 2026: [fresh board](evidence/first-load-board.png), [filled-in context](evidence/copy-context.png), [drag handle](evidence/drag-handle.png), and [mid-drag state](evidence/mid-drag.png). These screenshots show local changes, not a deployment.

### Keyboard and mobile evidence

- [Visible skip links](evidence/skip-links.png): Tab reveals the first skip link; Enter moves focus to the board.
- [Keyboard focus](evidence/keyboard-focus.png): the focused board region has a visible outline. Browser checks also cover dialog initial focus, wrapping Tab navigation and Escape returning focus to the trigger.
- [Mobile overview](evidence/mobile-overview.png) and [mobile board](evidence/mobile-board.png): captured at 390 × 844 CSS pixels. The page stays 390px wide; the four columns scroll inside the board. This is browser emulation, not a physical-device test.
- [Theme restored](evidence/theme-restored.png): dark mode survives reload via `vibetracker.theme`; switching back to light also persists.
- [Local verification results](evidence/verification.json) record fresh-storage, context copying, transfer, keyboard, theme and mobile checks. These focused checks do not establish full accessibility conformance.

### Production verification on 28 October 2026

Commit `02d7276` deployed successfully to https://vibecoding-project-tracker-topaz.vercel.app/ through Vercel. A fresh isolated browser session passed the same checks against that public URL: two sprints, six tickets, sample context copied exactly, Demo link populated, varied assignees, all deadline examples, preserved transfer details after reload, visible keyboard focus and skip links, dialog focus management, dark/light preference restoration, and the Team board header. A 390 × 844 mobile browser viewport retained a 390px document width with horizontal scrolling inside the board. No page JavaScript errors were observed.

Production evidence: [skip links](evidence/deployed-skip-links.png), [keyboard focus](evidence/deployed-keyboard-focus.png), [mobile overview](evidence/deployed-mobile-overview.png), [mobile board](evidence/deployed-mobile-board.png), [theme restored](evidence/deployed-theme-restored.png), and [verification results](evidence/deployed-verification.json).

Outstanding scope decisions remain unconfirmed for FR22–24 and their dependent requirements. The Word report has not been edited; the evidence and proposed report corrections above are ready to insert.

### Optional profile and AI tool fields

FR25/DR18: Teams now supports optional email and GitHub username/URL fields when adding a member. Expand Contact details under an existing member to view, edit or clear them, then select Save contact details. Values are stored locally with the team; they do not send email or connect to GitHub.

FR26/DR19: the ticket editor has an optional AI tool used field above Context. Enter a tool name such as ChatGPT or Claude and save the ticket. The existing `contextTool` property stores it, including across reloads and sprint transfers. Clearing the input saves an empty value. Copy Context continues to copy the briefing itself.

These fields have been verified locally, including editing, clearing and reload persistence. They have not yet been deployed. The Word report remains unchanged.
