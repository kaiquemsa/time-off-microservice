export function RequestFiltersCard({ form, onChange, onSubmit }) {
  return (
    <article className="card card-elevated">
      <h2>Search and filters</h2>
      <p>Filter requests by employee, location, and status.</p>
      <fieldset>
        <legend>Filter options</legend>
        <div className="form-grid">
          <label htmlFor="request-filter-employee-id">
            <span>Employee ID</span>
            <input
              id="request-filter-employee-id"
              value={form.employeeId}
              onChange={(event) => onChange('employeeId', event.target.value)}
            />
          </label>
          <label htmlFor="request-filter-location-id">
            <span>Location ID</span>
            <input
              id="request-filter-location-id"
              value={form.locationId}
              onChange={(event) => onChange('locationId', event.target.value)}
            />
          </label>
          <label htmlFor="request-filter-status">
            <span>Status</span>
            <select
              id="request-filter-status"
              value={form.status}
              onChange={(event) => onChange('status', event.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>
        </div>
      </fieldset>
      <button type="button" onClick={onSubmit}>
        Refresh List
      </button>
    </article>
  );
}
