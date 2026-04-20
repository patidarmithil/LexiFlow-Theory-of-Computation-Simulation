/**
 * GlassPanel.tsx — Reusable frosted-glass card
 * Uses Framer Motion's `custom` prop with a delay for staggered entrance.
 */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassPanelProps {
  id?: string;
  className?: string;
  children: ReactNode;
  delay?: number;
}

export default function GlassPanel({ id, className = '', children, delay = 0 }: GlassPanelProps) {
  return (
    <motion.section
      id={id}
      className={`glass-panel p-6 ${className}`}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.section>
  );
}
