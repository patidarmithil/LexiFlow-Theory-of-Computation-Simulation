/** Button.tsx — Shared premium button component */
import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.35)] border border-white/10',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  ghost:
    'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100/80',
  danger:
    'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_4px_12px_rgba(244,63,94,0.2)]',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg',
  md: 'px-5 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-7 py-3 text-base font-semibold rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{ fontFamily: 'var(--font-heading)' }}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading && (
        <span
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </motion.button>
  );
}
