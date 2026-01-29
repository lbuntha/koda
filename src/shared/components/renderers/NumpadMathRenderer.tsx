import React, { useState, useEffect, useCallback } from 'react';
import { SkillRendererProps } from './DefaultRenderer';
import { Delete, CornerDownLeft } from 'lucide-react';

export const NumpadMathRenderer: React.FC<SkillRendererProps> = ({
    question,
    onAnswer,
    isSubmitted,
    selectedAnswer
}) => {
    const [inputValue, setInputValue] = useState('');

    // Parse the equation from questionText
    const regex = /([\d\.]+)\s*([+\-*xX\/÷])\s*([\d\.]+)(?=[^\d]*$)/;
    const match = question.questionText.match(regex);

    const num1 = match ? match[1] : '?';
    let rawOp = match ? match[2] : '+';
    const num2 = match ? match[3] : '?';

    // Normalize operator display
    let displayOp = rawOp;
    if (rawOp === '*' || rawOp.toLowerCase() === 'x') displayOp = '×';
    if (rawOp === '/' || rawOp === '÷') displayOp = '÷';

    // Sync input with parent state
    useEffect(() => {
        if (!isSubmitted) {
            onAnswer(inputValue);
        }
    }, [inputValue, onAnswer, isSubmitted]);

    // Reset input when question changes
    useEffect(() => {
        setInputValue('');
    }, [question.questionText]);

    const isDivision = displayOp === '÷';

    const handleDigit = useCallback((digit: string) => {
        if (isSubmitted) return;
        setInputValue(prev => {
            if (prev.length >= 6) return prev;
            // For Division: Type Left-to-Right (Standard reading order)
            // For others: Type Right-to-Left (Ones place first, if that's the preferred style for vertical math)
            return isDivision ? prev + digit : digit + prev;
        });
    }, [isSubmitted, isDivision]);

    const handleBackspace = useCallback(() => {
        if (isSubmitted) return;
        // Division: Remove last char
        // Others: Remove first char (most recently added in prepend mode)
        setInputValue(prev => isDivision ? prev.slice(0, -1) : prev.slice(1));
    }, [isSubmitted, isDivision]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSubmitted) return;
            if (e.key >= '0' && e.key <= '9') {
                handleDigit(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitted, handleDigit, handleBackspace]);

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Digit button component
    const DigitButton: React.FC<{ digit: string }> = ({ digit }) => (
        <button
            onClick={() => handleDigit(digit)}
            disabled={isSubmitted}
            className={`
                aspect-square rounded-full text-3xl md:text-5xl font-black
                bg-slate-100 dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200
                hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600
                active:border-b-0 active:translate-y-1 active:mb-1
                transition-all duration-75
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-sm flex items-center justify-center pb-1
                w-16 h-16 md:w-24 md:h-24
            `}
        >
            {digit}
        </button>
    );

    const renderInputDisplay = () => {
        // Shared input display logic
        if (isSubmitted) {
            return (
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 justify-end">
                        {(selectedAnswer || '?').split('').map((digit, idx) => (
                            <span key={idx} className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-4xl md:text-5xl leading-none font-bold rounded-lg ${isCorrect ? 'text-emerald-500' : 'text-rose-400 line-through decoration-4 decoration-rose-400'}`}>
                                {digit}
                            </span>
                        ))}
                    </div>
                    {!isCorrect && <span className="text-3xl md:text-4xl text-emerald-500 font-bold ml-2">{question.correctAnswer}</span>}
                </div>
            );
        }
        return (
            <div className="flex gap-1 justify-center min-w-[80px]">
                {inputValue ? (
                    inputValue.split('').map((digit, idx) => (
                        <span key={idx} className="w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-4xl md:text-5xl leading-none font-bold rounded-lg text-indigo-600 dark:text-indigo-400 animate-in zoom-in duration-200">
                            {digit}
                        </span>
                    ))
                ) : (
                    <span className="w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-4xl md:text-5xl leading-none font-bold rounded-lg text-slate-200 dark:text-slate-700 animate-pulse">?</span>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-4 md:gap-6 py-4 px-4 min-h-[400px]">

            {/* Unified Game Stage - Responsive Wrapper */}
            <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-8 md:gap-20 w-full md:max-w-4xl transition-all duration-300">

                {/* Question Area */}
                <div className="w-full md:flex-1 flex flex-col items-center justify-center py-6 pt-12 md:pt-6 relative min-h-[200px]">

                    {/* Motivational Badge */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 w-max z-10">
                        <span className={`
                            px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm transform -rotate-2 block
                             ${['You act like a pro!', 'Super Math!', 'Math Wizard!', 'You got this!', 'Amazing!', 'Keep it up!'][Math.floor(Math.random() * 6)] === 'Super Math!'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 rotate-2'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'}
                        `}>
                            {['You act like a pro!', 'Super Math!', 'Math Wizard!', 'You got this!', 'Amazing!', 'Keep it up!'][Math.floor(Math.random() * 6)]}
                        </span>
                    </div>

                    {isDivision ? (
                        /* Long Division Layout */
                        <div className="flex flex-col items-center font-bold text-slate-800 dark:text-slate-100 select-none scale-110 md:scale-125 origin-center mt-8">
                            {/* Answer on Top */}
                            <div className="mb-1">
                                {renderInputDisplay()}
                            </div>

                            {/* Bracket & Numbers */}
                            <div className="flex items-stretch border-t-4 border-slate-800 dark:border-slate-200">
                                {/* Divisor */}
                                <div className="flex items-center px-3 border-r-4 border-slate-800 dark:border-slate-200 -ml-[4px]">
                                    <span className="text-4xl md:text-5xl leading-none">{num2}</span>
                                </div>
                                {/* Dividend */}
                                <div className="flex items-center px-4 py-1">
                                    <span className="text-5xl md:text-6xl leading-none tracking-tight">{num1}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard Vertical Stack (Add/Sub/Mult) */
                        <div className="flex flex-col items-end font-bold text-slate-800 dark:text-slate-100 select-none scale-110 md:scale-125 origin-center">
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-5xl leading-none tracking-tight">
                                    {num1}
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-3xl text-slate-400 dark:text-slate-500 font-medium">
                                        {displayOp}
                                    </span>
                                    <span className="text-5xl leading-none tracking-tight">
                                        {num2}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-1.5 bg-slate-800 dark:bg-slate-200 rounded-full mt-4 mb-4" />

                            <div className="flex justify-end w-full">
                                {renderInputDisplay()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Numpad Area */}
                <div className="w-full md:w-auto grid grid-cols-3 gap-3 md:gap-6 px-2 max-w-[320px] md:max-w-[400px]">
                    <DigitButton digit="7" />
                    <DigitButton digit="8" />
                    <DigitButton digit="9" />
                    <DigitButton digit="4" />
                    <DigitButton digit="5" />
                    <DigitButton digit="6" />
                    <DigitButton digit="1" />
                    <DigitButton digit="2" />
                    <DigitButton digit="3" />

                    <button
                        onClick={handleBackspace}
                        disabled={isSubmitted || !inputValue}
                        className={`
                            aspect-square rounded-full text-lg font-medium
                            bg-rose-50 dark:bg-rose-900/20 border-b-4 border-rose-200 dark:border-rose-900/50 text-rose-500
                            hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800
                            active:border-b-0 active:translate-y-1 active:mb-1
                            transition-all duration-75
                            disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-0 disabled:translate-y-0
                            flex items-center justify-center
                            w-16 h-16 md:w-24 md:h-24
                        `}
                    >
                        <Delete className="w-7 h-7 md:w-9 md:h-9" />
                    </button>

                    <DigitButton digit="0" />

                    <div className="aspect-square" />
                </div>
            </div>
        </div>
    );
};
