import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from '../server.ts';

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
}

test('GET /api/health returns OPERATIONAL status and valid model identifier', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'OPERATIONAL');
    assert.equal(data.model, 'gemini-4-hydrogen');
    assert.equal(typeof data.aiEngineAvailable, 'boolean');
    assert.ok(Date.parse(data.timestamp));
  });
});

test('POST /api/quantum/simulate returns mathematically verified tensor metrics', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/quantum/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numQubits: 16,
        maxBondDim: 32,
        noiseTolerance: 0.001,
        gridX: 4,
        gridY: 4,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.status, 'MATHEMATICALLY_VERIFIED');
    assert.equal(data.physicalHilbertSpace, '2^16');
    assert.equal(data.effectiveBondDimension, 24);
    assert.equal(data.maxBondDimension, 32);
    assert.ok(data.vonNeumannEntropyBits > 0);
    assert.ok(data.ramSavedPercent >= 0 && data.ramSavedPercent <= 99.99);
    assert.ok(Array.isArray(data.singularValueSpectrum));
    assert.ok(data.singularValueSpectrum.length > 0);
    assert.ok(['OPTIMAL', 'MODERATE_COMPRESSION', 'CRITICAL_SATURATION'].includes(data.bondHealthSummary));
    assert.ok(data.networkTopology);
    assert.equal(data.networkTopology.nodes.length, 16);
    assert.equal(data.networkTopology.links.length, 15);
  });
});

test('POST /api/quantum/simulate flags CRITICAL_SATURATION when bond capacity is saturated', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/quantum/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numQubits: 16,
        maxBondDim: 4,
        noiseTolerance: 0.0001,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.bondHealthSummary, 'CRITICAL_SATURATION');
    assert.equal(data.bondSaturationRatio, 1);
    assert.ok(data.networkTopology.links.some((link: { health: string }) => link.health === 'CRITICAL'));
  });
});

test('POST /api/quantum/simulate validates invalid parameters with 400', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/quantum/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numQubits: -5,
        noiseTolerance: 2.5,
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });
});

test('POST /api/pqc/generate returns valid FIPS 203, 204, and 205 key fingerprints', async () => {
  await withServer(async (baseUrl) => {
    const cases = [
      { algorithm: 'ML-KEM-1024', expectedFips: 'FIPS 203' },
      { algorithm: 'ML-DSA-87', expectedFips: 'FIPS 204' },
      { algorithm: 'SLH-DSA-SHA2-256f', expectedFips: 'FIPS 205' },
    ];

    for (const tc of cases) {
      const res = await fetch(`${baseUrl}/api/pqc/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: tc.algorithm }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.algorithm, tc.algorithm);
      assert.equal(data.fipsStandard, tc.expectedFips);
      assert.match(data.keypair.publicKeyFingerprint, /^pk_0x[0-9a-f]{64}$/);
      assert.match(data.keypair.secretKeyFingerprint, /^sk_0x[0-9a-f]{64}$/);
      assert.match(data.keypair.ciphertextFingerprint, /^ct_0x[0-9a-f]{64}$/);
      assert.match(data.keypair.encapsulatedSharedSecretHex, /^[0-9a-f]{64}$/);
    }
  });
});

test('POST /api/cyber/analyze rejects missing payload with 400', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/cyber/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error);
  });
});

test('GET /api/intel/live-threats returns 503 cleanly when GEMINI_API_KEY is unset', async () => {
  const prevKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/intel/live-threats`);
      assert.equal(res.status, 503);
      const data = await res.json();
      assert.ok(data.error.includes('GEMINI_API_KEY'));
    });
  } finally {
    if (prevKey !== undefined) {
      process.env.GEMINI_API_KEY = prevKey;
    }
  }
});

test('Unknown /api routes return JSON 404 instead of HTML', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/non-existent-route`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.error, 'API endpoint not found');
  });
});
