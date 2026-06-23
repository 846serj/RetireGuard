const DEFAULT_MODEL = "claude-sonnet-4-6";

export const anthropicModel = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
export const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);

type AnthropicClient = {
  messages: {
    create: (params: Record<string, unknown>, options?: Record<string, unknown>) => Promise<any>;
    stream?: (params: Record<string, unknown>, options?: Record<string, unknown>) => any;
  };
};

let clientPromise: Promise<AnthropicClient | null> | null = null;

export async function getAnthropicClient(): Promise<AnthropicClient | null> {
  if (!hasAnthropicKey) return null;
  clientPromise ??= (async () => {
    try {
      const load = new Function("return import('@anthropic-ai/sdk')") as () => Promise<any>;
      const mod = await load();
      const Anthropic = mod.default ?? mod.Anthropic;
      return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) as AnthropicClient;
    } catch (error) {
      console.error("Anthropic client unavailable", error);
      return null;
    }
  })();
  return clientPromise;
}

export function timeoutSignal(ms = 12_000): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms).unref?.();
  return controller.signal;
}
