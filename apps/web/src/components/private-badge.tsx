/** Marks a private post: listed for everyone, readable by the signed-in author only. */
export function PrivateBadge() {
  return (
    <span className="whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs text-muted">
      Private
    </span>
  );
}
