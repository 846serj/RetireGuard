import type { PlanItem } from "@/lib/actionPlan";
import type { Answers, Result } from "@/lib/scoring";
import { getAnthropicClient, anthropicModel, timeoutSignal } from "./client";
import { SAFETY_SYSTEM } from "./guardrails";

function isPlanItem(value: unknown): value is PlanItem {
  const item = value as PlanItem;
  return !!item && typeof item.area === "string" && ["High", "Medium", "Low"].includes(item.priority) &&
    typeof item.title === "string" && typeof item.why === "string" &&
    Array.isArray(item.steps) && item.steps.length > 0 && item.steps.every((s) => typeof s === "string");
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch {}
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match) return JSON.parse(match[1]);
  return JSON.parse(trimmed.slice(trimmed.indexOf("["), trimmed.lastIndexOf("]") + 1));
}

function responseText(message: any): string {
  return (message?.content ?? [])
    .filter((part: any) => part?.type === "text" && typeof part.text === "string")
    .map((part: any) => part.text)
    .join("\n");
}

export async function generateAIActionPlan(
  answers: Answers,
  result: Result,
  ruleBasedPlan: PlanItem[]
): Promise<PlanItem[]> {
  try {
    const client = await getAnthropicClient();
    if (!client) return ruleBasedPlan;

    const message = await client.messages.create({
      model: anthropicModel,
      max_tokens: 2200,
      temperature: 0.2,
      system: SAFETY_SYSTEM,
      messages: [{
        role: "user",
        content: `Expand this existing rule-based retirement education action plan into warmer, personalized guidance.\n\nReturn ONLY strict JSON: an array of PlanItem objects with this exact shape: {"area": string, "priority": "High"|"Medium"|"Low", "title": string, "why": string, "steps": string[]}.\n\nDo not add fields. Do not recommend products, securities, allocations, or actions that are advice. Keep 3-6 items. Ground every item in the supplied plan, answers, and scores.\n\nAnswers: ${JSON.stringify(answers)}\nScores: ${JSON.stringify(result)}\nExisting rule-based plan: ${JSON.stringify(ruleBasedPlan)}`,
      }],
    }, { signal: timeoutSignal() });

    const parsed = extractJson(responseText(message));
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isPlanItem)) return ruleBasedPlan;
    return parsed.slice(0, 6);
  } catch (error) {
    console.error("AI action plan failed", error);
    return ruleBasedPlan;
  }
}
