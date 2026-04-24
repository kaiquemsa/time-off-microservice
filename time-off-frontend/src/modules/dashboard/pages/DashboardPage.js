import {
  Wallet,
  ClipboardList,
  CircleCheck,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

function ProcessCard({ step, title, text, Icon, href }) {
  return (
    <article className="dashboard-process-card">
      <div className="process-card-head">
        <div className="process-icon-wrap">
          <Icon size={24} strokeWidth={2.1} />
        </div>
        <span>Step {step}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link href={href}>Open →</Link>
    </article>
  );
}

function QuickCard({ title, text, href }) {
  return (
    <article className="dashboard-quick-card">
      <h3>{title}</h3>
      <p>{text}</p>
      <Link href={href}>Open →</Link>
    </article>
  );
}

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <h2 className="section-title">PROCESS FLOW</h2>
      <div className="dashboard-process-grid">
        <ProcessCard
          step={1}
          title="Balance"
          text="Review and maintain leave balance by employee and location."
          Icon={Wallet}
          href="/balances"
        />
        <ProcessCard
          step={2}
          title="Request"
          text="Create leave requests; balance is reserved automatically."
          Icon={ClipboardList}
          href="/requests"
        />
        <ProcessCard
          step={3}
          title="Decision"
          text="Managers approve or reject, updating employee balances."
          Icon={CircleCheck}
          href="/requests"
        />
        <ProcessCard
          step={4}
          title="HCM Sync"
          text="Integration keeps data consistent with the external HCM."
          Icon={RefreshCw}
          href="/hcm"
        />
      </div>

      <h2 className="section-title">QUICK ACTIONS</h2>
      <div className="dashboard-quick-grid">
        <QuickCard
          title="Check balance"
          text="View available, reserved, used and effective values."
          href="/balances"
        />
        <QuickCard
          title="New request"
          text="Submit a leave request in a few seconds."
          href="/requests"
        />
        <QuickCard
          title="Sync with HCM"
          text="Realtime, batch and sync-result operations."
          href="/hcm"
        />
      </div>
    </section>
  );
}
