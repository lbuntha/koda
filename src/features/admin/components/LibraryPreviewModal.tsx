import React, { useState } from 'react';
import { Skill } from '@types';
import { getSkillRenderer } from '@shared/components/SkillRenderers';
import { Button, Card } from '@shared/components/ui';
import { X, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';

interface LibraryPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    component: Skill | null;
}

export const LibraryPreviewModal: React.FC<LibraryPreviewModalProps> = ({
    isOpen,
    onClose,
    component
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen || !component || !component.questionBank || component.questionBank.length === 0) return null;

    const question = component.questionBank[currentQuestionIndex];
    const Renderer = getSkillRenderer(component.customLayoutId);

    const handleNext = () => {
        const nextIndex = (currentQuestionIndex + 1) % component.questionBank!.length;
        setCurrentQuestionIndex(nextIndex);
        resetState();
    };

    const handlePrev = () => {
        const prevIndex = (currentQuestionIndex - 1 + component.questionBank!.length) % component.questionBank!.length;
        setCurrentQuestionIndex(prevIndex);
        resetState();
    };

    const resetState = () => {
        setSelectedAnswer('');
        setIsSubmitted(false);
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;
        setIsSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            {component.skillName}
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium uppercase">Preview</span>
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{component.grade} • {component.subject}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-full max-w-3xl">
                        <Renderer
                            question={question}
                            onAnswer={setSelectedAnswer}
                            isSubmitted={isSubmitted}
                            selectedAnswer={selectedAnswer}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-3 items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrev}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <span className="text-xs font-mono text-slate-400">
                            {currentQuestionIndex + 1} / {component.questionBank.length}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleNext}>
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="flex justify-center">
                        {!isSubmitted ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedAnswer}
                                className="w-full md:w-auto min-w-[120px]"
                            >
                                Check Answer
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                variant="outline"
                                className="w-full md:w-auto min-w-[120px] border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                                Next Question <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={resetState} className="text-slate-400 hover:text-slate-600">
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon import fix
import { ArrowRight } from 'lucide-react';
