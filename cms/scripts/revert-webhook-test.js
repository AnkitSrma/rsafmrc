const BASE = "http://localhost:1337";

async function main() {
  const loginRes = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "dev@rsafmrc.local", password: "DevPass123!" }),
  });
  const { data } = await loginRes.json();
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` };

  const listRes = await fetch(
    `${BASE}/content-manager/collection-types/api::post.post?pageSize=100`,
    { headers }
  );
  const list = await listRes.json();
  const post = list.results.find((p) => p.slug === "working-group-wildland-fire-2001");
  if (!post) throw new Error("post not found");

  const originalTitle = "Working Group on Wildland Fire established";
  const updateRes = await fetch(
    `${BASE}/content-manager/collection-types/api::post.post/${post.documentId}`,
    { method: "PUT", headers, body: JSON.stringify({ title: originalTitle }) }
  );
  console.log("update status:", updateRes.status);
  const pubRes = await fetch(
    `${BASE}/content-manager/collection-types/api::post.post/${post.documentId}/actions/publish`,
    { method: "POST", headers }
  );
  console.log("publish status:", pubRes.status);
  console.log("Reverted title to:", originalTitle);
}

main().catch((e) => console.log("ERROR:", e.message));
