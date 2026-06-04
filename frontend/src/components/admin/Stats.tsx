export function Stats({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div
      key={label}
      className="border border-border bg-card rounded-xl p-5 flex items-center gap-4"
    >
      <div className="p-2 rounded-lg bg-muted/40">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default Stats;
