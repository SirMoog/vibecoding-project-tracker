import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateProjectAnchors } from './projectAnchors.js';
const anchor = url => ({ id: 'demo', label: 'Demo', url });
test('a populated legacy link becomes shared even when selected sprint is empty', () => {
  const workspace = { selectedId: 'b', sprints: [{ id: 'a', name: 'Sprint 1', anchors: [anchor('https://example.com')] }, { id: 'b', name: 'Sprint 2', anchors: [anchor(null)] }] };
  assert.deepEqual(migrateProjectAnchors(workspace), [anchor('https://example.com')]);
  assert.equal(workspace.sprints[1].anchors[0].url, null);
});
test('different legacy URLs are preserved as extra project links', () => {
  const migrated = migrateProjectAnchors({ selectedId: 'a', sprints: [{ id: 'a', name: 'Sprint 1', anchors: [anchor('https://example.com/one')] }, { id: 'b', name: 'Sprint 2', anchors: [anchor('https://example.com/two')] }] });
  assert.equal(migrated.length, 2);
  assert.deepEqual(migrated.map(a=>a.url), ['https://example.com/one','https://example.com/two']);
  assert.equal(migrated[1].label, 'Demo (Sprint 2)');
  assert.notEqual(migrated[0].id, migrated[1].id);
});
test('project links take precedence including intentionally cleared links', () => {
  assert.deepEqual(migrateProjectAnchors({ projectAnchors: [], sprints: [{anchors:[anchor('https://example.com')]}] }), []);
  assert.throws(()=>migrateProjectAnchors({projectAnchors:null}), /Invalid/);
});
