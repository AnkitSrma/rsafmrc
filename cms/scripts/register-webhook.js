// One-time setup: registers a Strapi webhook that hits the local Eleventy
// rebuild listener (site/webhook-server.js) whenever content is published,
// updated, or unpublished. On a real host, swap the URL for that host's
// deploy-hook and this script (or the Strapi admin UI) works the same way.

const BASE = process.env.STRAPI_URL || "http://localhost:1337";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "dev@rsafmrc.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "DevPass123!";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:3001/rebuild";

async function main() {
  const loginRes = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(`Admin login failed: ${loginRes.status}`);
  const { data } = await loginRes.json();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` };

  const listRes = await fetch(`${BASE}/admin/webhooks`, { headers });
  const { data: existing } = await listRes.json();
  const already = (existing || []).find((w) => w.url === WEBHOOK_URL);
  if (already) {
    console.log("Webhook already registered:", already.id, already.url);
    return;
  }

  const createRes = await fetch(`${BASE}/admin/webhooks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Eleventy rebuild",
      url: WEBHOOK_URL,
      headers: {},
      events: ["entry.publish", "entry.update", "entry.unpublish"],
    }),
  });
  if (!createRes.ok) throw new Error(`Webhook create failed: ${createRes.status} ${await createRes.text()}`);
  const created = await createRes.json();
  console.log("Webhook registered:", created.data.id, created.data.url);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
