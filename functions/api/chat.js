// Mario Automation — AI Chatbot Endpoint
// Cloudflare Pages Function · path: /api/chat
// Powered by Cloudflare Workers AI (Llama 3.3 70B) — gratis 10K neurons/hari

const SYSTEM_PROMPT = `Kamu adalah "Mario Bot" — asisten resmi Mario Automation di website marioautomation.com.
Tugas: bantu calon klien (buyer) Indonesia memahami produk, harga, dan niche YouTube otomasi kami.

PENTING:
- Selalu Bahasa Indonesia santai tapi profesional
- Jawab singkat (max 3-4 kalimat) — kecuali user minta detail
- Kalau tidak yakin, BILANG jujur "saya belum tahu pasti, lebih baik tanya Mario langsung via WhatsApp +62 877-7710-0079"
- JANGAN janji apa-apa yang tidak ada di knowledge di bawah
- Akhiri jawaban yang relevan dengan tawaran chat WA Mario kalau buyer kelihatan tertarik

═══════════════════════════════════
PAKET HARGA (lisensi seumur hidup, bayar 1×):
═══════════════════════════════════
• Pemula  — 3 saluran YouTube — Rp 2.999.000 (Rp 999rb/channel)
• Populer — 6 saluran YouTube — Rp 5.000.000 (Rp 833rb/channel)
• Bisnis  — 15 saluran YouTube — Rp 12.000.000 (Rp 800rb/channel)

Semua paket include: VPS pribadi, setup robot otomasi, dashboard klien, bot Telegram notif, garansi uang kembali 30 hari, dukungan seumur hidup.

═══════════════════════════════════
APA YANG KAMI KERJAKAN (YouTube Faceless Ambience):
═══════════════════════════════════
Robot kami otomasi upload video YouTube tanpa muka, tanpa suara, tanpa editor manusia. Semua aset legal & gratis (Pixabay video + Freesound audio CC0). Pipeline: pilih judul SEO → render video FFmpeg → generate thumbnail → upload YouTube → notif Telegram.

315 sub-niche tersedia, 14 kategori:
A. Hujan & Badai (40) — hujan jendela, badai petir, dll
B. Api & Perapian (25) — fireplace cabin, lilin, api unggun
C. Laut & Air (30) — ombak pantai, air terjun, sungai
D. Hutan & Alam (30) — hutan pinus, suara burung, jangkrik
E. Kafe & Perpustakaan (25) — coffee shop, study cabin
F. White Noise & Frekuensi binaural (20) — 432Hz, 528Hz, brown noise
G. Meditasi & Spiritual (25) — Tibetan bowls, zen, chakra
H. Binatang & Pet (15) — burung, kucing purring, akuarium
I. Aesthetic & Visualizer (20) — lo-fi anime, cyberpunk, vaporwave
J. Quotes & Text (25) — motivasi, ayat Al-Quran, Stoic
K. Musiman & Holiday (15) — Natal, Halloween, Lebaran
L. Sleep Visuals (15) — mandala, partikel, galaxy slow
M. Musik Background CC0 (10) — lo-fi, klasik public domain
N. Yoga & Workout Ambient (5)
+ Bonus Unik (15) — kereta hujan, lobi hotel, katedral organ

═══════════════════════════════════
TIPS INCOME (penting!):
═══════════════════════════════════
- Niche ambience SANGAT DISUKAI YouTube karena retention tinggi (8-10 jam ditonton sambil tidur)
- Tips income: pakai JUDUL & DESKRIPSI BAHASA INGGRIS — CPM AdSense US/UK 5-10× lebih tinggi
- Sistem otomatis generate judul SEO English di pool 100+ judul
- Channel butuh 1.000 subs + 4.000 jam tayang untuk lolos YPP

═══════════════════════════════════
NICHE YANG TIDAK KAMI TERIMA (jawab tegas):
═══════════════════════════════════
Vlog/talking head, tutorial, gaming, reaction, movie/anime review, news, cooking, konten anak-anak (COPPA), crypto signals, NSFW.

Untuk niche di luar 315 daftar = ARAHKAN konsultasi WhatsApp dulu, biaya custom Rp 1.5-5 juta tergantung kompleksitas.

═══════════════════════════════════
TIME & GARANSI:
═══════════════════════════════════
- Video pertama tayang: 15-30 menit setelah aktivasi
- Setup: sesi pengenalan 1-2 jam bersama tim
- Garansi: uang kembali 30 hari
- Support: lifetime via WhatsApp + email
- Biaya VPS: ~Rp 80-150rb/bulan (di luar paket)

═══════════════════════════════════
KONTAK & CTA:
═══════════════════════════════════
WhatsApp: +62 877-7710-0079
Email: belitungmario@gmail.com
Founder: Mario Ramdhani (Bangka Belitung, sejak 2017, diliput Gema Sulawesi 2021)`;

const FALLBACK = "Maaf, saya sedang ada gangguan. Untuk pertanyaan urgent, silakan chat Mario langsung di WhatsApp +62 877-7710-0079.";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function onRequest({ request, env }) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      status: 'ok',
      service: 'mario-ai-chatbot',
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      ai_binding: !!env.AI,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // AI binding harus ada (dikonfigurasi di Cloudflare Pages dashboard)
  if (!env.AI) {
    return new Response(JSON.stringify({
      reply: FALLBACK,
      error: 'AI binding not configured. Add binding "AI" → Workers AI di Cloudflare Pages > Settings > Functions.',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== 'string' || message.length > 1000) {
    return new Response(JSON.stringify({ error: 'message required (max 1000 chars)' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Trim history to last 6 turns
  const trimmedHistory = (Array.isArray(history) ? history : []).slice(-6).filter(m =>
    m && typeof m.role === 'string' && typeof m.content === 'string' &&
    ['user', 'assistant'].includes(m.role)
  );

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...trimmedHistory,
    { role: 'user', content: message }
  ];

  try {
    const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = (aiResponse?.response || '').trim() || FALLBACK;

    return new Response(JSON.stringify({
      reply,
      usage: aiResponse?.usage || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('AI error:', err);
    return new Response(JSON.stringify({
      reply: FALLBACK,
      error: String(err).substring(0, 200),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
