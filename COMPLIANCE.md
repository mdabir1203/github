# Lenden Compliance Framework (GRC) v3.2

This document serves as the formal Governance, Risk, and Compliance (GRC) bridge for auditing under **ISO 27001**, **SOC 2 Type II**, and **GDPR** standards.

## 1. ISO 27001: Information Security Management
Lenden implements an Information Security Management System (ISMS) focused on the following controls:
- **A.9 Access Control**: Mandatory 4-6 digit PIN with exponential backoff on failure. Encryption keys are non-exportable and tied to hardware enclaves.
- **A.12 Operations Security**: Scalability Engine (Web Worker isolator) ensures that data processing integrity is maintained off the main thread.
- **A.18 Compliance**: In-app "Trust Center" providing transparency on security controls.

## 2. SOC 2 Type II: Trust Services Criteria
- **Security**: AES-GCM-256 local-first encryption. No central PII database.
- **Availability**: Off-line first architecture using Yjs CRDT and IndexedDB mesh storage ensures processing integrity regardless of connectivity.
- **Confidentiality**: All sensitive fields (NID, bKash) are encrypted before rest in IndexedDB using PBKDF2 derived keys.
- **Privacy**: Inherent Zero-Trust architecture. Zero data sharing with third parties.

## 3. GDPR: Data Protection & Privacy
Lenden empowers users with all relevant GDPR rights through the in-app Trust Center:
- **Art. 15 Right of Access**: "Export My Data" tool generates a machine-readable JSON bundle of the entire account state.
- **Art. 17 Right to Erasure**: "Deep Purge" functionality performs an atomic wipe of local storage and peer-to-peer mesh persistence.
- **Art. 20 Data Portability**: Standardized JSON format provided for seamless transition between financial platforms.
- **Data Minimization**: We collect only the minimum required fields (Name, Phone, Balance) for local ledgering.

## 4. Technical Audit Log
- **System Events**: Internal tracking of PIN changes and security state transitions (observable via Console in Debug sessions).
- **Relational Integrity**: `db.ts` enforces atomic reverts on balance changes when transactions are deleted, preventing shadow accounting.

---
**Certified Compliant Path 2026**
*Governance Document for Lenden Mobile APK Deployment.*
