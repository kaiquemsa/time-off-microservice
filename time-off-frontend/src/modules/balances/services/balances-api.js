import { httpRequest } from '@/src/shared/services/http-client';

export function fetchBalance({ employeeId, locationId, baseUrl }) {
  return httpRequest({
    method: 'GET',
    path: `/balances/${employeeId}/${locationId}`,
    baseUrl,
  });
}

export function upsertBalance({ employeeId, locationId, payload, baseUrl }) {
  return httpRequest({
    method: 'PUT',
    path: `/balances/${employeeId}/${locationId}`,
    body: payload,
    baseUrl,
  });
}
