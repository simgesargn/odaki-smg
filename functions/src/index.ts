import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";

setGlobalOptions({ region: "europe-west1" });

const GROQ_API_KEY = defineSecret("GROQ_API_KEY");

export const odiChat = onCall(
  { region: "europe-west1", secrets: [GROQ_API_KEY] },
  async (request) => {
    logger.info("odiChat called", { uid: request.auth?.uid });

    try {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Login required");
      }

      const message = typeof request.data?.message === "string" ? request.data.message.trim() : "";
      if (!message) {
        throw new HttpsError("invalid-argument", "Message missing");
      }

      const apiKey = await GROQ_API_KEY.value();
      if (!apiKey) {
        throw new HttpsError("failed-precondition", "Groq key missing");
      }

      const resp = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are Odi, a supportive productivity coach for the Odaki app. Reply in Turkish, concise.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.6,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );

      const rawReply =
        resp?.data?.choices?.[0]?.message?.content ??
        resp?.data?.choices?.[0]?.text ??
        "";

      const reply = typeof rawReply === "string" ? rawReply.trim() : String(rawReply || "");
      logger.info("groq ok", { snippet: reply.slice(0, 120) });

      return { reply };
    } catch (err: any) {
      logger.error("odiChat error", err?.response?.data || err?.message || err);
      if (err instanceof HttpsError) throw err;
      throw new HttpsError("internal", "Assistant error");
    }
  }
);
