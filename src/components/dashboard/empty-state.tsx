export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      {icon && (
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sage-soft text-sage-dark [&_svg]:size-7">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
