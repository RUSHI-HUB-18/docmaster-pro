# DocMaster Pro 🚀

> **The professional document platform for converting, editing, and managing PDF, Word, PPT, Excel, and image files — free and instant.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4-green?logo=express)](https://expressjs.com/)

---

## ✨ Features

- **40+ Document Tools** across PDF, Word, PowerPoint, Excel, Images, and AI categories
- **Premium Dark UI** — glassmorphism, animated gradients, mega-menu navigation
- **Live PDF Tools** — Merge, Split, Compress, Rotate (all functional with browser preview)
- **Coming Soon** — Word, PPT, Excel, Image, and AI tools in development
- **Zero sign-up** — 100% free, no registration required
- **Secure** — Files auto-deleted after 10 minutes, SSL encrypted, sandboxed processing
- **Dashboard** — localStorage-backed file history, quick actions
- **Search** — Instant search across all 40+ tools from the navbar

---

## 🏗️ Architecture

```
DocMaster Pro/
├── frontend/           # Next.js 16 + TypeScript + Tailwind CSS 4
│   └── src/
│       ├── app/        # App Router pages (/, /pdf, /merge, /split, ...)
│       ├── components/ # Navbar, Footer, ToolPageLayout, DownloadCenter, etc.
│       └── lib/        # tools-data.ts (central registry of all 40+ tools)
│
├── backend/            # Express.js + TypeScript API server
│   └── src/
│       ├── server.ts           # App entry point
│       ├── routes/pdf.ts         # PDF API routes (merge, split, compress, rotate)
│       ├── services/pdfService.ts
│       ├── middleware/           # upload, validation
│       └── utils/cleanup.ts
│
└── uploads/            # Temp file storage (sessions deleted after 10 minutes)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/docmaster-pro.git
cd docmaster-pro

# Install all dependencies (root + frontend + backend)
npm install
cd frontend && npm install
cd ../backend && npm install

# Go back to root and start both servers
cd ..
npm run dev
```

This starts:
- **Frontend** → http://localhost:3000 (Next.js dev server)
- **Backend** → http://localhost:5000 (Express API)

---

## 🌐 Deploying to the Web (Free & Public URL)

To share this app via a web link without forcing users to install anything, you can deploy both parts of the app for free:

### 1. Frontend Deployment (Next.js on Vercel)
**Vercel** is the easiest way to host Next.js apps.
1. Sign up for a free account at **[vercel.com](https://vercel.com/)** using your GitHub account.
2. Click **Add New** → **Project**.
3. Import the `docmaster-pro` repository.
4. In the configuration settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select **`frontend`**.
5. Click **Deploy**. Vercel will build your site and give you a public URL (e.g., `https://docmaster-pro.vercel.app`).

### 2. Backend Deployment (Express.js on Render or Railway)
Since the app performs real PDF operations (like merging/compressing), the backend Express server needs to be hosted as a Web Service.
* **Option A: Render (Free)**:
  1. Go to **[render.com](https://render.com/)** and log in with GitHub.
  2. Click **New** → **Web Service**.
  3. Connect the `docmaster-pro` repository.
  4. Fill in:
     - **Name**: `docmaster-pro-api`
     - **Build Command**: `npm install && npm run build` (compiles TypeScript via `tsc` to `dist/`)
     - **Start Command**: `npm start` (runs `node dist/server.js`)
     - **Root Directory**: `backend`
  5. Click **Create Web Service**. Render will host the API publicly (e.g., `https://docmaster-pro-api.onrender.com`).
* **Connecting Frontend & Backend**:
  Once your backend is live, update the API URL variable in your frontend Vercel project configuration to point to the new Render URL instead of `localhost:5000`.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + Vanilla CSS (glassmorphism) |
| Animations | Framer Motion |
| Icons | Lucide React |
| PDF Preview | PDF.js (browser-native) |
| Backend | Express.js 4 + TypeScript |
| PDF Processing | pdf-lib |
| File Upload | Multer |
| Cleanup | `setInterval` sweep every 5 min (10-minute file retention) |

---

## 📄 Live PDF Tools

| Tool | Route | Status |
|---|---|---|
| Merge PDF | `/merge` | ✅ Live |
| Split PDF | `/split` | ✅ Live |
| Compress PDF | `/compress` | ✅ Live |
| Rotate PDF | `/rotate` | ✅ Live |

---

## 🗺️ Roadmap

- [ ] PDF to Word converter
- [ ] Word to PDF converter
- [ ] PPT to PDF / PPT Compressor
- [ ] Image tools (compress, resize, convert)
- [ ] AI tools (summarize, translate, chat with PDF)
- [ ] User accounts with file history
- [ ] Team workspace features

---

## 🔒 Privacy & Security

- Files stored in isolated `/uploads/` subdirectories
- **Auto-deleted after 10 minutes** via scheduled cleanup (sweeps every 5 minutes)
- No file contents inspected or logged
- All API routes served over HTTPS in production

---

## 📜 License

MIT © 2025 DocMaster Pro. All rights reserved.
