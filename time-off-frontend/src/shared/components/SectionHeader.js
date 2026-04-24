export function SectionHeader({ title, subtitle }) {
  return (
    <header className="section-header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  );
}
