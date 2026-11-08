const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

const ALLOWED_PLATFORMS = new Set(["Instagram", "TikTok", "Facebook", "LinkedIn", "X"]);
const ALLOWED_TONES = new Set([
  "Casual and friendly", "Professional", "Persuasive and sales-focused",
  "Funny and playful", "Minimal and elegant", "Bold and energetic"
]);

export async function onRequestPost({ request, env }) {
  if (!env.AI) return json({ error: "Workers AI binding 'AI' belum dikonfigurasi." }, 503);
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    return json({ error: "Content-Type harus application/json." }, 415);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Format JSON tidak valid." }, 400); }

  const clean = (v, max) => typeof v === "string" ? v.trim().replace(/\u0000/g, "").slice(0, max) : "";
  const topic = clean(body.topic, 180);
  const platformInput = clean(body.platform, 30);
  const toneInput = clean(body.tone, 60);
  const language = clean(body.outputLanguage, 40) || "Bahasa Indonesia";
  const details = clean(body.details, 500);
  const platform = ALLOWED_PLATFORMS.has(platformInput) ? platformInput : "Instagram";
  const tone = ALLOWED_TONES.has(toneInput) ? toneInput : "Casual and friendly";

  if (!topic) return json({ error: "Topik wajib diisi." }, 400);
  if (topic.length < 3) return json({ error: "Topik terlalu singkat. Tambahkan sedikit konteks." }, 400);

  const system = `You are Kreovio, a senior social-media copywriter.
FACT SAFETY: Use only facts explicitly present in TOPIC or EXTRA DETAILS. Never invent product features, comfort, materials, quality, benefits, discounts, prices, deadlines, stock, guarantees, testimonials, or performance. "Flash sale" alone does not specify a discount amount or deadline. If facts are sparse, write compelling but neutral copy without adding claims.
QUALITY: Write naturally in the requested language and tone. Avoid clichés, filler, exaggerated claims, repeated hooks, and awkward slang. Make exactly three genuinely different options:
1. RELATABLE: audience-centered and conversational.
2. SHORT & PUNCHY: concise and memorable.
3. ACTION: a gentle, relevant invitation; do not invent an offer or urgency.
Adapt to the platform. Hashtags are optional; use at most 3 relevant ones, and omit them if they add no value.
OUTPUT: Return ONLY valid JSON, no markdown fences or commentary, exactly:
{"captions":["caption one","caption two","caption three"]}
All three values must be non-empty strings. Do not put option labels inside the strings.`;

  const user = `Platform: ${platform}\nTone: ${tone}\nOutput language: ${language}\nTopic: ${topic}\nExtra details: ${details || "None provided"}\nWrite three distinct captions. Do not assume facts not supplied.`;

  let lastReason = "unknown";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: system },
          { role: "user", content: attempt === 0 ? user : user + "\nIMPORTANT: Your previous response did not meet the required format. Return ONLY the exact JSON object with a captions array containing exactly 3 strings. No other text." }
        ],
        max_tokens: 1400,
        temperature: attempt === 0 ? 0.55 : 0.25
      });
      const raw = typeof result?.response === "string" ? result.response :
        typeof result?.result === "string" ? result.result : "";
      const captions = parseCaptions(raw);
      if (captions.length === 3) return json({ captions, model: MODEL, attempts: attempt + 1 });
      lastReason = "invalid_output_format";
      console.warn("Workers AI returned invalid caption format; attempt", attempt + 1);
    } catch (error) {
      lastReason = "ai_request_failed";
      console.error("Workers AI attempt failed:", error);
    }
  }
  return json({
    error: lastReason === "invalid_output_format"
      ? "AI belum memberi tiga caption dalam format yang valid setelah percobaan otomatis. Silakan coba lagi."
      : "Layanan AI sedang bermasalah atau kuota sementara tidak tersedia. Coba lagi sebentar."
  }, 502);
}

function parseCaptions(raw) {
  if (typeof raw !== "string" || !raw.trim()) return [];
  const text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const candidates = [text];
  const first = text.indexOf("{"), last = text.lastIndexOf("}");
  if (first >= 0 && last > first) candidates.push(text.slice(first, last + 1));

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const list = Array.isArray(parsed) ? parsed : parsed?.captions;
      if (Array.isArray(list)) {
        const clean = list.map(v => typeof v === "string" ? v.trim() : "").filter(Boolean);
        if (clean.length === 3) return clean;
      }
    } catch {}
  }

  // Accept clearly labeled plain-text options as a compatibility fallback.
  const matches = [...text.matchAll(/(?:^|\n)\s*(?:\*\*)?(?:option|opsi|caption)\s*([1-3])(?:\*\*)?\s*:?\s*/gi)];
  if (matches.length === 3) {
    const values = matches.map((m, i) => {
      const start = m.index + m[0].length;
      const end = i < 2 ? matches[i + 1].index : text.length;
      return text.slice(start, end).trim().replace(/^["“]|["”]$/g, "").trim();
    });
    if (values.every(Boolean)) return values;
  }
  return [];
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
