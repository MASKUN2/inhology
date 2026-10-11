// Tailwind class strings used by more than one component.

/** A text input, select or textarea. */
export const field = 'rounded-md border border-border bg-background px-3 py-2';

/** A primary action; the caller adds padding and text size. */
export const primaryButton =
  'rounded-md bg-strong text-strong-foreground hover:opacity-90';

/** A tag pill, filled when it is the selected one. */
export function pill(active: boolean): string {
  return `whitespace-nowrap rounded-full px-2 py-0.5 text-xs hover:opacity-80 ${
    active ? 'bg-strong text-strong-foreground' : 'bg-subtle text-muted'
  }`;
}
