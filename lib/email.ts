// Email stubs (Phase 7). Wire to your ESP (Resend / newsletter ESP) via ESP_API_KEY.
// The confirmation + trial-reminder emails are part of the auto-renew compliance flow.

export async function sendToList(email: string, segment: "free" | "trialing" | "paid" | "free-only") {
  if (!process.env.ESP_API_KEY) {
    console.log(`[ESP stub] add ${email} as ${segment}`);
    return;
  }
  // TODO: call your ESP API to upsert the contact with the segment tag.
}

export async function sendConfirmationEmail(email: string) {
  if (!process.env.ESP_API_KEY) {
    console.log(`[ESP stub] confirmation email -> ${email}`);
    return;
  }
  // TODO: send "your trial started — renews automatically, cancel anytime: <portal link>".
  // Stripe also sends a trial-ending reminder if enabled in the dashboard (keep it ON for compliance).
}
