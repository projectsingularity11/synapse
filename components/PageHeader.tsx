export function PageHeader({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="page-header glass-surface">
      <span className="eyebrow">SYNDROME / {index}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  );
}
