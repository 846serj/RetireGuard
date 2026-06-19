import { createClient } from "@/lib/supabase/server";

// True when the user may access paid features (in trial or actively paying).
export async function hasPaidAccess(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .single();
  return !!data && ["trialing", "active"].includes(data.status);
}
