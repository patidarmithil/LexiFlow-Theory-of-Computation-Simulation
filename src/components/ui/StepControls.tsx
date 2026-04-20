/** StepControls.tsx — Play / Pause / Prev / Next / scrubber for derivation */
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode, MouseEventHandler } from 'react';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (n: number) => void;
  disabled?: boolean;
}

export default function StepControls({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onPrev,
  onNext,
  onSeek,
  disabled = false,
}: StepControlsProps) {
  const pct = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar / scrubber */}
      <div className="relative h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-400 to-violet-500"
          style={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStep < 0 ? 0 : currentStep}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={disabled || totalSteps === 0}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
          aria-label="Derivation step scrubber"
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 mono">
          Step {currentStep < 0 ? 0 : currentStep + 1} / {totalSteps}
        </span>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <ControlBtn
            onClick={() => onSeek(0)}
            disabled={disabled || currentStep <= 0}
            title="First step"
            aria-label="Go to first step"
          >
            <SkipBack size={13} />
          </ControlBtn>

          <ControlBtn
            onClick={onPrev}
            disabled={disabled || currentStep <= 0}
            title="Previous step"
            aria-label="Previous step"
          >
            <ChevronLeft size={14} />
          </ControlBtn>

          {/* Play / Pause — prominent */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={onPlay}
            disabled={disabled || totalSteps === 0}
            className="
              flex items-center justify-center w-9 h-9
              rounded-full bg-gradient-to-br from-blue-500 to-violet-500
              text-white shadow-[0_2px_12px_rgba(99,102,241,0.4)]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-shadow hover:shadow-[0_4px_18px_rgba(99,102,241,0.55)]
            "
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause derivation' : 'Play derivation'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </motion.button>

          <ControlBtn
            onClick={onNext}
            disabled={disabled || currentStep >= totalSteps - 1}
            title="Next step"
            aria-label="Next step"
          >
            <ChevronRight size={14} />
          </ControlBtn>

          <ControlBtn
            onClick={() => onSeek(totalSteps - 1)}
            disabled={disabled || currentStep >= totalSteps - 1}
            title="Last step"
            aria-label="Go to last step"
          >
            <SkipForward size={13} />
          </ControlBtn>
        </div>
      </div>
    </div>
  );
}

// Small icon button helper
interface ControlBtnProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  'aria-label'?: string;
}

function ControlBtn({ children, disabled, onClick, title, 'aria-label': ariaLabel }: ControlBtnProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className="
        flex items-center justify-center w-7 h-7
        rounded-xl border border-slate-200/80 bg-white/60
        text-slate-500 hover:text-slate-800 hover:bg-white/90
        disabled:opacity-35 disabled:cursor-not-allowed
        transition-all duration-150
      "
    >
      {children}
    </motion.button>
  );
}
