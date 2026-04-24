'use client';

import { useState } from 'react';
import { Search, Archive } from 'lucide-react';
import { fetchBalance } from '@/src/modules/balances/services/balances-api';

export function BalancesPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [balance, setBalance] = useState(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setSearched(true);
    setLoading(true);
    setErrorMessage('');
    setBalance(null);

    try {
      const response = await fetchBalance({ employeeId, locationId });
      setBalance(response.data);
    } catch (error) {
      setErrorMessage(`Failed to fetch balance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="balances-page">
      <h1>Balances</h1>
      <p className="page-subtitle">Check and adjust leave balance by employee and location.</p>

      <article className="panel-card">
        <h2>Find balance</h2>
        <p>Enter employee and location identifiers.</p>

        <div className="balances-search-grid">
          <label>
            <span>Employee ID</span>
            <input
              placeholder="e.g. emp-1024"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            />
          </label>

          <label>
            <span>Location ID</span>
            <input
              placeholder="e.g. loc-sp"
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="primary-btn balances-search-btn"
            onClick={handleSearch}
            disabled={loading || !employeeId || !locationId}
          >
            <Search size={18} strokeWidth={2.1} />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </article>

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      {!searched || !balance ? (
        <article className="empty-state-card">
          <div className="empty-icon-wrap">
            <Archive size={24} strokeWidth={2.1} />
          </div>
          <h3>{searched ? 'No balance found' : 'No search executed'}</h3>
          <p>
            {searched
              ? 'Check employee/location and try again.'
              : 'Fill employee and location above to view balance.'}
          </p>
        </article>
      ) : (
        <article className="panel-card balance-result-card">
          <h2>Balance result</h2>
          <div className="balance-metrics-grid">
            <div>
              <span>Available</span>
              <strong>{balance.availableBalance}</strong>
            </div>
            <div>
              <span>Reserved</span>
              <strong>{balance.reservedBalance}</strong>
            </div>
            <div>
              <span>Used</span>
              <strong>{balance.usedBalance}</strong>
            </div>
            <div>
              <span>Effective</span>
              <strong>{balance.effectiveAvailable}</strong>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
