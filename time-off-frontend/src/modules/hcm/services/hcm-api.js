import { httpRequest } from '@/src/shared/services/http-client';

export function syncRealtimeBalance({ payload, baseUrl }) {
  return httpRequest({
    method: 'POST',
    path: '/hcm-integration/balances/realtime',
    body: payload,
    baseUrl,
  });
}

export function syncBatchBalances({ payload, baseUrl }) {
  return httpRequest({
    method: 'POST',
    path: '/hcm-integration/balances/batch',
    body: payload,
    baseUrl,
  });
}

export function submitRequestSyncResult({ requestId, payload, baseUrl }) {
  return httpRequest({
    method: 'POST',
    path: `/hcm-integration/requests/${requestId}/sync-result`,
    body: payload,
    baseUrl,
  });
}
