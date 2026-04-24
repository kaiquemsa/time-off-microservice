function Badge({ value }) {
  const className = `badge badge-${String(value || '').toLowerCase()}`;
  return <span className={className}>{value || 'N/A'}</span>;
}

export function RequestsTableCard({ items, onSelectRequest }) {
  return (
    <article className="card">
      <h2>Request queue</h2>
      <div className="table-wrap">
        <table>
          <caption>Time-off requests</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Location</th>
              <th>Days</th>
              <th>Request Status</th>
              <th>Sync Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>No requests found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onSelectRequest(item.id)}
                      aria-label={`Select request ${item.id}`}
                    >
                      {item.id}
                    </button>
                  </td>
                  <td>{item.employeeId}</td>
                  <td>{item.locationId}</td>
                  <td>{item.requestedDays}</td>
                  <td>
                    <Badge value={item.status} />
                  </td>
                  <td>
                    <Badge value={item.syncStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
