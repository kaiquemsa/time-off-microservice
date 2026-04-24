import { httpRequest } from '@/src/shared/services/http-client';

export function createTimeOffRequest({ payload, baseUrl }) {
  return httpRequest({ method: 'POST', path: '/time-off-requests', body: payload, baseUrl });
}

export function fetchTimeOffRequests({ filters, baseUrl }) {
  const query = new URLSearchParams();
  if (filters.employeeId) query.set('employeeId', filters.employeeId);
  if (filters.locationId) query.set('locationId', filters.locationId);
  if (filters.status) query.set('status', filters.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';

  return httpRequest({ method: 'GET', path: `/time-off-requests${suffix}`, baseUrl });
}

export function approveTimeOffRequest({ requestId, payload, baseUrl }) {
  return httpRequest({
    method: 'PATCH',
    path: `/time-off-requests/${requestId}/approve`,
    body: payload,
    baseUrl,
  });
}

export function rejectTimeOffRequest({ requestId, payload, baseUrl }) {
  return httpRequest({
    method: 'PATCH',
    path: `/time-off-requests/${requestId}/reject`,
    body: payload,
    baseUrl,
  });
}
