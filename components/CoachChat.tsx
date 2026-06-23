"use client";

import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };
const STARTERS = [
  "What questions should I ask a fiduciary about Social Security timing?",
  "How can I spot retirement scams?",
  "What factors affect healthcare costs in retirement?",
];

export default function CoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(STARTERS[0]);
  const [loading, setLoading] = useState(false);

  async function send(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      if (!res.ok || !res.body) throw new Error("Coach unavailable");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: assistant }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "The AI coach is unavailable right now. Please try again later. For personal decisions, talk with a licensed fiduciary." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border-2 border-slate-200 p-5">
      <h2 className="text-2xl font-bold mb-2">AI retirement education coach</h2>
      <p className="rounded-xl bg-blue-50 p-3 text-sm text-slate-700 mb-4">
        Education only — not financial, tax, or legal advice. Never shares or asks for account numbers.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {STARTERS.map((q) => (
          <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-slate-300 px-3 py-2 text-sm text-left hover:bg-slate-50">
            {q}
          </button>
        ))}
      </div>
      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block rounded-xl px-4 py-2 text-sm ${m.role === "user" ? "bg-brand text-white" : "bg-slate-100 text-slate-800"}`}>
              {m.content || "…"}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="Ask an education-only retirement question" />
        <button disabled={loading} className="rounded-xl bg-brand px-4 py-2 font-bold text-white disabled:opacity-50">Send</button>
      </form>
    </section>
  );
}
