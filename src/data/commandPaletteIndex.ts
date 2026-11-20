import { AppTrack } from '../types';
import { CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE } from './creationsData';

export type CommandCategory = 'Documentation' | 'Components' | 'Project Files';

export interface CommandNavigationTarget {
  track: AppTrack;
  defenseSub?: 'vsat' | 'aegis';
  quantumSub?: 'nebula' | 'titan' | 'hyperion';
  vaultArtifactId?: string;
  docSectionId?: string;
}

export interface CommandSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: CommandCategory;
  path?: string;
  keywords: string[];
  target: CommandNavigationTarget;
}

const DOCUMENTATION_ITEMS: CommandSearchItem[] = [
  {
    id: 'doc-ewin-tang',
    title: '1. The Ewin Tang Breakthrough: Classical Dequantization (2018)',
    subtitle: 'Polynomial classical speedups via L2-norm tree sampling & Kerenidis-Prakash dequantization.',
    category: 'Documentation',
    path: 'src/components/DocumentationView.tsx#doc-ewin-tang',
    keywords: ['ewin tang', 'dequantization', 'kerenidis', 'prakash', 'l2-norm', 'qiml', 'theory'],
    target: { track: 'docs', docSectionId: 'doc-ewin-tang' },
  },
  {
    id: 'doc-gbs-jiuzhang',
    title: '2. Gaussian Boson Sampling (GBS) vs Classical Tensor Networks',
    subtitle: 'Photon loss decoherence (>60%) and classical SVD truncation spoofing of Jiuzhang claims.',
    category: 'Documentation',
    path: 'src/components/DocumentationView.tsx#doc-gbs-jiuzhang',
    keywords: ['gbs', 'jiuzhang', 'boson sampling', 'photon loss', 'svd', 'noise cheat', 'supremacy'],
    target: { track: 'docs', docSectionId: 'doc-gbs-jiuzhang' },
  },
  {
    id: 'doc-bmps-kraus',
    title: '3. Boundary MPS (BMPS) Contraction & Von Neumann Entropy',
    subtitle: 'Amplitude damping Kraus completeness (K0†K0 + K1†K1 = I) and polynomial entropy thresholds.',
    category: 'Documentation',
    path: 'src/components/DocumentationView.tsx#doc-bmps-kraus',
    keywords: ['bmps', 'kraus', 'von neumann', 'entropy', 'peps', 'amplitude damping', 'completeness'],
    target: { track: 'docs', docSectionId: 'doc-bmps-kraus' },
  },
  {
    id: 'doc-nist-pqc',
    title: '4. NIST Post-Quantum Cryptography (PQC) Transition Standards',
    subtitle: 'FIPS 203 (ML-KEM / Kyber), FIPS 204 (ML-DSA / Dilithium), FIPS 205 (SLH-DSA), and FN-DSA.',
    category: 'Documentation',
    path: 'src/components/DocumentationView.tsx#doc-nist-pqc',
    keywords: ['nist', 'pqc', 'fips 203', 'fips 204', 'fips 205', 'ml-kem', 'kyber', 'dilithium', 'sphincs', 'falcon'],
    target: { track: 'docs', docSectionId: 'doc-nist-pqc' },
  },
];

