export function RequestCreateCard({ form, onChange, onSubmit }) {
  return (
    <article className="card card-elevated">
      <h2>Create leave request</h2>
      <p>Create a new time-off request for an employee.</p>
      <fieldset>
        <legend>Request details</legend>
        <div className="form-grid">
          <label htmlFor="request-create-employee-id">
            <span>Employee ID</span>
            <input
              id="request-create-employee-id"
              value={form.employeeId}
              onChange={(event) => onChange('employeeId', event.target.value)}
            />
          </label>
          <label htmlFor="request-create-location-id">
            <span>Location ID</span>
            <input
              id="request-create-location-id"
              value={form.locationId}
              onChange={(event) => onChange('locationId', event.target.value)}
            />
          </label>
          <label htmlFor="request-create-start-date">
            <span>Start Date</span>
            <input
              id="request-create-start-date"
              value={form.startDate}
              onChange={(event) => onChange('startDate', event.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </label>
          <label htmlFor="request-create-end-date">
            <span>End Date</span>
            <input
              id="request-create-end-date"
              value={form.endDate}
              onChange={(event) => onChange('endDate', event.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </label>
          <label htmlFor="request-create-days">
            <span>Requested Days</span>
            <input
              id="request-create-days"
              type="number"
              step="0.5"
              value={form.requestedDays}
              onChange={(event) => onChange('requestedDays', event.target.value)}
            />
          </label>
        </div>
      </fieldset>
      <button type="button" onClick={onSubmit}>
        Create Request
      </button>
    </article>
  );
}
