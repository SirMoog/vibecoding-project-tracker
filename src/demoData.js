export const DEMO_URL = 'https://vibecoding-project-tracker-topaz.vercel.app/';
export const DEMO_TEAM = ['SirMoog', 'Elena Rostova', 'Marcus Chen', 'Devon Vance'];

export const DEMO_CONTEXT = `Sample handover — task editor

Requirements
- A ticket needs a non-blank title, description, type, status and optional assignee/due date.
- Preserve multiline AI context exactly when saving and copying.
- Keep unsaved edits visible if browser storage fails; report the error and allow retry.

AI conversation summary
Developer: How can we prevent a failed save from closing the editor?
AI: Keep a local draft and have onSave return a success flag. Write to localStorage before updating board state. Close the editor only when the write succeeds.
Decision: Use a controlled draft, trim the title on submission and leave context formatting unchanged. Use an explicit Unassigned option.

Example error log from a simulated storage failure
QuotaExceededError: Failed to execute 'setItem' on 'Storage': quota exceeded.
Reproduction: make the storage write throw, change a ticket title, then select Save Changes.
Expected: an error message appears; the draft and AI context remain available for retry.

Next steps
1. Check keyboard focus, Escape and the Discard action in the editor.
2. Copy this briefing into an AI tool and ask for a review of the save failure flow.
3. Save a changed briefing, reload and confirm line breaks are retained.
4. Transfer this ticket to Sprint 2 and verify its assignee, deadline and context remain intact.`;

export function createDemoTasks(now = new Date()) {
  function date(offset) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  }
  const base = { type: 'feature', status: 'todo', dueDate: null, createdDate: date(-2), context: '', contextTool: null, contextUpdatedAt: null };
  return [
    { ...base, id: 'TASK-104', title: 'Build the task editor', description: 'Review the sample AI handover, copy it, and finish the ticket editor.', assignee: DEMO_TEAM[0], dueDate: date(1), context: DEMO_CONTEXT },
    { ...base, id: 'TASK-103', title: 'Create the Kanban board', description: 'Bring the four workflow stages together in one clear project workspace.', status: 'in-progress', assignee: DEMO_TEAM[1], dueDate: date(-1) },
    { ...base, id: 'TASK-102', title: 'Check long task titles', description: 'Verify that long titles wrap without pushing the columns apart.', type: 'bug', status: 'review', assignee: DEMO_TEAM[2], dueDate: date(7) },
    { ...base, id: 'TASK-101', title: 'Define the visual direction', description: 'Document the blue and lavender palette, typography and component styles.', status: 'done', assignee: DEMO_TEAM[3], dueDate: date(-2) },
    { ...base, id: 'TASK-105', title: 'Review keyboard navigation', description: 'Check status selectors and reorder buttons using only the keyboard.', status: 'in-progress', assignee: DEMO_TEAM[3] },
    { ...base, id: 'TASK-106', title: 'Plan the next handover', description: 'Choose an assignee and move this ticket to Sprint 2 when ready.', assignee: '' }
  ];
}
