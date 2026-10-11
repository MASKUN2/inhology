/** Marks a private post. Only the signed-in author ever sees one. */
export function PrivateBadge() {
  return (
    <span className="whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs text-muted">
      Private
    </span>
  );
}
