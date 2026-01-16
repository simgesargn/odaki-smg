type OdiMsg = { role: "system" | "user" | "assistant"; content: string };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getGroqKey(): string {
  // Expo public env
  // .env -> EXPO_PUBLIC_GROQ_API_KEY=...
  const k = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!k) throw new Error("EXPO_PUBLIC_GROQ_API_KEY missing");
  return k;
}

export async function askOdi(params: {
  userMessage: string;
  history?: { role: "user" | "assistant"; text: string }[];
}): Promise<string> {
  const system: OdiMsg = {
    role: "system",
    content:
      "Sen Odi'sin: kısa, net, motive edici bir odak ve planlama koçusun. Türkçe cevap ver. Gereksiz uzatma. Maddelerle plan çıkarabilirsin.",
  };

  const msgs: OdiMsg[] = [system];

  (params.history ?? []).slice(-12).forEach((m) => {
    msgs.push({ role: m.role, content: m.text });
  });

  msgs.push({ role: "user", content: params.userMessage });

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getGroqKey()}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: msgs,
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Groq error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq: empty response");
  return text.trim();
}
