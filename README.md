# Apex Quantum & Cyber Defense Suite 🛡️⚛️

[![GitHub Repository](https://img.shields.io/badge/GitHub-piyyy314%2FApex_Quantum_%26_Cyber_Defense_Suite-blue?logo=github)](https://github.com/piyyy314/Apex-Quantum-Cyber-Defense-Suite)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/piyyy314/Apex-Quantum-Cyber-Defense-Suite)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![NIST PQC](https://img.shields.io/badge/NIST-FIPS_203%20%7C%20204%20%7C%20205-purple.svg)](SECURITY.md)
[![Python & Node](https://img.shields.io/badge/Stack-Python_3%20%7C%20Node.js_20-green.svg)](setup.sh)

> **Repository:** `piyyy314/Apex Quantum & Cyber Defense Suite`

An enterprise-grade, full-stack **Cyber Security Intelligence & Post-Quantum Cryptography (PQC) Simulation Suite**. Designed for security operations teams, cryptographic researchers, and system architects preparing infrastructure for post-quantum defense before "Q-Day" (the arrival of Cryptographically Relevant Quantum Computers - CRQCs).

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Component Breakdown](#-component-breakdown)
- [Automated Setup & Installation](#-automated-setup--installation)
- [Live API Reference](#-live-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Verification & Quality Control](#-verification--quality-control)
- [License Information](#-license-information)

---

## 🛡️ Project Overview

The **Apex Quantum & Cyber Defense Suite** bridges cutting-edge post-quantum cryptographic engineering with real-time threat intelligence. Powered by server-side Gemini AI (`@google/genai`) and a high-performance quantum simulation tensor engine, the suite provides real live security monitoring alongside mathematical quantum attack simulations (Shor's, Grover's, and Lattice Basis Reduction).

### Key Architecture Highlights
```
                     ┌─────────────────────────────────────────┐
                     │          React 19 Frontend SPA          │
                     │  (Vite + Tailwind CSS v4 + Lucide)      │
                     └────────────────────┬────────────────────┘
                                          │
                                   HTTP / REST API
                                          │
                     ┌────────────────────▼────────────────────┐
                     │         Express Server Backend          │
                     │             (server.ts)                 │
                     └─────────┬─────────────────────┬─────────┘
                               │                     │
                  ┌────────────▼──────────┐   ┌──────▼───────────────────┐
                  │ Google Gemini AI API  │   │ Quantum Tensor Engine &  │
                  │ (@google/genai SDK)   │   │ NIST PQC Generators      │
                  └───────────────────────┘   └──────────────────────────┘
```

---

## 🧩 Component Breakdown

### 1. 🛡️ Aegis Security Shield (Threat Intelligence & Payload Analysis)
- **Live Cyber Threat Stream:** Real-time synthesis of active global threat vectors, zero-day vulnerabilities, state-sponsored attack metrics, and target asset tracking using `@google/genai`.
- **AI Threat Analyzer:** Submit raw logs, suspicious shellcode, or payload snippets to receive instant AI security analysis, CVE mapping, and defensive remediation guidance.

### 2. ⚛️ Nebula Quantum Lab (Quantum Tensor Engine & Circuit Simulator)
- **Shor's Integer Factorization Engine:** Simulates quantum period-finding circuits for breaking composite integers $N = p \cdot q$. Displays quantum register measurements and state vector probability distributions.
- **Grover's Unstructured Search:** Demonstrates $O(\sqrt{N})$ quadratic quantum speedup across database search spaces with interactive oracle configuration.
- **Lattice-Based Cryptanalysis:** Simulates Learning With Errors (LWE), Shortest Vector Problem (SVP) noise distributions, and Lenstra–Lenstra–Lovász (LLL) basis reduction.

### 3. 🔐 Cipher Vault (NIST PQC Key Generator & Audit Engine)
- **NIST Standard Key Pair Generation:**
  - **ML-KEM** (Module-Lattice Key Encapsulation - FIPS 203 / Kyber-768/1024)
  - **ML-DSA** (Module-Lattice Digital Signatures - FIPS 204 / Dilithium-65/87)
  - **SLH-DSA** (Stateless Hash Signatures - FIPS 205 / SPHINCS+)
- **Infrastructure Cryptographic Auditor:** Scans legacy infrastructure primitives (RSA, ECDSA, AES-128) and assigns a Post-Quantum Vulnerability Index with migration roadmaps.

### 4. 📜 Executive Theory & Documentation
- Comprehensive theoretical guides with LaTeX mathematical proofs for period-finding algorithms, amplitude amplification, lattice noise bounds, and NIST migration protocols.

---

## ⚙️ Automated Setup & Installation

### Option A: Using `setup.sh` (Automated Script)

We provide an automated setup script `setup.sh` that initializes a Python virtual environment (`.venv`), upgrades `pip`, installs Python scientific libraries (`rich`, `numpy`, `scipy`), and installs all Node.js dependencies (`npm install`).

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/piyyy314/Apex-Quantum-Cyber-Defense-Suite.git
   cd Apex-Quantum-Cyber-Defense-Suite
   ```

2. **Make `setup.sh` Executable & Run:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Activate Virtual Environment & Start Server:**
   ```bash
   source .venv/bin/activate
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

### Option B: Manual Installation

#### 1. Python Environment Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install rich numpy scipy
```

#### 2. Node.js Environment Setup
```bash
cp .env.example .env
npm install
npm run dev
```

---

## 📡 Live API Reference

The suite exposes the following production Express REST endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check and system uptime monitor |
| `/api/intel/live-threats` | `GET` | Real-time global threat stream generated via Gemini AI |
| `/api/cyber/analyze` | `POST` | AI-powered deep threat payload analysis |
| `/api/quantum/simulate` | `POST` | High-fidelity quantum tensor simulation engine (Shor / Grover / Lattice) |
| `/api/pqc/generate` | `POST` | NIST-compliant PQC key pair generation (ML-KEM, ML-DSA, SLH-DSA) |

---

## 🐳 Docker Deployment

To deploy using Docker multi-stage builds:

```bash
# Build Docker image
docker build -t apex-quantum-suite:1.0.0 .

# Run container on port 3000
docker run -d -p 3000:3000 -e GEMINI_API_KEY="your_gemini_api_key" --name apex-suite apex-quantum-suite:1.0.0
```

---

## 🧪 Verification & Quality Control

Verify code health and type integrity prior to committing:

```bash
# Type check and linting
npm run lint

# Production Vite build check
npm run build
```

---

## 📄 License Information

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for complete details.

```
Copyright 2026 piyyy314 / Apex Quantum & Cyber Defense Suite Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```