const COMPONENT_ITEMS: CommandSearchItem[] = [
  {
    id: 'comp-vsat-toolkit',
    title: 'VsatToolkitView — VSAT Blue Team Toolkit v2.0',
    subtitle: 'Threat hunting, NIST 800-53 compliance audits, adversary simulation, SIEM rules, & scripts.',
    category: 'Components',
    path: 'src/components/VsatToolkitView.tsx',
    keywords: ['vsat', 'blue team', 'threat hunting', 'siem', 'splunk', 'hardening', 'nsa', 'cisa', 'component'],
    target: { track: 'defense', defenseSub: 'vsat' },
  },
  {
    id: 'comp-aegis-security',
    title: 'AegisSecurityView — Project AEGIS Ultimate Live SOC',
    subtitle: 'Live Gemini threat stream, ML IsolationForest anomalies, Port 2222 honeypot, FIM & PQC rotation.',
    category: 'Components',
    path: 'src/components/AegisSecurityView.tsx',
    keywords: ['aegis', 'soc', 'honeypot', 'isolation forest', 'fim', 'gemini', 'live threats', 'pqc', 'component'],
    target: { track: 'defense', defenseSub: 'aegis' },
  },
  {
    id: 'comp-nebula-quantum',
    title: 'NebulaQuantumView — Project Nebula (1D MPS Simulator)',
    subtitle: '1D Matrix Product State simulator, live server SVD truncation, and Ewin Tang QIML encoder.',
    category: 'Components',
    path: 'src/components/NebulaQuantumView.tsx',
    keywords: ['nebula', 'mps', '1d', 'svd', 'qiml', 'hilbert', 'qubits', 'tensor', 'component'],
    target: { track: 'quantum', quantumSub: 'nebula' },
  },
  {
    id: 'comp-tensor-visualizer',
    title: 'TensorNetworkVisualizer — D3 Quantum Bond Health Graph',
    subtitle: 'Interactive D3.js 1D MPS topology graph, bond saturation metrics, and SVD spectrum chart.',
    category: 'Components',
    path: 'src/components/TensorNetworkVisualizer.tsx',
    keywords: ['d3', 'visualizer', 'tensor', 'bond', 'svd', 'spectrum', 'topology', 'health', 'component'],
    target: { track: 'quantum', quantumSub: 'nebula' },
  },
  {
    id: 'comp-titan-peps',
    title: 'TitanPEPSView — Project Titan (2D PEPS & Ray Cluster)',
    subtitle: 'Interactive 2D qubit lattice topology, 5D PEPS tensor inspector, and Apache Ray worker dispatch.',
    category: 'Components',
    path: 'src/components/TitanPEPSView.tsx',
    keywords: ['titan', 'peps', '2d', 'ray', 'cupy', 'gpu', '5d tensor', 'lattice', 'component'],
    target: { track: 'quantum', quantumSub: 'titan' },
  },
  {
    id: 'comp-hyperion-exascale',
    title: 'HyperionExascaleView — Project Hyperion (Exascale BMPS)',
    subtitle: 'Boundary MPS row sweep, Kraus damping parameters, and interactive mathematical unit test runner.',
    category: 'Components',
    path: 'src/components/HyperionExascaleView.tsx',
    keywords: ['hyperion', 'bmps', 'kraus', 'pytest', 'exascale', '256 qubits', 'entropy', 'component'],
    target: { track: 'quantum', quantumSub: 'hyperion' },
  },
  {
    id: 'comp-code-vault',
    title: 'CodeVaultView — Unified Code Vault & Deliverables',
    subtitle: 'Browse, copy, search, and export all 6 standalone HTML, Python, and pytest deliverables.',
    category: 'Components',
    path: 'src/components/CodeVaultView.tsx',
    keywords: ['vault', 'code', 'download', 'export', 'artifacts', 'deliverables', 'component'],
    target: { track: 'vault' },
  },
  {
    id: 'comp-documentation',
    title: 'DocumentationView — Theoretical Whitepapers & Architecture',
    subtitle: 'Scientific foundations of classical dequantization, tensor spoofing, and PQC transition.',
    category: 'Components',
    path: 'src/components/DocumentationView.tsx',
    keywords: ['docs', 'documentation', 'whitepapers', 'theory', 'architecture', 'component'],
    target: { track: 'docs' },
  },
];

const VAULT_FILE_ITEMS: CommandSearchItem[] = [...CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE].map(
  (artifact) => ({
    id: `vault-file-${artifact.id}`,
    title: artifact.filename,
    subtitle: `${artifact.title} (${artifact.language.toUpperCase()} • v${artifact.version})`,
    category: 'Project Files',
    path: `vault://${artifact.filename}`,
    keywords: [
      artifact.filename,
      artifact.title,
      artifact.category,
      artifact.language,
      ...artifact.keyFeatures,
    ],
    target: { track: 'vault', vaultArtifactId: artifact.id },
  })
);

