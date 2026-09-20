export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url} (status ${response.status})`);
  return response.json();
}
