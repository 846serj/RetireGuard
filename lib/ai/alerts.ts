import { getAnthropicClient, anthropicModel, timeoutSignal } from "./client";
import { SAFETY_SYSTEM } from "./guardrails";

export type CuratedAlert = {
  title: string;
  body: string;
  category: "scam" | "benefit" | "inflation" | "costofliving";
  states: string[];
  min_age: number | null;
};

function isAlert(v: unknown): v is CuratedAlert {
  const a = v as CuratedAlert;
  return !!a && typeof a.title === "string" && typeof a.body === "string" &&
    ["scam", "benefit", "inflation", "costofliving"].includes(a.category) &&
    Array.isArray(a.states) && a.states.every((s) => typeof s === "string") &&
    (a.min_age === null || typeof a.min_age === "number");
}

function textOf(message: any): string {
  return (message?.content ?? []).filter((p: any) => p?.type === "text").map((p: any) => p.text).join("\n");
}

export async function curateAlertsFromSource(source: string): Promise<CuratedAlert[]> {
  try {
    const client = await getAnthropicClient();
    if (!client || source.trim().length < 20) return [];
    const message = await client.messages.create({
      model: anthropicModel,
      max_tokens: 1800,
      temperature: 0,
      system: `${SAFETY_SYSTEM}\n\nYou curate RetireShield alert drafts for human review. Never fabricate. Use only facts explicitly present in the source. If unsure, leave states empty and min_age null.`,
      messages: [{ role: "user", content: `Convert the raw SOURCE into one or more content_items drafts. Return ONLY strict JSON array with fields: title, body, category (scam|benefit|inflation|costofliving), states (US state abbreviations array; [] for national/unknown), min_age (number or null). Rewrite and summarize only facts present in SOURCE. Never invent scams, dates, figures, agencies, or eligibility.\n\nSOURCE:\n${source.slice(0, 12000)}` }],
    }, { signal: timeoutSignal() });
    const parsed = JSON.parse(textOf(message).trim());
    return Array.isArray(parsed) ? parsed.filter(isAlert).slice(0, 8) : [];
  } catch (error) {
    console.error("Alert curation failed", error);
    return [];
  }
}
