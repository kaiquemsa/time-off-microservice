export function HcmRequestResultCard({ form, onChange, onSubmit }) {
  return (
    <article className="card">
      <h2>Request sync result</h2>
      <p>Record the final synchronization result sent by HCM.</p>
      <fieldset>
        <legend>Result payload</legend>
        <div className="form-grid">
          <label htmlFor="hcm-request-sync-id">
            <span>Request ID</span>
            <input
              id="hcm-request-sync-id"
              value={form.requestId}
              onChange={(event) => onChange('requestId', event.target.value)}
            />
          </label>
          <label htmlFor="hcm-request-sync-success">
            <span>Success</span>
            <select
              id="hcm-request-sync-success"
              value={form.success}
              onChange={(event) => onChange('success', event.target.value)}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </label>
          <label htmlFor="hcm-request-sync-reference">
            <span>HCM Reference (optional)</span>
            <input
              id="hcm-request-sync-reference"
              value={form.hcmReference}
              onChange={(event) => onChange('hcmReference', event.target.value)}
            />
          </label>
          <label htmlFor="hcm-request-sync-error">
            <span>Error Message (optional)</span>
            <input
              id="hcm-request-sync-error"
              value={form.errorMessage}
              onChange={(event) => onChange('errorMessage', event.target.value)}
            />
          </label>
        </div>
      </fieldset>
      <button type="button" onClick={onSubmit}>
        Save Sync Result
      </button>
    </article>
  );
}
