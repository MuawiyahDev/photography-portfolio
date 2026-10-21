// Tiny fetch wrapper used by every admin form and table.
// Keeps JSON parsing and error shape handling in ONE place.
export async function apiSend(path, { method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // empty body — leave data null
  }

  return { ok: response.ok, status: response.status, data };
}
