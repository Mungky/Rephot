'use client';

const RULES = [
  { key: 'len', label: '8+ characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Lowercase', test: (p: string) => /[a-z]/.test(p) },
  { key: 'num', label: 'Number', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'Special char', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export function passwordMeetsAllRules(password: string) {
  return RULES.every((r) => r.test(password));
}

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul
      className="mt-1.5 flex flex-row flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] leading-none sm:gap-x-3 sm:text-[11px]"
      aria-live="polite"
    >
      {RULES.map((r, i) => {
        const met = r.test(password);
        return (
          <li
            key={r.key}
            className={`flex items-center gap-1 whitespace-nowrap transition-colors ${met ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {i > 0 ? (
              <span className="select-none text-neutral-300" aria-hidden>
                ·
              </span>
            ) : null}
            <span
              className={`inline-flex h-1 w-1 shrink-0 rounded-full ${met ? 'bg-emerald-500' : 'bg-red-400'}`}
              aria-hidden
            />
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}
