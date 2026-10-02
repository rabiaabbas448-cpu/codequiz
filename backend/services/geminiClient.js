const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models are tried in this order. If one is busy or failing, the next one is used.
const MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.6-flash",
  ...(process.env.GEMINI_FALLBACK_MODELS || "gemini-2.5-flash,gemini-2.5-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean),
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 503 / 429 mean "busy or rate limited" - worth retrying
const isBusyError = (err) => {
  const msg = String((err && err.message) || "");
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
};

// Sends a prompt to Gemini with retries and model fallback. Returns the text answer.
const generateText = async (prompt, config) => {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          ...(config ? { config } : {}),
        });
        return response.text;
      } catch (err) {
        lastError = err;
        console.error(`Gemini ${model} (attempt ${attempt + 1}) failed:`, err.message);

        // Not a busy error (e.g. wrong model name): skip straight to the next model
        if (!isBusyError(err)) break;

        await sleep(2000 * (attempt + 1));
      }
    }
  }

  throw lastError;
};

module.exports = { generateText };