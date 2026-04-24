'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ClipboardList,
  RefreshCw,
  Columns2,
  LogOut,
} from 'lucide-react';
import { NAV_ITEMS } from '@/src/shared/constants/navigation';
import { clearSession, getSessionUser } from '@/src/shared/auth/session';

const NAV_ICON = {
  dashboard: LayoutDashboard,
  balances: Wallet,
  requests: ClipboardList,
  hcm: RefreshCw,
};

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getSessionUser();

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <div className="layout-root">
      <aside className="left-sidebar">
        <div className="brand-header">
          <div className="brand-avatar">T</div>
          <div>
            <p className="brand-title">Time-Off</p>
            <p className="brand-subtitle">Leave management</p>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-title">Operations</p>
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => {
                const Icon = NAV_ICON[item.key];
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link className={isActive ? 'nav-item active' : 'nav-item'} href={item.href}>
                      <Icon size={20} strokeWidth={1.9} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <p className="user-name">{user?.username || 'user'}</p>
            <p className="user-meta">{(user?.username || 'user')}@admin.com · {user?.role || 'USER'}</p>
          </div>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.9} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <Columns2 size={20} strokeWidth={1.9} />
          <div className="topbar-divider" />
          <p className="topbar-title">Time-Off</p>
        </header>

        <main className="page-content">{children}</main>
      </section>
    </div>
  );
}