const REPO_PROJECT_FILES: CommandSearchItem[] = [
  {
    id: 'repo-server-ts',
    title: 'server.ts',
    subtitle: 'Express API backend (/api/health, /api/intel/live-threats, /api/cyber/analyze, /api/quantum/simulate, /api/pqc/generate)',
    category: 'Project Files',
    path: 'server.ts',
    keywords: ['express', 'api', 'gemini', 'backend', 'routes', 'pqc', 'quantum'],
    target: { track: 'defense', defenseSub: 'aegis' },
  },
  {
    id: 'repo-python-hyperion',
    title: 'python/project_hyperion_engine.py',
    subtitle: 'Runnable Python Boundary MPS & Kraus Noise simulation engine module',
    category: 'Project Files',
    path: 'python/project_hyperion_engine.py',
    keywords: ['python', 'hyperion', 'bmps', 'kraus', 'numpy', 'peps'],
    target: { track: 'vault', vaultArtifactId: 'project-hyperion' },
  },
  {
    id: 'repo-python-nebula',
    title: 'python/quantum_tensor_engine.py',
    subtitle: 'Runnable Python 1D Matrix Product State & QIML encoder module',
    category: 'Project Files',
    path: 'python/quantum_tensor_engine.py',
    keywords: ['python', 'nebula', 'mps', 'svd', 'tensor', 'qiml'],
    target: { track: 'vault', vaultArtifactId: 'project-nebula' },
  },
  {
    id: 'repo-python-vsat-rce',
    title: 'python/vsat_log_analyzer.py',
    subtitle: 'VSAT RCE, command injection, and auth failure regex scanner',
    category: 'Project Files',
    path: 'python/vsat_log_analyzer.py',
    keywords: ['python', 'vsat', 'rce', 'logs', 'regex', 'scanner'],
    target: { track: 'defense', defenseSub: 'vsat' },
  },
  {
    id: 'repo-python-vsat-fim',
    title: 'python/vsat_fim.py',
    subtitle: 'SHA-256 baseline File Integrity Monitor for VSAT modems',
    category: 'Project Files',
    path: 'python/vsat_fim.py',
    keywords: ['python', 'fim', 'sha256', 'integrity', 'vsat'],
    target: { track: 'defense', defenseSub: 'vsat' },
  },
  {
    id: 'repo-tests-server',
    title: 'tests/server.test.ts',
    subtitle: 'Node.js integration test suite for Express REST API endpoints',
    category: 'Project Files',
    path: 'tests/server.test.ts',
    keywords: ['test', 'tests', 'api', 'server', 'node:test', 'integration'],
    target: { track: 'defense', defenseSub: 'aegis' },
  },
  {
    id: 'repo-tests-quantum-math',
    title: 'tests/quantumMath.test.ts',
    subtitle: 'Unit tests for tensor RAM bounds, bond caps, PQC uniqueness, and archive integrity',
    category: 'Project Files',
    path: 'tests/quantumMath.test.ts',
    keywords: ['test', 'tests', 'quantum', 'math', 'unit test'],
    target: { track: 'quantum', quantumSub: 'nebula' },
  },
  {
    id: 'repo-tests-hyperion',
    title: 'tests/test_hyperion.py',
    subtitle: 'Python unittest/pytest validation suite for Kraus completeness & SVD limits',
    category: 'Project Files',
    path: 'tests/test_hyperion.py',
    keywords: ['test', 'pytest', 'python', 'hyperion', 'kraus', 'entropy'],
    target: { track: 'vault', vaultArtifactId: 'test-hyperion' },
  },
  {
    id: 'repo-tests-tensor-limits',
    title: 'tests/test_tensor_limits.py',
    subtitle: 'Python edge-case tests for low max_bond_dim and SVD zero-padding fallback',
    category: 'Project Files',
    path: 'tests/test_tensor_limits.py',
    keywords: ['test', 'pytest', 'python', 'tensor', 'max_bond_dim', 'svd', 'limits'],
    target: { track: 'quantum', quantumSub: 'nebula' },
  },
  {
    id: 'repo-tests-vsat',
    title: 'tests/test_vsat_tools.py',
    subtitle: 'Python unit tests for VSAT RCE log detection and FIM tampering alerts',
    category: 'Project Files',
    path: 'tests/test_vsat_tools.py',
    keywords: ['test', 'python', 'vsat', 'fim', 'rce'],
    target: { track: 'defense', defenseSub: 'vsat' },
  },
  {
    id: 'repo-readme',
    title: 'README.md',
    subtitle: 'Project overview, installation, component breakdown, API docs, and Apache 2.0 license',
    category: 'Project Files',
    path: 'README.md',
    keywords: ['readme', 'docs', 'installation', 'setup', 'license'],
    target: { track: 'docs' },
  },
  {
    id: 'repo-setup-sh',
    title: 'setup.sh',
    subtitle: 'Automated Python (.venv, rich, numpy, scipy) and Node.js installer script',
    category: 'Project Files',
    path: 'setup.sh',
    keywords: ['setup', 'bash', 'venv', 'rich', 'numpy', 'scipy', 'install'],
    target: { track: 'docs' },
  },
  {
    id: 'repo-package-json',
    title: 'package.json',
    subtitle: 'Node.js dependencies, Vite scripts, lint, and test commands',
    category: 'Project Files',
    path: 'package.json',
    keywords: ['package', 'npm', 'scripts', 'dependencies', 'vite', 'react'],
    target: { track: 'vault' },
  },
  {
    id: 'repo-dockerfile',
    title: 'Dockerfile',
    subtitle: 'Multi-stage Node 20 Alpine production container build configuration',
    category: 'Project Files',
    path: 'Dockerfile',
    keywords: ['docker', 'container', 'production', 'deploy'],
    target: { track: 'docs' },
  },
  {
    id: 'repo-ci-yml',
    title: '.github/workflows/ci.yml',
    subtitle: 'GitHub Actions CI pipeline for lint, Node tests, Python pytest, and build',
    category: 'Project Files',
    path: '.github/workflows/ci.yml',
    keywords: ['ci', 'github actions', 'workflow', 'pipeline', 'pytest'],
    target: { track: 'docs' },
  },
];

export const COMMAND_PALETTE_ITEMS: CommandSearchItem[] = [
  ...DOCUMENTATION_ITEMS,
  ...COMPONENT_ITEMS,
  ...VAULT_FILE_ITEMS,
  ...REPO_PROJECT_FILES,
];

export function filterCommandItems(
  query: string,
  category: 'All' | CommandCategory = 'All',
  items: CommandSearchItem[] = COMMAND_PALETTE_ITEMS
): CommandSearchItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== 'All' && item.category !== category) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const haystack = [
      item.title,
      item.subtitle,
      item.category,
      item.path ?? '',
      ...item.keywords,
    ]
      .join(' ')
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });
}
