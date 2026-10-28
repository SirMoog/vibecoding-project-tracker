// Move older per-sprint links into the project without discarding conflicting URLs.
export function migrateProjectAnchors(workspace) {
  if (workspace.projectAnchors !== undefined) {
    if (!Array.isArray(workspace.projectAnchors)) throw new Error('Invalid project deliverables');
    return workspace.projectAnchors;
  }
  const anchors = [];
  const sprints = [...workspace.sprints].sort((a, b) => Number(b.id === workspace.selectedId) - Number(a.id === workspace.selectedId));
  for (const sprint of sprints) {
    for (const anchor of sprint.anchors ?? []) {
      const existing = anchors.find(item => item.id === anchor.id);
      if (!existing) anchors.push({ ...anchor });
      else if (!existing.url && anchor.url) existing.url = anchor.url;
      else if (anchor.url && existing.url !== anchor.url && !anchors.some(item => item.url === anchor.url && item.sourceCategory === anchor.id)) {
        let id = `${anchor.id}-${sprint.id}`;
        while (anchors.some(item => item.id === id)) id += '-legacy';
        anchors.push({ ...anchor, id, sourceCategory: anchor.id, label: `${anchor.label} (${sprint.name})` });
      }
    }
  }
  return anchors;
}
