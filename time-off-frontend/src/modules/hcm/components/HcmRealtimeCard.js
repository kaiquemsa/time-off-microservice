export function HcmRealtimeCard({ form, onChange, onSubmit }) {
  return (
    <article className="card card-elevated">
      <h2>Realtime balance sync</h2>
      <p>Use when HCM sends an immediate balance update event.</p>
      <fieldset>
        <legend>Realtime payload</legend>
        <div className="form-grid">
          <label htmlFor="hcm-realtime-employee-id">
            <span>Employee ID</span>
            <input
              id="hcm-realtime-employee-id"
              value={form.employeeId}
              onChange={(event) => onChange('employeeId', event.target.value)}
            />
          </label>
          <label htmlFor="hcm-realtime-location-id">
            <span>Location ID</span>
            <input
              id="hcm-realtime-location-id"
              value={form.locationId}
              onChange={(event) => onChange('locationId', event.target.value)}
            />
          </label>
          <label htmlFor="hcm-realtime-balance">
            <span>Available Balance</span>
            <input
              id="hcm-realtime-balance"
              type="number"
              step="0.5"
              value={form.availableBalance}
              onChange={(event) => onChange('availableBalance', event.target.value)}
            />
          </label>
          <label htmlFor="hcm-realtime-synced-at">
            <span>Synced At (optional)</span>
            <input
              id="hcm-realtime-synced-at"
              value={form.syncedAt}
              onChange={(event) => onChange('syncedAt', event.target.value)}
              placeholder="2026-04-23T21:00:00.000Z"
            />
          </label>
        </div>
      </fieldset>
      <button type="button" onClick={onSubmit}>
        Run Realtime Sync
      </button>
    </article>
  );
}
