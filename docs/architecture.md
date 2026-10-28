# System Architecture: Drug–Target Interaction Analysis Tool

## 1. Architectural Overview

The **Drug–Target Interaction Analysis Tool for Therapeutic Discovery** is designed as a multi-tier, decoupled scientific computing ecosystem.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
+------------------------------------+------------------------------------+
|  Web Frontend (React / TypeScript) |  Native Mobile (Android Compose)   |
|  - Vite + Tailwind CSS + Lucide    |  - Kotlin + Material 3             |
|  - React Router                    |  - ViewModel + StateFlow           |
|  - Firebase JS SDK                 |  - Retrofit + OkHttp               |
+------------------+-----------------+------------------+-----------------+
                   |                                    |
                   | REST                               | REST
                   v                                    v
+-------------------------------------------------------------------------+
|                      SCIENTIFIC API (Python FastAPI)                    |
|  - FastAPI + Pydantic validation + HTTPX asynchronous client            |
|  - Endpoints: /health, /api/v1/interactions/targets, /predict           |
|  - Chemoinformatics hooks: SMILES parsing, binding affinity (pKd/Kd)     |
+-------------------------------------------------------------------------+
                   ^                                    ^
                   |                                    |
                   | Firebase Auth & Firestore Sync     | Firebase Auth & Firestore Sync
                   v                                    v
+-------------------------------------------------------------------------+
|                  SHARED CLOUD BACKEND (Google Firebase)                |
|  - Firebase Authentication: Multi-tenant user identity                 |
|  - Cloud Firestore: Research notebooks, screening runs, affinity cache  |
|  - Cloud Storage: PDB structures, SDF ligand files, docking archives    |
|  - Firebase Hosting: Static web bundle distribution                    |
+-------------------------------------------------------------------------+
```

## 2. Directory Structure

```
DrugTargetDiscovery/
├── web/                   # React + TypeScript + Vite + Tailwind CSS frontend
├── android/               # Genuine Native Kotlin + Jetpack Compose Android app
├── backend/               # Python FastAPI + Pydantic scientific microservice
├── firebase/              # Firebase Hosting, Security Rules, and Index configurations
├── docs/                  # System documentation and architecture diagrams
├── README.md              # Full repository instructions and developer setup
└── .gitignore             # Comprehensive security and build exclusion rules
```

## 3. Communication Protocols

1. **Web to Backend:**
   - Standard HTTP REST via `fetch` client (`web/src/services/api.ts`).
   - Default local endpoint: `http://localhost:8000`.

2. **Android to Backend:**
   - Retrofit 2 + Gson converter (`android/app/.../api/ApiClient.kt`).
   - Default emulator alias: `http://10.0.2.2:8000` (maps to host `localhost:8000`).

3. **Client to Firebase:**
   - Direct client SDK connection using Firebase Authentication and Cloud Firestore.
   - Enforced by granular Firestore Security Rules (`firebase/firestore.rules`).
