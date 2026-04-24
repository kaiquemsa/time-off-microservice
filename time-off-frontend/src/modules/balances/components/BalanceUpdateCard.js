export function BalanceUpdateCard({ form, onChange, onSubmit }) {
  return (
    <article className="card card-elevated">
      <h2>Update balance</h2>
      <p>Set available balance and optional optimistic locking fields.</p>
      <fieldset>
        <legend>Balance data</legend>
        <div className="form-grid">
          <label htmlFor="balance-update-employee-id">
            <span>Employee ID</span>
            <input
              id="balance-update-employee-id"
              value={form.employeeId}
              onChange={(event) => onChange('employeeId', event.target.value)}
            />
          </label>
          <label htmlFor="balance-update-location-id">
            <span>Location ID</span>
            <input
              id="balance-update-location-id"
              value={form.locationId}
              onChange={(event) => onChange('locationId', event.target.value)}
            />
          </label>
          <label htmlFor="balance-update-available-balance">
            <span>Available Balance</span>
            <input
              id="balance-update-available-balance"
              type="number"
              step="0.5"
              value={form.availableBalance}
              onChange={(event) => onChange('availableBalance', event.target.value)}
            />
          </label>
          <label htmlFor="balance-update-expected-version">
            <span>Expected Version (optional)</span>
            <input
              id="balance-update-expected-version"
              type="number"
              value={form.expectedVersion}
              onChange={(event) => onChange('expectedVersion', event.target.value)}
            />
          </label>
          <label htmlFor="balance-update-last-synced-at">
            <span>Last Synced At (optional)</span>
            <input
              id="balance-update-last-synced-at"
              value={form.lastSyncedAt}
              onChange={(event) => onChange('lastSyncedAt', event.target.value)}
              placeholder="2026-04-23T21:00:00.000Z"
            />
          </label>
        </div>
      </fieldset>
      <button type="button" onClick={onSubmit}>
        Save Balance
      </button>
    </article>
  );
}
