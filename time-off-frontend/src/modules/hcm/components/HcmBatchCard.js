export function HcmBatchCard({ payload, onChange, onSubmit }) {
  return (
    <article className="card card-elevated">
      <h2>Batch balance sync</h2>
      <p>Use for scheduled full balance imports from HCM.</p>
      <label htmlFor="hcm-batch-payload">
        <span>Batch JSON payload</span>
        <textarea
          id="hcm-batch-payload"
          rows={11}
          value={payload}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <button type="button" onClick={onSubmit}>
        Run Batch Sync
      </button>
    </article>
  );
}
