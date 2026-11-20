// START: (path: string, { method = 'GET', body } = {})
// END:   resolves to the `data` field; throws Error(message) when ok is false
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Server error');
  }
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

// END: { id, name, role } or null when not logged in
export async function getMe() {
  try {
    return await api('/auth/me');
  } catch {
    return null;
  }
}
