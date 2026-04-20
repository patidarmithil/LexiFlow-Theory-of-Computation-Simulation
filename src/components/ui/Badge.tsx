/** Badge.tsx — Small label chip for state IDs, symbols, etc. */

type BadgeColor = 'blue' | 'violet' | 'rose' | 'emerald' | 'amber' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  blue:    'bg-blue-100/80 text-blue-700 border-blue-200/60',
  violet:  'bg-violet-100/80 text-violet-700 border-violet-200/60',
  rose:    'bg-rose-100/80 text-rose-600 border-rose-200/60',
  emerald: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60',
  amber:   'bg-amber-100/80 text-amber-700 border-amber-200/60',
  slate:   'bg-slate-100/80 text-slate-600 border-slate-200/60',
};

export default function Badge({ children, color = 'slate', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-semibold
        rounded-lg border mono
        ${colorMap[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
