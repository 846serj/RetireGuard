import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-ink leading-tight">
        Is your retirement going to be okay?
      </h1>
      <p className="mt-6 text-xl text-slate-600">
        Get your free <strong>Retirement Safety Score</strong> in about 2 minutes. No account, no linking
        anything — just answer 9 simple questions and see where you stand.
      </p>
      <Link
        href="/quiz"
        className="inline-block mt-10 rounded-xl bg-brand px-8 py-4 text-xl font-bold text-white hover:opacity-90"
      >
        Get my free Safety Score
      </Link>
      <p className="mt-6 text-sm text-slate-500">
        Built for Americans 55–80. We watch your retirement so you don't have to.
      </p>
    </div>
  );
}
