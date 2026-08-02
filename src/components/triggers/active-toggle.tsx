'use client';

export function ActiveToggle({
  active,
  name,
  pending,
  onToggle,
}: {
  active: boolean;
  name: string;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${name} — ${active ? 'active' : 'paused'}`}
      onClick={onToggle}
      disabled={pending}
      title={active ? 'Active — click to pause' : 'Paused — click to activate'}
      className={`focus-ring relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
        active ? 'bg-sky-500' : 'bg-rim-bright'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
