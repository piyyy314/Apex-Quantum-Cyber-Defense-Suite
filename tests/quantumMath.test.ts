import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuantumSimulation, generatePqcKeypair } from '../server.ts';
import { CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE } from '../src/data/creationsData.ts';

test('calculateQuantumSimulation enforces non-negative RAM saved percentage at small qubit counts', () => {
  const smallSim = calculateQuantumSimulation({ numQubits: 4, maxBondDim: 32, noiseTolerance: 0.001 });
  assert.ok(smallSim.ramSavedPercent >= 0);
  assert.ok(smallSim.ramSavedPercent <= 99.99);
  assert.equal(smallSim.effectiveBondDimension, 6);
});

test('calculateQuantumSimulation caps bond dimension strictly at maxBondDim', () => {
  const sim = calculateQuantumSimulation({ numQubits: 64, maxBondDim: 16, noiseTolerance: 0.002 });
  assert.equal(sim.effectiveBondDimension, 16);
  assert.ok(sim.vonNeumannEntropyBits > 0);
  assert.ok(sim.ramSavedPercent > 99);
});

test('generatePqcKeypair generates distinct random fingerprints across calls', () => {
  const k1 = generatePqcKeypair('ML-KEM-1024');
  const k2 = generatePqcKeypair('ML-KEM-1024');
  assert.notEqual(k1.keypair.publicKeyFingerprint, k2.keypair.publicKeyFingerprint);
  assert.notEqual(k1.keypair.secretKeyFingerprint, k2.keypair.secretKeyFingerprint);
});

test('CREATIONS_ARCHIVE and VALIDATION_TEST_SUITE contain all 6 non-empty deliverables', () => {
  const all = [...CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE];
  assert.equal(all.length, 6);
  const expectedIds = [
    'vsat-toolkit',
    'aegis-security',
    'project-nebula',
    'project-titan',
    'project-hyperion',
    'test-hyperion',
  ];
  assert.deepEqual(
    all.map((a) => a.id),
    expectedIds
  );
  for (const artifact of all) {
    assert.ok(artifact.code.length > 200, `${artifact.id} code should be populated`);
    assert.ok(artifact.filename.length > 0);
  }
});
