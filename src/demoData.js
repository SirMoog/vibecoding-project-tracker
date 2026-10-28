export const DEMO_URL = 'https://vibecoding-project-tracker-topaz.vercel.app/';
export const DEMO_TEAM = ['SirMoog', 'Elena Rostova', 'Marcus Chen', 'Devon Vance'];

// Fictional examples: do not imply these are real member contact details.
export const DEMO_PROFILES = [
  { name: 'Elena Rostova', email: 'elena.rostova@example.com', github: 'example-elena-demo', isSample: true },
  { name: 'Marcus Chen', email: 'marcus.chen@example.com', github: 'example-marcus-demo', isSample: true }
];

export const DEMO_CONTEXT = `Sample handover — task editor

Requirements
- A ticket needs a non-blank title, description, type, status and optional assignee/due date.
- Preserve multiline AI context exactly when saving and copying.
- Allow an assignee to be changed or cleared with the Unassigned option.

AI conversation summary
SirMoog: How should we keep pasted context readable after saving?
AI: Use a controlled textarea, preserve its line breaks and copy the complete context string through the Clipboard API.
Decision: Trim the title on submission but leave the context text unchanged. Keep tool names in the optional AI tool used field.

Example error log from an earlier test
AssertionError: expected copied context to include "Next steps"; received only the first line.
Reproduction: paste a multiline briefing, save the ticket, reopen it and select Copy Context.
Expected: the pasted result includes every section and line break.

Next steps
1. Copy this briefing into an AI tool and ask for a review of the context-editing flow.
2. Change one line, save, reload and confirm the edit and line breaks remain.
3. Change the assignee, then try Unassigned.
4. Transfer this ticket to Sprint 2 and verify its details are retained.`;

export const DEMO_HANDOVER = `Sample handover — Elena Rostova to Marcus Chen

Requirements
- Keep project deliverable links visible on every sprint.
- Moving a ticket must preserve its title, assignee, due date, AI tool and full context.
- Validate empty titles and invalid deliverable URLs with clear messages.

AI conversation summary
Elena: I can see the Demo link in Sprint 1 but it disappears in Sprint 2. Where should the links live?
AI: Store project links once in the workspace and pass the same list to each sprint board.
Elena: Agreed. Marcus will verify switching sprints, editing a shared link and transferring a ticket.

Example debugging log
FAIL: expected Demo link to remain visible after switching to Sprint 2; found 0 linked deliverables.
Cause: each sprint owned a separate link list.
Expected after the change: both sprints show the same project links, including after reload.

Handover notes
Elena Rostova: I have recorded the reproduction steps and the proposed shared-link design. Please use the Demo link as the first check.
Marcus Chen: I will test both sprint directions, confirm the copied briefing matches this text, and record any remaining issue before marking the ticket Done.

Next steps
1. Switch between Sprint 1 and Sprint 2 and open Demo from each.
2. Add a Documentation link and check that it is visible in both sprints.
3. Transfer this ticket to Sprint 1 and confirm this handover survives.
4. Reload, copy the context, and compare it with the saved briefing.`;

function demoDate(now, offset) {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

export function createDemoSprintTwoTasks(now = new Date()) {
  const base = { type: 'feature', createdDate: demoDate(now, 0), contextUpdatedAt: null };
  return [
    { ...base, id: 'TASK-201', title: 'Verify project links and sprint handover', description: 'Marcus picks up Elena’s sample handover to check shared links and ticket transfers.', status: 'in-progress', assignee: DEMO_TEAM[2], dueDate: demoDate(now, 7), context: DEMO_HANDOVER, contextTool: 'ChatGPT (sample)' },
    { ...base, id: 'TASK-202', title: 'Prepare the next sprint review', description: 'Review completed work and prepare the demo checklist for the team.', status: 'todo', assignee: DEMO_TEAM[1], dueDate: demoDate(now, 8), context: '', contextTool: null }
  ];
}

export function createDemoTasks(now = new Date()) {
  function date(offset) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  }
  const base = { type: 'feature', status: 'todo', dueDate: null, createdDate: date(-2), context: '', contextTool: null, contextUpdatedAt: null };
  return [
    { ...base, id: 'TASK-104', title: 'Build the task editor', description: 'Review the sample AI handover, copy it, and finish the ticket editor.', assignee: DEMO_TEAM[0], dueDate: date(1), context: DEMO_CONTEXT, contextTool: 'ChatGPT (sample)' },
    { ...base, id: 'TASK-103', title: 'Create the Kanban board', description: 'Bring the four workflow stages together in one clear project workspace.', status: 'in-progress', assignee: DEMO_TEAM[1], dueDate: date(-1) },
    { ...base, id: 'TASK-102', title: 'Check long task titles', description: 'Verify that long titles wrap without pushing the columns apart.', type: 'bug', status: 'review', assignee: DEMO_TEAM[2], dueDate: date(7) },
    { ...base, id: 'TASK-101', title: 'Define the visual direction', description: 'Document the blue and lavender palette, typography and component styles.', status: 'done', assignee: DEMO_TEAM[3], dueDate: date(-2) },
    { ...base, id: 'TASK-105', title: 'Review keyboard navigation', description: 'Check status selectors and reorder buttons using only the keyboard.', status: 'in-progress', assignee: DEMO_TEAM[3] },
    { ...base, id: 'TASK-106', title: 'Plan the next handover', description: 'Choose an assignee and move this ticket to Sprint 2 when ready.', assignee: '' }
  ];
}
