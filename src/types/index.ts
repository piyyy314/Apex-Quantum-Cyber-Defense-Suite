export type AppTrack = 'defense' | 'quantum' | 'vault' | 'docs';

export type ActiveCreationId = 
  | 'vsat-toolkit'
  | 'aegis-security'
  | 'project-nebula'
  | 'project-titan'
  | 'project-hyperion';

export interface CodeArtifact {
  id: string;
  title: string;
  filename: string;
  language: 'python' | 'html' | 'bash' | 'json';
  category: 'Cyber Defense' | 'Quantum Tensor' | 'Validation Suite';
  version: string;
  description: string;
  prerequisites: string[];
  executionCommand: string;
  code: string;
  keyFeatures: string[];
  mathematicalFoundations?: string[];
}

export interface SocLogEvent {
  id: string;
  timestamp: string;
  type: 'INFO' | 'ALERT' | 'RESTORE' | 'BLOCK' | 'PQC' | 'ENTROPY';
  message: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface HoneypotHit {
  id: string;
  time: string;
  ip: string;
  port: number;
  service: string;
  action: 'BLOCKED' | 'QUARANTINED' | 'HONEYTOKEN_TRIPPED';
}

export interface FimRecord {
  id: string;
  time: string;
  file: string;
  action: 'HASH_MISMATCH' | 'RESTORED' | 'BASELINE_LOCKED';
  oldHash: string;
  newHash: string;
}

export interface AnomalyRecord {
  id: string;
  time: string;
  packetSize: number;
  durationMs: number;
  anomalyScore: number;
  status: 'FLAGGED' | 'INSPECTED' | 'ISOLATED';
}

export interface QuantumNodeMetrics {
  nodeId: string;
  quadrant: string;
  qubitCount: number;
  entropyBits: number;
  maxBondDim: number;
  status: 'IDLE' | 'COMPUTING' | 'COMPLETED' | 'SYNCHRONIZED';
  executionTimeMs: number;
}
