export function BalanceLookupCard({ form, onChange, onSubmit }) {
  return (
    <article className="card card-elevated">
      <h2>Lookup balance</h2>
      <p>Retrieve a balance for a specific employee and location.</p>
      <fieldset>
        <legend>Lookup filters</legend>
        <div className="form-grid">
          <label htmlFor="balance-lookup-employee-id">
            <span>Employee ID</span>
            <input
              id="balance-lookup-employee-id"
              value={form.employeeId}
              onChange={(event) => onChange('employeeId', event.target.value)}
            />
          </label>
          <label htmlFor="balance-lookup-location-id">
            <span>Location ID</span>
            <input
              id="balance-lookup-location-id"
              value={form.locationId}
              onChange={(event) => onChange('locationId', event.target.value)}
            />
          </label>
        </div>
      </fieldset>
      <button type="button" onClick={onSubmit}>
        Find Balance
      </button>
    </article>
  );
}
