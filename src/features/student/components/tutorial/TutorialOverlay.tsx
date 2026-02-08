
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialContext, TutorialStep } from './TutorialContext';
import { TutorialPopover } from './TutorialPopover';

// Helper to check visibility
function isVisible(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
}

// Helper to get element bounds
function getRect(step: TutorialStep): DOMRect | null {
    // 1. Try primary target
    let el = document.getElementById(step.targetId);
    if (el && isVisible(el)) return el.getBoundingClientRect();

    // 2. Try fallbacks
    if (step.targets) {
        for (const id of step.targets) {
            el = document.getElementById(id);
            if (el && isVisible(el)) return el.getBoundingClientRect();
        }
    }

    return null;
}

export const TutorialOverlay: React.FC = () => {
    const {
        isActive,
        currentStep,
        currentStepIndex,
        // @ts-ignore
        config, // Need config to get total length
        nextStep,
        prevStep,
        skipTutorial
    } = useTutorialContext();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Update rect on step change or resize
    useEffect(() => {
        if (!isActive || !currentStep) return;

        const updateRect = () => {
            // small delay to ensure DOM is ready/animations finished
            setIsCalculating(true);
            setTimeout(() => {
                const rect = getRect(currentStep);
                setTargetRect(rect);
                setIsCalculating(false);
            }, 100);
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true); // capture phase for scroll

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [isActive, currentStep, currentStep?.targetId, JSON.stringify(currentStep?.targets)]);

    // Handle "Escape" key to skip
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isActive && e.key === 'Escape') skipTutorial();
            if (isActive && e.key === 'ArrowRight') nextStep();
            if (isActive && e.key === 'ArrowLeft') prevStep();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, skipTutorial, nextStep, prevStep]);

    if (!isActive || !currentStep) return null;

    // Total steps
    const totalSteps = config?.steps?.length || 0;

    // Portal to body
    return createPortal(
        <AnimatePresence>
            {isActive && (
                <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">

                    {/* The Spotlight / Backdrop */}
                    <div className="absolute inset-0 w-full h-full">
                        {/* We use a heavy SVG path to create the "hole" */}
                        {targetRect && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full text-slate-900/70 dark:text-black/80" // Color of backdrop
                            >
                                <svg className="w-full h-full" width="100%" height="100%">
                                    <defs>
                                        <mask id="tutorial-mask">
                                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                            {/* The hole */}
                                            <motion.rect
                                                initial={false}
                                                animate={{
                                                    x: targetRect.left - 8, // padding
                                                    y: targetRect.top - 8,
                                                    width: targetRect.width + 16,
                                                    height: targetRect.height + 16,
                                                    rx: 8 // rounded hole
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 250,
                                                    damping: 30
                                                }}
                                                fill="black"
                                            />
                                        </mask>
                                    </defs>
                                    <rect
                                        x="0"
                                        y="0"
                                        width="100%"
                                        height="100%"
                                        fill="currentColor"
                                        mask="url(#tutorial-mask)"
                                    />

                                    {/* Optional: Highlight Border around target */}
                                    <motion.rect
                                        initial={false}
                                        animate={{
                                            x: targetRect.left - 8,
                                            y: targetRect.top - 8,
                                            width: targetRect.width + 16,
                                            height: targetRect.height + 16,
                                            rx: 8
                                        }}
                                        transition={{ type: "spring", stiffness: 250, damping: 30 }}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeDasharray="8 4"
                                    />
                                </svg>
                            </motion.div>
                        )}
                    </div>

                    {/* The Popover */}
                    {targetRect && !isCalculating && (
                        <TutorialPopover
                            step={currentStep}
                            totalSteps={totalSteps}
                            currentStepIndex={currentStepIndex}
                            onNext={nextStep}
                            onPrev={prevStep}
                            onSkip={skipTutorial}
                            style={{
                                position: 'absolute',
                                // Simple positioning logic
                                top: targetRect.bottom + 20 < window.innerHeight - 200
                                    ? targetRect.bottom + 24
                                    : targetRect.top - 200, // Flip if not enough space below
                                left: Math.min(Math.max(20, targetRect.left + (targetRect.width / 2) - 160), window.innerWidth - 340), // Center horizontally, clam to edges
                            }}
                        />
                    )}
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
