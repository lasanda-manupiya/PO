const API_BASE_URL = 'http://localhost:4000';

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = data.message || JSON.stringify(data);
    } catch (_error) {
      // ignore
    }
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export function registerUser(payload) {
  return request('/auth/register', { method: 'POST', body: payload });
}

export function loginUser(payload) {
  return request('/auth/login', { method: 'POST', body: payload });
}

export function fetchMyProfile(token) {
  return request('/auth/me', { token });
}

export function fetchProjects(token) {
  return request('/projects', { token });
}

export function createProject(token, payload) {
  return request('/projects', { method: 'POST', token, body: payload });
}

export function fetchPurchaseOrders(token) {
  return request('/purchase-orders', { token });
}

export function createPurchaseOrder(token, payload) {
  return request('/purchase-orders', { method: 'POST', token, body: payload });
}
