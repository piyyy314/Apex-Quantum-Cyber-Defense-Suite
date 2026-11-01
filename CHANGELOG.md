# Changelog

All notable changes to the **Apex Quantum & Cyber Defense Suite** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-31

### Added
- **Aegis Security View:** Live threat stream intelligence fed by `@google/genai` server-side analysis. Real-time active threat alerts with severity tagging, target asset tracking, and standard remediation guidance.
- **Nebula Quantum View:** High-performance quantum tensor engine with Shor's algorithm integer factorization simulations, Grover's database unstructured search quadratic speedup metrics, lattice basis reduction (LLL), and real-time state vector state plotting.
- **Cipher Vault:** Live NIST PQC key pair generator supporting ML-KEM-768/1024, ML-DSA-65/87, and SLH-DSA. Includes real-time cryptographic audit scanner for legacy primitives (RSA, ECC, AES-128).
- **Executive Documentation & Theory:** Detailed technical breakdown with mathematical proofs for lattice-based cryptography, Shor's period finding polynomial bounds, and migration roadmap guidance.
- **Full-Stack Express Server (`server.ts`):** Mounted Express API endpoints (`/api/intel/live-threats`, `/api/cyber/analyze`, `/api/quantum/simulate`, `/api/pqc/generate`, `/api/health`).
- **Production DevOps Suite:** Multi-stage Dockerfile, GitHub CI/CD workflows, issue templates, PR templates, license, contributing guidelines, and security policies.
