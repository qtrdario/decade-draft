import type { Prospectus } from '../types';

const BULLETS = [
  { icon: '\u{1F4CB}', label: 'Thesis', key: 'pitch' as const },
  { icon: '\u{1F4B0}', label: 'Valuation', key: 'valuation' as const },
  { icon: '\u{1F6A9}', label: 'Risk', key: 'risk' as const },
];

interface ProspectusBulletsProps {
  prospectus: Prospectus;
  compact?: boolean;
}

export function ProspectusBullets({ prospectus, compact }: ProspectusBulletsProps) {
  return (
    <ul className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {BULLETS.map(({ icon, label, key }) => (
        <li key={key} className="flex gap-2.5 text-left">
          <span className="shrink-0 text-base leading-snug" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-grey/70 mb-0.5">{label}</p>
            <p className="text-off-white/90 leading-relaxed">{prospectus[key]}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
