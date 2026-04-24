import { clearSession, getAccessToken } from '@/src/shared/auth/session';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export function getApiBaseUrl() {
  return DEFAULT_BASE_URL.replace(/\/$/, '');
}

export async function httpRequest({ method, path, body, baseUrl, skipAuth = false }) {
  const resolvedBaseUrl = (baseUrl || getApiBaseUrl()).replace(/\/$/, '');
  const headers = { 'Content-Type': 'application/json' };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${resolvedBaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    const rawMessage = data?.message || `Error ${response.status}`;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
    throw new Error(message);
  }

  return { status: response.status, data };
}
