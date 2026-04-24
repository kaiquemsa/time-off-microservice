'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { login } from '@/src/modules/auth/services/auth-api';
import { getAccessToken, setSession } from '@/src/shared/auth/session';

export function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getAccessToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ username, password });
      setSession(response.data.access_token, response.data.user);
      router.replace('/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-avatar">T</div>
          <div>
            <h1>Time-Off</h1>
            <p>Operations access</p>
          </div>
        </div>

        <h2>Sign in</h2>
        <p className="login-subtitle">Use your system credentials to continue.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="error-banner">{error}</p> : null}

          <button className="primary-btn login-btn" type="submit" disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
