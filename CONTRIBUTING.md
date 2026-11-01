# Contributing to Apex Quantum & Cyber Defense Suite

Thank you for your interest in contributing to the **Apex Quantum & Cyber Defense Suite**. We welcome contributions from developers, security researchers, quantum cryptographers, and system engineers.

## Code of Conduct

We expect all contributors to adhere to standard professional etiquette. Please keep discussions civil, inclusive, and constructive.

## How to Contribute

### 1. Development Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/apex-quantum-cyber-suite.git
   cd apex-quantum-cyber-suite
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the full-stack development server (Express backend + Vite frontend on port 3000):
   ```bash
   npm run dev
   ```

### 2. Code Quality & Standards

Before submitting a Pull Request, ensure that:
- Code passes strict TypeScript type checks and linting without errors:
  ```bash
  npm run lint
  ```
- The production Vite build completes successfully:
  ```bash
  npm run build
  ```
- Any new backend Express endpoints are properly validated and error-handled.
- All post-quantum cryptographic parameters follow published NIST specifications (FIPS 203, FIPS 204, FIPS 205).

### 3. Commit Message Formatting

We follow the Conventional Commits specification:
- `feat: add ML-KEM-1024 parameter set support`
- `fix: resolve lattice vector overflow in tensor simulation`
- `docs: update NIST PQC compliance timeline matrix`
- `ci: add automated multi-version Node build action`

### 4. Pull Request Submission

1. Create a feature branch (`git checkout -b feat/quantum-circuit-optimizations`).
2. Commit your changes with clear commit messages.
3. Push to your fork (`git push origin feat/quantum-circuit-optimizations`).
4. Open a Pull Request referencing any related issues.
