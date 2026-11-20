import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMAND_PALETTE_ITEMS,
  filterCommandItems,
} from '../src/data/commandPaletteIndex.ts';
import { CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE } from '../src/data/creationsData.ts';

test('Command palette indexes Documentation, Components, and Project Files categories', () => {
  const categories = new Set(COMMAND_PALETTE_ITEMS.map((item) => item.category));
  assert.ok(categories.has('Documentation'));
  assert.ok(categories.has('Components'));
  assert.ok(categories.has('Project Files'));
});

test('Command palette indexes every Code Vault deliverable for direct jump', () => {
  const allArtifacts = [...CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE];
  for (const artifact of allArtifacts) {
    const match = COMMAND_PALETTE_ITEMS.find(
      (item) => item.target.vaultArtifactId === artifact.id && item.title === artifact.filename
    );
    assert.ok(match, `Expected Code Vault deliverable ${artifact.filename} to be indexed`);
  }
});

test('filterCommandItems supports multi-word queries across titles, paths, and keywords', () => {
  const nistDocs = filterCommandItems('fips 203', 'Documentation');
  assert.equal(nistDocs.length, 1);
  assert.equal(nistDocs[0].target.docSectionId, 'doc-nist-pqc');

  const serverFile = filterCommandItems('server.ts', 'Project Files');
  assert.ok(serverFile.some((item) => item.title === 'server.ts'));

  const titanComp = filterCommandItems('titan 2d', 'Components');
  assert.equal(titanComp.length, 1);
  assert.equal(titanComp[0].target.quantumSub, 'titan');
});

test('filterCommandItems returns empty array when no items match', () => {
  const results = filterCommandItems('nonexistent_xyz_quantum_token_123');
  assert.equal(results.length, 0);
});
