import { httpRequest } from '@/src/shared/services/http-client';

export function login(payload) {
  return httpRequest({
    method: 'POST',
    path: '/auth/login',
    body: payload,
    skipAuth: true,
  });
}

export function fetchMe() {
  return httpRequest({
    method: 'POST',
    path: '/auth/me',
  });
}
