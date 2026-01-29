
import React, { useEffect } from 'react';
import { GeneratedQuestion, Skill } from '@types';
import { Button } from '@shared/components/ui';
import { getSkillRenderer } from '@shared/components/SkillRenderers';
import {
    Loader2,
    CheckCircle,
    XCircle,
    Play,
    Pause,
    ArrowRight
} from 'lucide-react';

interface GameStageProps {
    loadingQuestion: boolean;
    question: GeneratedQuestion | null;
    activeSkill: Skill | null;
    selectedAnswer: string;
    isSubmitted: boolean;
    isCorrect: boolean;
    autoAdvancePaused: boolean;
    onSetSelectedAnswer: (val: string) => void;
    onSubmit: () => void;
    onNext: () => void;
    onTogglePause: () => void;
}

export const GameStage: React.FC<GameStageProps> = ({
    loadingQuestion,
    question,
    activeSkill,
    selectedAnswer,
    isSubmitted,
    isCorrect,
    autoAdvancePaused,
    onSetSelectedAnswer,
    onSubmit,
    onNext,
    onTogglePause
}) => {
    // Enter key to submit answer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (!isSubmitted && selectedAnswer) {
                    onSubmit();
                } else if (isSubmitted) {
                    onNext();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitted, selectedAnswer, onSubmit, onNext]);

    if (loadingQuestion) {
        return (
            <div className="flex h-full flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Loading...</h3>
            </div>
        );
    }

    if (!question || !activeSkill) return null;

    const Renderer = getSkillRenderer(activeSkill.customLayoutId);

    return (
        <div className="flex flex-col min-h-full pb-32 sm:pb-32">
            {/* Main Renderer Container */}
            <div className="w-full px-4 flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <Renderer
                    question={question}
                    onAnswer={onSetSelectedAnswer}
                    isSubmitted={isSubmitted}
                    selectedAnswer={selectedAnswer}
                />
            </div>

            {/* Centered Submit Button - Sticky on Mobile */}
            {!isSubmitted && (
                <div className="w-full flex justify-center py-4 sm:py-8 fixed bottom-4 left-0 right-0 sm:static sm:bottom-auto pointer-events-none sm:pointer-events-auto px-4 z-20">
                    <Button
                        onClick={onSubmit}
                        disabled={!selectedAnswer}
                        size="lg"
                        variant="super"
                        className="w-full max-w-sm h-14 text-xl rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none pointer-events-auto shadow-2xl sm:shadow-xl"
                    >
                        Check Answer
                    </Button>
                </div>
            )}

            {/* Result Overlay */}
            {isSubmitted && (
                <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] pb-safe animate-in slide-in-from-bottom duration-300">
                    <div className={`p-4 md:p-6 w-full ${isCorrect ? 'bg-emerald-50/50 dark:bg-emerald-900/20' : 'bg-rose-50/50 dark:bg-rose-900/20'}`}>
                        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                                    {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`font-bold text-lg truncate ${isCorrect ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
                                        {isCorrect ? 'Excellent!' : 'Correct Answer:'}
                                    </h4>
                                    {!isCorrect && <div className="text-base font-bold text-rose-600 dark:text-rose-300 mb-0.5">{question?.correctAnswer}</div>}
                                    <p className={`text-xs md:text-sm truncate ${isCorrect ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {question?.explanation}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                {autoAdvancePaused ? (
                                    <Button onClick={onTogglePause} size="sm" className="bg-slate-800 text-white hover:bg-slate-700 h-9 px-3">
                                        Resume <Play className="w-3 h-3 ml-1" />
                                    </Button>
                                ) : (
                                    <button onClick={onTogglePause} className="flex items-center justify-end gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider mb-1">
                                        <Pause className="w-3 h-3" /> Pause
                                    </button>
                                )}
                                <Button onClick={onNext} className={`h-10 px-4 ${isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"}`}>
                                    Next <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
