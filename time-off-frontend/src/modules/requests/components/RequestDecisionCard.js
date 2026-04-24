export function RequestDecisionCard({
  approveForm,
  rejectForm,
  onApproveChange,
  onRejectChange,
  onApprove,
  onReject,
}) {
  return (
    <div className="grid two-columns">
      <article className="card">
        <h2>Approve request</h2>
        <fieldset>
          <legend>Approval</legend>
          <div className="form-grid">
            <label htmlFor="request-approve-id">
              <span>Request ID</span>
              <input
                id="request-approve-id"
                value={approveForm.requestId}
                onChange={(event) => onApproveChange('requestId', event.target.value)}
              />
            </label>
            <label htmlFor="request-approve-hcm-ref">
              <span>HCM Reference (optional)</span>
              <input
                id="request-approve-hcm-ref"
                value={approveForm.hcmReference}
                onChange={(event) => onApproveChange('hcmReference', event.target.value)}
              />
            </label>
          </div>
        </fieldset>
        <button type="button" onClick={onApprove}>
          Approve
        </button>
      </article>

      <article className="card">
        <h2>Reject request</h2>
        <fieldset>
          <legend>Rejection</legend>
          <div className="form-grid">
            <label htmlFor="request-reject-id">
              <span>Request ID</span>
              <input
                id="request-reject-id"
                value={rejectForm.requestId}
                onChange={(event) => onRejectChange('requestId', event.target.value)}
              />
            </label>
            <label htmlFor="request-reject-reason">
              <span>Reason</span>
              <input
                id="request-reject-reason"
                value={rejectForm.reason}
                onChange={(event) => onRejectChange('reason', event.target.value)}
              />
            </label>
          </div>
        </fieldset>
        <button type="button" onClick={onReject}>
          Reject
        </button>
      </article>
    </div>
  );
}
