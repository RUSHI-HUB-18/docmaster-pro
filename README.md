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
- **Secure** — Files auto-deleted after 1 hour, SSL encrypted, sandboxed processing
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
├── backend/            # Express.js API server
│   └── server.js       # PDF operations: merge, split, compress, rotate
│
└── uploads/            # Temp file storage (auto-cleaned every hour)
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

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + Vanilla CSS (glassmorphism) |
| Animations | Framer Motion |
| Icons | Lucide React |
| PDF Preview | PDF.js (browser-native) |
| Backend | Express.js 4 |
| PDF Processing | pdf-lib |
| File Upload | Multer |
| Cleanup | node-cron (1-hour auto-delete) |

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
- **Auto-deleted after 60 minutes** via cron job
- No file contents inspected or logged
- All API routes served over HTTPS in production

---

## 📜 License

MIT © 2025 DocMaster Pro. All rights reserved.
