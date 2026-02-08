
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { TutorialStep } from './TutorialContext';

interface TutorialPopoverProps {
    step: TutorialStep;
    totalSteps: number;
    currentStepIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    style?: React.CSSProperties;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const TutorialPopover: React.FC<TutorialPopoverProps> = ({
    step,
    totalSteps,
    currentStepIndex,
    onNext,
    onPrev,
    onSkip,
    style,
    position
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-[60] bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-5 w-80 pointer-events-auto border border-white/20 dark:border-slate-700 backdrop-blur-sm"
            style={style}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="tex-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <button
                    onClick={onSkip}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                {step.content}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalSteps }).map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIndex
                                    ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {currentStepIndex > 0 && (
                        <button
                            onClick={onPrev}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                        {currentStepIndex < totalSteps - 1 && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>

            {/* Arrow/Tail (Pseudo-element or SVG) could go here based on position */}
        </motion.div>
    );
};
