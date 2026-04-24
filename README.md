# 💳 Lenden (লেনদেন) - Financial Intelligence for Local Merchants

Lenden is a local-first, privacy-focused financial ledger designed specifically for small business owners and high-volume merchants. It combines regional dialect personalization with industrial-grade security and advanced data governance.

## 🚀 Key Features

- **Multi-Dialect Personalization**: Support for Chittagonian, Sylheti, Dhakaiyya, Barishailla, and Banglish.
- **Secure by Default**: Exponential backoff PIN lockout and hardware-backed AES-GCM-256 encryption.
- **Data Sovereignty**: Local-first architecture using IndexedDB and CRDT mesh networking.
- **Intelligence Hub**: AI-driven cash flow insights and recovery velocity metrics (CoreML Principles).
- **Compliance Center**: Formal alignment with ISO 27001, SOC 2 Type II, and GDPR (Right to Access/Erasure).

---

## 🛠️ Local Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/) (installed with Node.js)

### Setup Steps

1. **Clone the repository** (or download source):
   ```bash
   git clone <repository-url>
   cd lenden
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🐳 Running with Docker

The easiest way to run a production-ready audit of Lenden is via Docker.

### Using Docker Compose (Recommended)

1. **Start the application**:
   ```bash
   GEMINI_API_KEY=your_key_here docker-compose up --build -d
   ```

2. **Access the app**:
   Lenden will be running at [http://localhost:3000](http://localhost:3000).

### Using Docker Directly

```bash
# Build the image
docker build -t lenden-app --build-arg GEMINI_API_KEY=your_key_here .

# Run the container
docker run -p 3000:3000 lenden-app
```

---

## 🛡️ Auditing & Compliance

Detailed compliance specifications can be found in the following documents:

- [SYSTEM_ARCH.md](./SYSTEM_ARCH.md) - Technical architecture and TWA packaging.
- [HACKER_AUDIT.md](./HACKER_AUDIT.md) - Security audit and vulnerability mitigation log.
- [COMPLIANCE.md](./COMPLIANCE.md) - Formal GRC framework (ISO/SOC2/GDPR).

### Accessing the Trust Center
Once logged in, navigate to **Settings > Security & Compliance** to audit your data portability and erasure rights.

---

## 🏛️ License

Proprietary. Built for secure local financial management.
