const $ = (id) => document.getElementById(id);
const translations = {
  id: {
    navGenerator:"AI Caption",navHow:"Cara kerja",eyebrow:"AI CONTENT STUDIO · BETA",
    heroTitle:'Ide kamu,<br><span>siap jadi caption.</span>',
    heroCopy:"Ubah ide sederhana menjadi caption media sosial yang terasa natural. Dirancang untuk kreator, brand, dan bisnis.",
    heroCta:"Buat caption sekarang",heroProof:"Tiga arah kreatif. Satu brief sederhana.",
    sectionEyebrow:"GENERATOR",toolTitle:"AI Caption Generator",toolSubtitle:"Ceritakan konteksnya. Kami bantu menemukan kata-katanya.",
    topicLabel:"Apa topik kontenmu?",topicPlaceholder:"Contoh: Sneakers hitam untuk aktivitas sehari-hari",
    platformLabel:"Platform",toneLabel:"Gaya penulisan",languageLabel:"Bahasa caption",
    toneCasual:"Santai & akrab",tonePro:"Profesional",toneSales:"Persuasif",toneFunny:"Lucu & playful",toneMinimal:"Minimalis & elegan",toneBold:"Berani & energik",
    detailsLabel:"Detail tambahan",optional:"(opsional)",detailsPlaceholder:"Fakta produk, target audiens, promo, atau ajakan bertindak...",
    privacyNote:"Jangan masukkan kata sandi atau informasi pribadi yang sensitif.",
    generate:"Buat caption",working:"Sedang membuat...",resultKicker:"PILIHAN KREATIFMU",resultTitle:"Tiga cara menyampaikan idemu.",resultSubtitle:"Pilih caption yang paling cocok dengan brand-mu.",options:"OPSI",
    copy:"Salin caption",copied:"Tersalin!",copyFailed:"Gagal menyalin",resultHint:"Periksa nama, fakta, harga, dan klaim sebelum dipublikasikan.",regenerate:"Buat tiga opsi lain",
    workflow:"ALUR SEDERHANA",howTitle:"Dari ide menjadi caption.",stepOneTitle:"Masukkan konteks",stepOneCopy:"Ceritakan kontenmu, platform tujuan, dan gaya bahasa yang diinginkan.",stepTwoTitle:"Buat ide",stepTwoCopy:"Dapatkan tiga pendekatan caption berbeda berdasarkan brief-mu.",stepThreeTitle:"Sesuaikan dan gunakan",stepThreeCopy:"Salin favoritmu, edit seperlunya, lalu publikasikan.",notice:"Kreovio AI masih beta. AI bisa membuat kesalahan—periksa hasil sebelum dipublikasikan.",footer:"Dibuat untuk ide yang lebih baik.",about:"Tentang",privacy:"Privasi",
    errors:{topic:"Isi topik konten terlebih dahulu.",failed:"Generator sedang tidak tersedia. Coba lagi sebentar.",tooLong:"Periksa kembali panjang topik atau detail tambahan.",generic:"Permintaan gagal. Silakan coba lagi."}
  },
  en: {
    navGenerator:"AI Caption",navHow:"How it works",eyebrow:"AI CONTENT STUDIO · BETA",
    heroTitle:'Your ideas,<br><span>caption-ready.</span>',
    heroCopy:"Turn a simple idea into social captions that sound natural. Made for creators, brands, and businesses.",
    heroCta:"Create your caption",heroProof:"Three creative directions. One simple brief.",
    sectionEyebrow:"THE GENERATOR",toolTitle:"AI Caption Generator",toolSubtitle:"Give us the context. We’ll help you find the words.",
    topicLabel:"What is your post about?",topicPlaceholder:"e.g. Black everyday sneakers",
    platformLabel:"Platform",toneLabel:"Writing style",languageLabel:"Caption language",
    toneCasual:"Casual & friendly",tonePro:"Professional",toneSales:"Persuasive",toneFunny:"Funny & playful",toneMinimal:"Minimal & elegant",toneBold:"Bold & energetic",
    detailsLabel:"Extra details",optional:"(optional)",detailsPlaceholder:"Product facts, audience, offer, or call to action...",
    privacyNote:"Don’t include passwords or sensitive personal information.",
    generate:"Generate captions",working:"Creating captions...",resultKicker:"YOUR CREATIVE OPTIONS",resultTitle:"Three ways to say it.",resultSubtitle:"Pick the one that feels right for your brand.",options:"OPTIONS",
    copy:"Copy caption",copied:"Copied!",copyFailed:"Copy failed",resultHint:"Review names, facts, prices, and claims before publishing.",regenerate:"Generate another set",
    workflow:"A SIMPLE WORKFLOW",howTitle:"From idea to caption.",stepOneTitle:"Add your context",stepOneCopy:"Tell us what you’re posting, where it’s going, and the tone you want.",stepTwoTitle:"Generate ideas",stepTwoCopy:"Get three different caption directions, shaped around your brief.",stepThreeTitle:"Make it yours",stepThreeCopy:"Copy your favorite, make any edits, and publish when ready.",notice:"Kreovio AI is in beta. AI can make mistakes—review the output before publishing.",footer:"Made for better ideas.",about:"About",privacy:"Privacy",
    errors:{topic:"Please enter a topic first.",failed:"The generator is temporarily unavailable. Please try again.",tooLong:"Please check the length of your topic or extra details.",generic:"The request failed. Please try again."}
  }
};
let currentLang = localStorage.getItem("kreovio-lang") || "id";
let lastPayload = null;
let lastCaptions = [];

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("kreovio-lang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key] !== undefined) el.textContent = translations[lang][key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.dataset.i18nHtml;
    if (translations[lang][key] !== undefined) el.innerHTML = translations[lang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key] !== undefined) el.placeholder = translations[lang][key];
  });
  $("langToggle").textContent = lang === "id" ? "EN" : "ID";
  if (!$("resultPanel").hidden) renderCaptions(lastCaptions);
}
function parseCaptions(data) {
  if (Array.isArray(data)) return data.map(x => String(x).trim()).filter(Boolean).slice(0,3);
  const raw = String(data || "").trim();
  try {
    const clean = raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parseCaptions(parsed);
    if (Array.isArray(parsed.captions)) return parseCaptions(parsed.captions);
  } catch {}
  const parts = raw.split(/(?:^|\n)\s*(?:\*\*)?(?:Option|Opsi)\s*[1-3](?:\*\*)?\s*:?\s*/i).filter(Boolean).map(s=>s.trim());
  return parts.length ? parts.slice(0,3) : [raw];
}
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
  document.body.appendChild(area); area.select();
  const ok = document.execCommand("copy"); area.remove();
  if (!ok) throw new Error("Clipboard unavailable");
}
function renderCaptions(captions) {
  const list = $("captionList");
  list.replaceChildren();
  captions.forEach((caption,index) => {
    const card = document.createElement("article"); card.className = "caption-card";
    const head = document.createElement("div"); head.className = "caption-card-head";
    const label = document.createElement("span"); label.className = "caption-label";
    label.textContent = `${currentLang === "id" ? "CAPTION" : "CAPTION"} 0${index+1}`;
    const button = document.createElement("button"); button.type = "button"; button.className = "copy-btn";
    button.innerHTML = `<span aria-hidden="true">▢</span> ${translations[currentLang].copy}`;
    button.addEventListener("click", async () => {
      try {
        await copyText(caption); button.classList.add("copied");
        button.textContent = "✓ " + translations[currentLang].copied;
        button.setAttribute("aria-label", translations[currentLang].copied);
        window.setTimeout(() => { button.classList.remove("copied"); button.innerHTML = `<span aria-hidden="true">▢</span> ${translations[currentLang].copy}`; }, 1600);
      } catch { button.textContent = translations[currentLang].copyFailed; }
    });
    head.append(label,button);
    const body = document.createElement("p"); body.className = "caption-content"; body.textContent = caption;
    card.append(head,body); list.append(card);
  });
}
async function generate(payload) {
  $("errorBox").hidden = true;
  $("resultPanel").hidden = true;
  $("generateBtn").disabled = true;
  $("generateBtn").querySelector("span:first-child").textContent = translations[currentLang].working;
  try {
    const response = await fetch("/api/generate", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || "Request failed");
    const captions = parseCaptions(data.captions || data.caption);
    if (!captions.length) throw new Error("Empty response");
    lastCaptions = captions; renderCaptions(captions);
    $("resultPanel").hidden = false;
    $("resultPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
  } catch (error) {
    console.error(error);
    $("errorBox").textContent = translations[currentLang].errors.failed;
    $("errorBox").hidden = false;
  } finally {
    $("generateBtn").disabled = false;
    $("generateBtn").querySelector("span:first-child").textContent = translations[currentLang].generate;
  }
}
$("langToggle").addEventListener("click",()=>setLanguage(currentLang === "id" ? "en" : "id"));
$("details").addEventListener("input",()=>{$("detailCount").textContent=$("details").value.length;});
$("captionForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const payload = {
    topic:$("topic").value.trim(), platform:$("platform").value,
    tone:$("tone").value, outputLanguage:$("outputLanguage").value,
    details:$("details").value.trim()
  };
  if (!payload.topic) { $("errorBox").textContent=translations[currentLang].errors.topic; $("errorBox").hidden=false; return; }
  if (payload.topic.length>180 || payload.details.length>500) { $("errorBox").textContent=translations[currentLang].errors.tooLong; $("errorBox").hidden=false; return; }
  lastPayload = payload; await generate(payload);
});
$("regenerateBtn").addEventListener("click",()=>{if(lastPayload)generate(lastPayload);});
$("year").textContent = new Date().getFullYear();
setLanguage(currentLang);
