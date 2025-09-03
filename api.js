const API = {
  async get(path, params = {}) {
    const url = new URL(path, window.location.origin);
    Object.entries(params).forEach(([k,v]) => v !== '' && v != null && url.searchParams.append(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
    return res.json();
  },
  async post(path, body = {}) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
    return res.json();
  },
  async put(path, body = {}) {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
    return res.json();
  }
};
