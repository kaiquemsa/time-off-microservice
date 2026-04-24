'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Funnel, Plus } from 'lucide-react';
import {
  approveTimeOffRequest,
  fetchTimeOffRequests,
  rejectTimeOffRequest,
} from '@/src/modules/requests/services/requests-api';

export function RequestsPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');

  const filters = useMemo(
    () => ({ employeeId, locationId, status }),
    [employeeId, locationId, status],
  );

  const loadRequests = useCallback(async () => {
    try {
      setErrorMessage('');
      const response = await fetchTimeOffRequests({ filters });
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setItems([]);
      setErrorMessage(`Failed to load requests: ${error.message}`);
    }
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cancelled) return;
      await loadRequests();
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loadRequests]);

  async function handleApprove(requestId) {
    setActionLoadingId(requestId);
    setActionMessage('');
    setErrorMessage('');
    try {
      await approveTimeOffRequest({ requestId, payload: {} });
      setActionMessage(`Request ${requestId} approved successfully.`);
      await loadRequests();
    } catch (error) {
      setErrorMessage(`Failed to approve request: ${error.message}`);
    } finally {
      setActionLoadingId('');
    }
  }

  async function handleReject(requestId) {
    const reason = window.prompt('Enter rejection reason (at least 3 characters):', 'Insufficient details');
    if (reason === null) return;

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      setErrorMessage('Rejection reason must have at least 3 characters.');
      return;
    }

    setActionLoadingId(requestId);
    setActionMessage('');
    setErrorMessage('');
    try {
      await rejectTimeOffRequest({ requestId, payload: { reason: trimmedReason } });
      setActionMessage(`Request ${requestId} rejected successfully.`);
      await loadRequests();
    } catch (error) {
      setErrorMessage(`Failed to reject request: ${error.message}`);
    } finally {
      setActionLoadingId('');
    }
  }

  return (
    <section className="requests-page">
      <div className="page-header-inline">
        <div>
          <h1>Requests</h1>
          <p className="page-subtitle">Create, track and decide leave requests.</p>
        </div>
        <button type="button" className="primary-btn request-new-btn">
          <Plus size={18} strokeWidth={2.1} />
          <span>New request</span>
        </button>
      </div>

      <article className="panel-card">
        <div className="filters-head">
          <Funnel size={18} strokeWidth={2.1} />
          <h2>Filters</h2>
        </div>
        <p>Refine by employee, location and status.</p>

        <div className="requests-filters-grid">
          <label>
            <span>Employee</span>
            <input
              placeholder="Employee ID"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            />
          </label>

          <label>
            <span>Location</span>
            <input
              placeholder="Location ID"
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
            />
          </label>

          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>
        </div>
      </article>

      {errorMessage ? (
        <article className="panel-card request-feedback-card request-feedback-error">{errorMessage}</article>
      ) : (
        <article className="panel-card request-feedback-card">
          {items.length === 0 ? (
            <p className="requests-empty-text">No requests found for current filters.</p>
          ) : (
            <div className="requests-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Location</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Sync</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.employeeId}</td>
                      <td>{item.locationId}</td>
                      <td>{item.requestedDays}</td>
                      <td>{item.status}</td>
                      <td>{item.syncStatus}</td>
                      <td>
                        <div className="request-actions">
                          <button
                            type="button"
                            className="table-action-btn approve"
                            onClick={() => handleApprove(item.id)}
                            disabled={item.status !== 'PENDING' || actionLoadingId === item.id}
                          >
                            {actionLoadingId === item.id ? 'Working...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="table-action-btn reject"
                            onClick={() => handleReject(item.id)}
                            disabled={item.status !== 'PENDING' || actionLoadingId === item.id}
                          >
                            {actionLoadingId === item.id ? 'Working...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      )}

      {actionMessage ? <p className="success-banner">{actionMessage}</p> : null}
    </section>
  );
}
