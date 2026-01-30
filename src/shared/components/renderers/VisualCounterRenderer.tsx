import React, { useState, useEffect, useCallback } from 'react';
import { SkillRendererProps } from './DefaultRenderer';
import { Delete } from 'lucide-react';
import { RichText } from '@shared/components/ui/RichText';

export const VisualCounterRenderer: React.FC<SkillRendererProps> = ({ question, onAnswer, isSubmitted, selectedAnswer }) => {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const emojis = question.questionText.match(emojiRegex) || [];
    const displayText = question.questionText.replace(emojiRegex, '').trim().replace(/:$/, '');

    // --- Numpad Logic ---
    const [inputValue, setInputValue] = useState('');

    // Sync input with parent
    useEffect(() => {
        if (!isSubmitted && !question.options?.length) {
            onAnswer(inputValue);
        }
    }, [inputValue, isSubmitted, onAnswer, question.options]);

    // Reset when question changes
    useEffect(() => {
        setInputValue('');
    }, [question]);

    const handleDigit = useCallback((digit: string) => {
        if (isSubmitted) return;
        setInputValue(prev => {
            if (prev.length >= 3) return prev; // Limit to 3 digits for visuals
            return prev + digit;
        });
    }, [isSubmitted]);

    const handleBackspace = useCallback(() => {
        if (isSubmitted) return;
        setInputValue(prev => prev.slice(0, -1));
    }, [isSubmitted]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitted || (question.options && question.options.length > 0)) return;
            if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
            if (e.key === 'Backspace') handleBackspace();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitted, question.options, handleDigit, handleBackspace]);

    // Motivational Badge Logic
    const badges = ['You act like a pro!', 'Super Math!', 'Math Wizard!', 'You got this!', 'Amazing!', 'Keep it up!'];
    const randomBadge = React.useMemo(() => badges[Math.floor(Math.random() * badges.length)], []);

    const DigitButton: React.FC<{ digit: string }> = ({ digit }) => (
        <button
            onClick={() => handleDigit(digit)}
            disabled={isSubmitted}
            className={`
                aspect-square rounded-full text-2xl md:text-4xl font-black
                bg-slate-100 dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200
                hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600
                active:border-b-0 active:translate-y-1 active:mb-1
                transition-all duration-75
                shadow-sm flex items-center justify-center pb-1
                w-12 h-12 md:w-full md:h-full
            `}
        >
            {digit}
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row h-full items-center justify-center gap-8 w-full max-w-5xl mx-auto p-4 transition-all duration-300">

            {/* Left Side: Visuals & Question */}
            <div className="flex flex-col h-full w-full md:flex-1 gap-4 min-h-0 relative">
                {/* Header Area */}
                {/* Header Area - Hide if showing text in main box (Word Problem mode) */}
                {emojis.length > 0 && (
                    <div className="flex flex-col items-center gap-1 z-10 shrink-0">
                        <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-100 dark:to-slate-400 text-center tracking-tight">
                            {displayText}
                        </h2>
                        <div className="h-1 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                )}

                {/* Visual Container */}
                <div className="flex-1 w-full relative group">
                    {/* Motivational Badge - Floating & Modern */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-max pointer-events-none">
                        <span className={`
                            flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border
                            animate-in slide-in-from-top fade-in duration-700
                            ${randomBadge === 'Super Math!'
                                ? 'bg-amber-100/90 border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700/50 dark:text-amber-300'
                                : 'bg-indigo-100/90 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-700/50 dark:text-indigo-300'}
                        `}>
                            <span className="text-base">✨</span> {randomBadge}
                        </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-inner" />
                    <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/20 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none rounded-3xl" />

                    <div className="relative h-full w-full p-2 md:p-8 flex items-center justify-center overflow-y-auto min-h-[160px] md:min-h-[260px] rounded-3xl">
                        <div className="flex flex-wrap gap-2 md:gap-6 justify-center content-center relative z-10">
                            {emojis.length > 0 ? (
                                emojis.map((emoji, idx) => (
                                    <div
                                        key={idx}
                                        className="text-4xl sm:text-5xl md:text-7xl animate-in zoom-in-50 duration-500 fill-mode-backwards select-none drop-shadow-xl transform hover:scale-110 hover:-rotate-6 transition-transform cursor-pointer"
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        {emoji}
                                    </div>
                                ))
                            ) : (
                                <div className="text-left px-4 md:px-8 w-full">
                                    <div className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed font-fredoka">
                                        <RichText text={displayText} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Answer Display - Under Visuals */}
                {!question.options?.length && (
                    <div className="w-full relative animate-in slide-in-from-bottom duration-500">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full -z-10" />
                        <div className="w-full h-16 md:h-24 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center px-8 shadow-sm">
                            <span className="text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                                {inputValue || <span className="text-slate-200 dark:text-slate-600 animate-pulse">?</span>}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Input / Keypad */}
            <div className="shrink-0 w-full md:w-auto min-w-[320px] flex flex-col justify-center items-center">
                <div className="w-full max-w-[220px] md:max-w-sm flex flex-col items-center gap-3 md:gap-6">
                    {/* Numpad Grid - Always visible for Visual Counter */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3 w-full px-1 md:px-2">
                        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                            <DigitButton key={num} digit={num.toString()} />
                        ))}

                        {/* Empty Slot */}
                        <div className="aspect-square" />

                        <DigitButton digit="0" />

                        <button
                            onClick={handleBackspace}
                            disabled={isSubmitted}
                            className="aspect-square rounded-full flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 border-b-4 border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800 active:border-b-0 active:translate-y-1 active:mb-1 transition-all w-12 h-12 md:w-full md:h-full"
                        >
                            <Delete className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
