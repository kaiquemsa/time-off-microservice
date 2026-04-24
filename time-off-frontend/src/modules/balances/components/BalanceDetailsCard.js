function Metric({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function BalanceDetailsCard({ balance }) {
  return (
    <article className="card">
      <h2>Balance summary</h2>
      {balance ? (
        <dl className="metrics-grid">
          <Metric label="Available" value={balance.availableBalance} />
          <Metric label="Reserved" value={balance.reservedBalance} />
          <Metric label="Used" value={balance.usedBalance} />
          <Metric label="Effective Available" value={balance.effectiveAvailable} />
          <Metric label="Version" value={balance.version} />
          <Metric
            label="Last Synced"
            value={balance.lastSyncedAt ? new Date(balance.lastSyncedAt).toLocaleString() : 'Never'}
          />
        </dl>
      ) : (
        <div className="empty-state">
          <p>No balance loaded yet.</p>
          <p>Run a lookup to display employee balance details.</p>
        </div>
      )}
    </article>
  );
}
