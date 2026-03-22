import { modelSuggestionSchema } from "./schema.mjs";

function hasModelConfig() {
  return Boolean(process.env.AI_API_BASE_URL && process.env.AI_API_KEY && process.env.AI_MODEL);
}

export async function requestModelSuggestion(intake) {
  if (!hasModelConfig()) {
    return null;
  }

  const prompt = [
    "You are an operational notary clerk.",
    "Turn the note into a JSON object with keys: kind, summary, derivedTags, disclosure, reason.",
    "Use one of these kinds: milestone, delivery, observation, incident, commitment, request.",
    "Keep summary short and public-safe.",
    "Default to hash_full_source_keep_public_summary when unsure.",
    "",
    JSON.stringify(intake, null, 2)
  ].join("\n");

  const response = await fetch(`${process.env.AI_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return only strict JSON. No markdown. Keep summaries concise, factual, and safe for public display."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Model request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Model response did not include a message content payload.");
  }

  const parsed = JSON.parse(content);
  return modelSuggestionSchema.parse(parsed);
}

