import type { SupabaseClient } from "@supabase/supabase-js";

export type ScoreHistoryPoint = {
  month: string;
  label: string;
  score: number;
  checkedAt: string;
};

type ScoreRow = {
  overall: number | null;
  created_at: string | null;
};

function monthKey(value: string) {
  return value.slice(0, 7);
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * Reads a user's saved score rows and returns one chronological point per month.
 * If multiple scores exist in a month, the latest score in that month is used.
 */
export async function getScoreHistory(supabase: SupabaseClient, userId: string): Promise<ScoreHistoryPoint[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("overall, created_at")
    .eq("user_id", userId)
    .not("overall", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("score history load failed:", error);
    return [];
  }

  const pointsByMonth = new Map<string, ScoreHistoryPoint>();

  for (const row of (data ?? []) as ScoreRow[]) {
    if (typeof row.overall !== "number" || !row.created_at) continue;
    const month = monthKey(row.created_at);
    pointsByMonth.set(month, {
      month,
      label: formatMonth(month),
      score: Math.max(0, Math.min(100, Math.round(row.overall))),
      checkedAt: row.created_at,
    });
  }

  return Array.from(pointsByMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
}
