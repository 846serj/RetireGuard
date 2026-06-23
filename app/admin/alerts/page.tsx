import { headers } from "next/headers";
import AdminAlertsTool from "@/components/AdminAlertsTool";

function assertAdmin() {
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASSWORD;
  const header = headers().get("authorization") ?? "";
  if (!user || !pass) return false;
  const [u, p] = Buffer.from(header.replace(/^Basic\s+/i, ""), "base64").toString().split(":");
  return u === user && p === pass;
}

export default function AdminAlertsPage() {
  if (!assertAdmin()) {
    return <div className="mx-auto max-w-2xl p-8"><h1 className="text-2xl font-bold">Unauthorized</h1><p>Open this page with the configured admin basic-auth credentials.</p></div>;
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">AI-curated alerts</h1>
      <p className="text-slate-600 mb-6">Paste a real source. Claude drafts structured alerts. Review the JSON and approve only when it matches the source.</p>
      <AdminAlertsTool />
    </div>
  );
}
