import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPaidAccess } from "@/lib/subscription";
import { buildActionPlan, type PlanItem } from "@/lib/actionPlan";
import { getMatchedAlerts } from "@/lib/alerts";
import type { Answers } from "@/lib/scoring";
import ScoreHydrator from "@/components/ScoreHydrator";

const PRIORITY_STYLE: Record<string, string> = {
  High: "bg-red-100 text-bad", Medium: "bg-amber-100 text-warn", Low: "bg-slate-100 text-slate-600",
};

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: latest } = await supabase
    .from("scores").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  const paid = await hasPaidAccess(user.id);
  const answers = latest?.answers as Answers | undefined;

  const plan: PlanItem[] = answers ? buildActionPlan(answers, { overall: latest.overall, band: latest.band, sub: latest.sub_scores }) : [];
  const alerts = paid && answers
    ? await getMatchedAlerts(supabase, { state: answers.state, age: answers.age, worry: answers.worry })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ScoreHydrator hasScore={!!latest} />
      <h1 className="text-3xl font-bold mb-1">Your retirement dashboard</h1>
      <p className="text-slate-600 mb-8">{user.email}</p>

      <section className="rounded-2xl border-2 border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Retirement Safety Score</h2>
        {latest ? (
          <div className="text-5xl font-extrabold">
            {latest.overall} <span className="text-lg font-semibold text-slate-500">{latest.band}</span>
          </div>
        ) : (
          <Link href="/quiz" className="text-brand underline">Take the Score quiz →</Link>
        )}
      </section>

      {!paid ? (
        <section className="rounded-2xl border-2 border-brand bg-blue-50 p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Unlock your action plan + alerts</h2>
          <p className="text-slate-600 mb-4">
            Get your personalized, prioritized plan and ongoing alerts matched to your state, age, and worries.
          </p>
          <Link href="/upgrade" className="inline-block rounded-xl bg-brand px-6 py-3 font-bold text-white">
            Start 3-day free trial
          </Link>
        </section>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your action plan</h2>
            <div className="space-y-4">
              {plan.map((p, i) => (
                <div key={i} className="rounded-2xl border-2 border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${PRIORITY_STYLE[p.priority]}`}>{p.priority}</span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">{p.area}</span>
                  </div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="text-slate-600 mt-1">{p.why}</p>
                  <ul className="mt-3 space-y-1 list-disc list-inside text-slate-700">
                    {p.steps.map((s, j) => <li key={j}>{s}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Alerts for you</h2>
            <div className="space-y-3">
              {alerts.length === 0 && <p className="text-slate-500">No alerts match your profile yet — check back soon.</p>}
              {alerts.map((al) => (
                <div key={al.id} className="rounded-xl border-2 border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-brand font-semibold">{al.category}</div>
                  <h3 className="font-bold">{al.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{al.body}</p>
                </div>
              ))}
            </div>
          </section>

          <Link href="/api/portal" className="text-brand underline">Manage subscription</Link>
        </>
      )}
    </div>
  );
}
