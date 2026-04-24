'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/src/shared/components/AppShell';
import { fetchMe } from '@/src/modules/auth/services/auth-api';
import { clearSession, getAccessToken, setSession } from '@/src/shared/auth/session';

export default function PlatformLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function guard() {
      const token = getAccessToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const me = await fetchMe();
        if (!active) return;
        setSession(token, me.data);
        setReady(true);
      } catch {
        clearSession();
        router.replace('/login');
      }
    }

    guard();

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return <div className="auth-loading">Checking session...</div>;
  }

  return <AppShell>{children}</AppShell>;
}
