'use client';

import { useState } from 'react';
import { Zap, Layers3, BadgeCheck, RefreshCw } from 'lucide-react';
import {
  syncRealtimeBalance,
  syncBatchBalances,
  submitRequestSyncResult,
} from '@/src/modules/hcm/services/hcm-api';

function TabButton({ active, onClick, label, Icon }) {
  return (
    <button type="button" className={active ? 'hcm-tab active' : 'hcm-tab'} onClick={onClick}>
      <Icon size={18} strokeWidth={2.1} />
      <span>{label}</span>
    </button>
  );
}

export function HcmPage() {
  const [tab, setTab] = useState('realtime');
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const [realtimeEmployee, setRealtimeEmployee] = useState('emp-1024');
  const [realtimeLocation, setRealtimeLocation] = useState('loc-sp');

  const [batchPayload, setBatchPayload] = useState(
    JSON.stringify(
      {
        items: [
          { employeeId: 'emp-1024', locationId: 'loc-sp', availableBalance: 12 },
          { employeeId: 'emp-2048', locationId: 'loc-rj', availableBalance: 7 },
        ],
      },
      null,
      2,
    ),
  );

  const [syncRequestId, setSyncRequestId] = useState('');
  const [syncSuccess, setSyncSuccess] = useState('true');
  const [syncErrorMessage, setSyncErrorMessage] = useState('');

  async function handleRealtimeSync() {
    try {
      setFeedback('');
      await syncRealtimeBalance({
        payload: {
          employeeId: realtimeEmployee,
          locationId: realtimeLocation,
          availableBalance: 10,
        },
      });
      setFeedbackError(false);
      setFeedback('Realtime synchronization completed successfully.');
    } catch (error) {
      setFeedbackError(true);
      setFeedback(`Sync failed: ${error.message}`);
    }
  }

  async function handleBatchSync() {
    try {
      setFeedback('');
      const parsedPayload = JSON.parse(batchPayload);
      await syncBatchBalances({ payload: parsedPayload });
      setFeedbackError(false);
      setFeedback('Batch synchronization completed successfully.');
    } catch (error) {
      setFeedbackError(true);
      setFeedback(`Batch sync failed: ${error.message}`);
    }
  }

  async function handleSyncResult() {
    try {
      setFeedback('');
      await submitRequestSyncResult({
        requestId: syncRequestId,
        payload: {
          success: syncSuccess === 'true',
          errorMessage: syncErrorMessage || undefined,
        },
      });
      setFeedbackError(false);
      setFeedback('Sync result saved successfully.');
    } catch (error) {
      setFeedbackError(true);
      setFeedback(`Failed to save sync result: ${error.message}`);
    }
  }

  return (
    <section className="hcm-page">
      <h1>HCM Sync</h1>
      <p className="page-subtitle">Run synchronization with the external HCM system and register return statuses.</p>

      <div className="hcm-tabs-wrap">
        <TabButton
          active={tab === 'realtime'}
          onClick={() => setTab('realtime')}
          label="Realtime"
          Icon={Zap}
        />
        <TabButton
          active={tab === 'batch'}
          onClick={() => setTab('batch')}
          label="Batch"
          Icon={Layers3}
        />
        <TabButton
          active={tab === 'sync'}
          onClick={() => setTab('sync')}
          label="Sync result"
          Icon={BadgeCheck}
        />
      </div>

      <article className="panel-card">
        {tab === 'realtime' ? (
          <>
            <h2>Synchronize realtime balance</h2>
            <p>Triggers immediate integration for a single employee/location.</p>

            <div className="hcm-form-grid">
              <label>
                <span>Employee</span>
                <input value={realtimeEmployee} onChange={(event) => setRealtimeEmployee(event.target.value)} />
              </label>
              <label>
                <span>Location</span>
                <input value={realtimeLocation} onChange={(event) => setRealtimeLocation(event.target.value)} />
              </label>
            </div>

            <button type="button" className="primary-btn hcm-main-btn" onClick={handleRealtimeSync}>
              <RefreshCw size={18} strokeWidth={2.1} />
              <span>Sync now</span>
            </button>
          </>
        ) : null}

        {tab === 'batch' ? (
          <>
            <h2>Synchronize batch balances</h2>
            <p>Submit consolidated balance payload for multiple employees.</p>

            <label>
              <span>JSON payload</span>
              <textarea
                rows={12}
                value={batchPayload}
                onChange={(event) => setBatchPayload(event.target.value)}
              />
            </label>

            <button type="button" className="primary-btn hcm-main-btn" onClick={handleBatchSync}>
              <RefreshCw size={18} strokeWidth={2.1} />
              <span>Sync batch</span>
            </button>
          </>
        ) : null}

        {tab === 'sync' ? (
          <>
            <h2>Save sync result</h2>
            <p>Update synchronization result for a request.</p>

            <div className="hcm-form-grid three-columns">
              <label>
                <span>Request ID</span>
                <input value={syncRequestId} onChange={(event) => setSyncRequestId(event.target.value)} />
              </label>

              <label>
                <span>Success</span>
                <select value={syncSuccess} onChange={(event) => setSyncSuccess(event.target.value)}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>

              <label>
                <span>Error (optional)</span>
                <input
                  value={syncErrorMessage}
                  onChange={(event) => setSyncErrorMessage(event.target.value)}
                />
              </label>
            </div>

            <button type="button" className="primary-btn hcm-main-btn" onClick={handleSyncResult}>
              <RefreshCw size={18} strokeWidth={2.1} />
              <span>Save result</span>
            </button>
          </>
        ) : null}
      </article>

      {feedback ? (
        <p className={feedbackError ? 'error-banner' : 'success-banner'}>{feedback}</p>
      ) : null}
    </section>
  );
}
