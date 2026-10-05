<div align="center">

# 🇮🇳 BharathVoice AI
### Voice-First Multilingual Citizen Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

<p align="center">
  <b>Empowering every Indian citizen to speak, understand, and access verified public welfare schemes in their native language.</b>
  <br />
  Supports <b>Telugu (తెలుగు)</b> • <b>Hindi (हिन्दी)</b> • <b>Kannada (ಕನ್ನಡ)</b> • <b>English</b>
</p>

[Explore Services](https://bharathvoice-ai.vercel.app/services) • [Live Voice Assistant](https://bharathvoice-ai.vercel.app/assistant) • [Citizen Dashboard](https://bharathvoice-ai.vercel.app/dashboard)

</div>

---

## 🌟 Key Highlights

- 🎙️ **Voice-First Native Multilingual Pipeline**: Speak directly in your mother tongue using real-time browser STT/TTS without needing English fluency or keyboard typing.
- 🛡️ **100% Grounded RAG (Zero Hallucinations)**: Answers are assembled strictly from official government registries (National Scholarship Portal, PM-KISAN, Ayushman Bharat, UIDAI, NCS).
- ⚡ **Sub-Second FAISS Vector Retrieval**: Instant multilingual semantic search using Sentence Transformers (`paraphrase-multilingual-MiniLM-L12-v2`).
- ☁️ **Supabase Cloud Database Integration**: Cloud persistence for citizen profiles, conversations, messages, and bookmarked public welfare schemes.
- 🎨 **Masterpiece Dark Holographic UI**: Custom acoustic chakra soundwave emblem, interactive fluid aurora canvas, glassmorphism, and responsive design.

---

## 🏛️ Application Architecture

```
bharathvoice-ai/
│
├── frontend/                     # Next.js 14 App Router Frontend
│   ├── app/
│   │   ├── page.tsx              # Clean landing gateway & citizen workspace hub
│   │   ├── services/page.tsx     # Separate Explore Services directory
│   │   ├── assistant/page.tsx    # Live Voice & Text Citizen Assistant
│   │   ├── dashboard/page.tsx    # Citizen Dashboard (metrics & conversations)
│   │   ├── profile/page.tsx      # Profile & Supabase cloud storage settings
│   │   ├── login/page.tsx        # Authentication page (Google & Credentials)
│   │   └── layout.tsx            # Global Masterpiece Background & theme
│   ├── components/
│   │   ├── BrandLogo.tsx         # Sovereign Soundwave Chakra vector emblem
│   │   ├── Navbar.tsx            # Navigation header with Home & Sign Out
│   │   ├── Sidebar.tsx           # Inner app navigation sidebar
│   │   ├── MasterpieceBackground # Dynamic fluid aurora & cyber blueprint canvas
│   │   ├── ChatWindow.tsx        # Multilingual conversational interface
│   │   ├── CategoryCard.tsx      # Public service cards with hover lift
│   │   └── ProfilePanel.tsx      # Preferences & live Supabase connection tester
│   └── lib/
│       ├── api.ts                # Backend API client
│       ├── auth.ts               # Tab-persisted session authentication
│       ├── supabase.ts           # Supabase client & storage synchronization
│       └── types.ts              # TypeScript interfaces
│
├── backend/                      # FastAPI Python Backend
│   ├── main.py                   # FastAPI server entrypoint
│   ├── api/                      # Routes: chat, voice, services, conversations, health
│   ├── database/
│   │   ├── db.py                 # SQLAlchemy engine (SQLite + Supabase Postgres)
│   │   └── supabase_client.py    # Supabase cloud database sync client
│   ├── models/                   # ORM models and Pydantic schemas
│   └── rag/                      # FAISS vector store, retriever & generator
│
├── knowledge_base/               # Verified official government schemes (JSON)
├── supabase_schema.sql           # Complete Supabase SQL schema with RLS policies
└── requirements.txt              # Backend dependencies
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+ (with `venv`)
- (Optional) **Supabase account** for cloud database storage

---

### 2. Frontend Setup

```bash
cd frontend
npm install

# Run development server
npm run dev
```

Frontend runs at `http://localhost:3000`.

To create an optimized production build:
```bash
npm run build
npm run start
```

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv ../venv
# Windows:
..\venv\Scripts\activate
# Linux/macOS:
source ../venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Start FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

---

## ⚡ Supabase Cloud Database Setup

BharathVoice AI includes built-in support for **Supabase**:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and execute the script in [`supabase_schema.sql`](./supabase_schema.sql).
3. Copy your **Project URL** and **Public Anon Key**.
4. Configure either:
   - In **Frontend UI**: Go to **My Profile** → **Supabase Cloud Database** card → Paste credentials and click **Test & Save Connection**.
   - Or in `frontend/.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
   - In `backend/.env`:
     ```env
     SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_KEY=your-service-or-anon-key
     ```

---

## 🌐 Deploy to Vercel

### Deploying the Frontend to Vercel:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of BharathVoice AI"
   git remote add origin https://github.com/Girishkumar0315/BharathVoice-AI.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) → **Add New Project**.
3. Import `Girishkumar0315/BharathVoice-AI`.
4. Set **Root Directory** to `frontend`.
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: URL of your deployed backend (or local backend)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Deploy**.

---

## 🔒 Security & Privacy

- **Citizen Privacy**: Zero tracking of personally identifiable biometric data.
- **Session Security**: Sessions are tab-isolated and require re-authentication upon opening new visits.
- **Row-Level Security (RLS)**: Enforced across all Supabase database tables.

---

## 📜 License

Distributed under the MIT License. Built with ❤️ for Bharat.
