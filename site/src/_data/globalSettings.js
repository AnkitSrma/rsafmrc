module.exports = async function () {
  const base = process.env.STRAPI_URL || "http://localhost:1337";
  const res = await fetch(`${base}/api/global-setting?populate=*`);
  if (!res.ok) throw new Error(`Failed to fetch global settings: ${res.status}`);
  const json = await res.json();
  return json.data;
};
