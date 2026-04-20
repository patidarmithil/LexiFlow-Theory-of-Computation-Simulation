/**
 * DerivationPanel.tsx — Full derivation viewer with controls and result display.
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, GitMerge } from 'lucide-react';
import DerivationStep from './DerivationStep';
import StepControls from '../ui/StepControls';
import { useAppStore } from '../../store/appStore';
import { useDerivation } from '../../hooks/useDerivation';

export default function DerivationPanel() {
  const {
    derivationSteps,
    currentStep,
    derivationFound,
    derivationReason,
    derivationStatus,
    testString,
  } = useAppStore();

  const { togglePlay, nextStep, prevStep, setCurrentStep, isPlaying, totalSteps } =
    useDerivation();

  // Auto-scroll to the active step
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (currentStep >= 0 && stepRefs.current[currentStep]) {
      stepRefs.current[currentStep]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStep]);

  const hasResult = derivationStatus === 'success';

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="premium-label">
        <GitMerge size={14} className="text-indigo-600" strokeWidth={2.5} />
        <span>Derivation Trace</span>
      </div>


      {/* Result badge */}
      <AnimatePresence mode="wait">
        {hasResult && (
          <motion.div
            key={derivationFound ? 'found' : 'notfound'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`
              flex items-center gap-3 px-4 py-3 border shadow-sm
              ${
                derivationFound
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-rose-50 border-rose-100 text-rose-700'
              }
            `}
            role="status"
            aria-live="polite"
          >
            {derivationFound ? (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            ) : (
              <XCircle size={18} className="text-rose-500 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold">
                {derivationFound
                  ? `"${testString || 'ε'}" is accepted`
                  : 'String not accepted'}
              </span>
              <span className="text-[11px] font-medium opacity-80">
                 {derivationFound ? `${derivationSteps.length} derivation steps found` : derivationReason}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps list */}
      {derivationSteps.length > 0 && (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Controls */}
          <StepControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            onPlay={togglePlay}
            onPrev={prevStep}
            onNext={nextStep}
            onSeek={setCurrentStep}
          />

          {/* Steps list container */}
          <div className="flex-1 overflow-y-auto pr-1">
             <div className="flex flex-col gap-1.5 pt-1">
               {derivationSteps.map((step, i) => (
                 <div
                   key={i}
                   ref={(el) => {
                     stepRefs.current[i] = el;
                   }}
                 >
                   <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                   >
                     <DerivationStep
                       step={step}
                       index={i}
                       isActive={i === currentStep}
                       isFinal={i === derivationSteps.length - 1 && derivationFound}
                     />
                   </motion.div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasResult && derivationStatus !== 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-300">
          <div className="p-4 bg-slate-100">
            <GitMerge size={24} strokeWidth={2} className="text-slate-400" />
          </div>
          <p className="text-sm text-center text-slate-400 font-medium">
            Enter a test string and click <strong className="text-slate-600">Derive</strong>
          </p>
        </div>
      )}

      {/* Loading */}
      {derivationStatus === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Simulating derivation…</span>
        </div>
      )}
    </div>
  );
}
