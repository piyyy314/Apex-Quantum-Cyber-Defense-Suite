# Security & Post-Quantum Cryptography Policy

## Responsible Disclosure

The **Apex Quantum & Cyber Defense Suite** takes security vulnerabilities seriously. If you discover a security flaw, API key leak vulnerability, or algorithmic bug, please report it responsibly rather than opening a public issue.

### How to Report a Vulnerability
- **Email:** `security@apexquantumsuite.org`
- Include a detailed technical description of the issue, steps to reproduce, and proof of concept if available.
- Reports are acknowledged within 24 hours and triaged within 72 hours.

## Post-Quantum Cryptography (PQC) Security Standard

This suite implements post-quantum cryptographic primitives aligned with the official NIST FIPS standards:
- **FIPS 203 (ML-KEM):** Module-Lattice-Based Key-Encapsulation Mechanism (formerly CRYSTALS-Kyber).
- **FIPS 204 (ML-DSA):** Module-Lattice-Based Digital Signature Algorithm (formerly CRYSTALS-Dilithium).
- **FIPS 205 (SLH-DSA):** Stateless Hash-Based Digital Signature Algorithm (formerly SPHINCS+).

### Cryptographic Agility & Key Rotation
- Systems should maintain dual key support (Hybrid classical RSA/ECC + PQC) during the transition phase.
- Pre-quantum algorithms (RSA-2048, ECDSA P-256) are flagged as **CRITICAL RISK** in our live scanning audits.

## Data Privacy & Real Live Intelligence
- Live threat feeds utilize public threat intelligence APIs and server-side real-time Gemini AI analysis (`@google/genai`).
- API keys (`GEMINI_API_KEY`) are managed strictly server-side and never exposed to the client bundle.
