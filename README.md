# Mario AI Chatbot — Cloudflare Pages Function

AI chatbot serverless untuk menjawab pertanyaan calon klien Mario Automation di landing marioautomation.com. Powered by **Cloudflare Workers AI** (Llama 3.3 70B, gratis 10K neurons/hari).

## Struktur

```
mario-ai-chatbot/
├── index.html              # Homepage info (root)
├── functions/api/chat.js   # Endpoint POST /api/chat
├── wrangler.toml           # Config (for local dev)
└── README.md               # This file
```

## Setup Cloudflare Pages (sekali setup, lalu auto-deploy)

### 1. Login Cloudflare Dashboard
Buka https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.

### 2. Connect GitHub Repo
- Authorize Cloudflare access ke GitHub kalau pertama kali
- Pilih repo: `belitungmario-hub/mario-ai-chatbot`
- Branch: `main`
- Klik **Begin setup**

### 3. Build Settings
- Framework preset: **None**
- Build command: *(kosong)*
- Build output directory: `/`
- Klik **Save and Deploy**

Tunggu ~1 menit. Setelah selesai, Cloudflare kasih URL seperti `mario-ai-chatbot.pages.dev`.

### 4. Tambah Binding Workers AI ⚠️ WAJIB
- Buka Pages project yang baru dibuat
- **Settings** → **Functions** → **Bindings**
- Klik **Add binding** → **Workers AI**
- Variable name: `AI`
- Klik **Save**
- Klik **Retry deployment** untuk apply binding

### 5. Test Endpoint

```bash
curl -X POST https://mario-ai-chatbot.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"berapa harga paket pemula?"}'
```

Harus return JSON dengan `reply` berisi info paket Pemula.

## Update / Edit

Edit `functions/api/chat.js` (system prompt, model, dll), commit + push ke GitHub. Cloudflare Pages auto-deploy dalam ~1 menit.

## Pricing

- **Gratis 10.000 neurons/hari** dari Cloudflare Workers AI
- **Gratis 100.000 request/hari** dari Cloudflare Pages
- Cukup untuk traffic landing marioautomation.com tahap awal

## Embed di Landing

Setelah dapat URL dari Cloudflare Pages, embed widget chat di marioautomation.com → POST ke URL itu untuk dapat AI reply.

---

© 2026 Mario Automation · [marioautomation.com](https://marioautomation.com)
