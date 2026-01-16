export type OdiRole = "system" | "user" | "assistant";
type OdiMsg = { role: OdiRole; content: string };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getKey(): string {
  const k = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!k || typeof k !== "string") throw new Error("EXPO_PUBLIC_GROQ_API_KEY missing");
  return k.trim();
}

export const SYSTEM_PROMPT = `You are Odi Koçu, Turkish focus & productivity coach inside a mobile app.
Rules:
- Kısa, mobil uyumlu. 3–6 madde. 1–2 emoji max.
- Somut eylem öner. Uzun deneme yazma.
- Belirsizlik varsa 1 kısa soru sor veya güvenli varsayılan plan ver.
- Sağlık/hukuk yok. Güvenli ve nazik.
Quick intents:
day_plan: 2 odak bloğu + 1 admin bloğu + kapanış
motivation: doğrula + 5 dk başlatıcı + 1 mikro hedef
task_suggestion: 3 seçenek (kolay/orta/zor) + seçim sorusu.`;

export async function askOdi(params: {
  userText: string;
  intent?: "day_plan" | "motivation" | "task_suggestion" | "chat";
  history?: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  try {
    const key = getKey();
    const userText = (params.userText ?? "").trim();
    if (!userText) return "Lütfen kısa bir mesaj yazın.";

    const messages: OdiMsg[] = [{ role: "system", content: SYSTEM_PROMPT.trim() }];

    (params.history ?? []).slice(-12).forEach((h) => {
      messages.push({ role: h.role === "assistant" ? "assistant" : "user", content: h.content });
    });

    messages.push({ role: "user", content: userText });

    const body = {
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 250,
    };

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.log("askOdi groq error", res.status, txt);
      return "Şu an cevap üretirken sorun yaşadım. 10 sn sonra tekrar dener misin? 🙏";
    }

    const data = await res.json().catch(() => null);
    const text: string | undefined =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? undefined;
    if (!text) return "Şu an cevap üretirken sorun yaşadım. 10 sn sonra tekrar dener misin? 🙏";
    return String(text).trim();
  } catch (e) {
    console.log("askOdi error", e);
    return "Şu an cevap üretirken sorun yaşadım. 10 sn sonra tekrar dener misin? 🙏";
  }
}
