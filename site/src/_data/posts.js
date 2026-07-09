module.exports = async function () {
  const base = process.env.STRAPI_URL || "http://localhost:1337";
  const res = await fetch(
    `${base}/api/posts?populate=*&sort=date:asc&pagination[pageSize]=100&status=published`
  );
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const json = await res.json();
  return json.data;
};
