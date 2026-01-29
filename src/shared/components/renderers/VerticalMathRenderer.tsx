import React, { useState, useEffect, useCallback } from 'react';
import { SkillRendererProps } from './DefaultRenderer';
import { Delete } from 'lucide-react';

export const VerticalMathRenderer: React.FC<SkillRendererProps> = ({ question, onAnswer, isSubmitted, selectedAnswer }) => {
    const [inputValue, setInputValue] = useState('');

    // Parse the Question
    const regex = /([\d\.]+)\s*([+\-*xX\/÷])\s*([\d\.]+)(?=[^\d]*$)/;
    const match = question.questionText.match(regex);

    const num1 = match ? match[1] : '?';
    let rawOp = match ? match[2] : '+';
    const num2 = match ? match[3] : '?';

    let displayOp = rawOp;
    if (rawOp === '*' || rawOp.toLowerCase() === 'x') displayOp = '×';
    if (rawOp === '/' || rawOp === '÷') displayOp = '÷';

    useEffect(() => {
        if (!isSubmitted) {
            onAnswer(inputValue);
        }
    }, [inputValue, onAnswer, isSubmitted]);

    useEffect(() => {
        setInputValue('');
    }, [question.questionText]);

    const isDivision = displayOp === '÷';

    const handleDigit = useCallback((digit: string) => {
        if (isSubmitted) return;
        setInputValue(prev => {
            if (prev.length >= 6) return prev;
            return isDivision ? prev + digit : digit + prev;
        });
    }, [isSubmitted, isDivision]);

    const handleBackspace = useCallback(() => {
        if (isSubmitted) return;
        setInputValue(prev => isDivision ? prev.slice(0, -1) : prev.slice(1));
    }, [isSubmitted, isDivision]);

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
        if (isSubmitted) {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 justify-center">
                        {(selectedAnswer || '?').split('').map((digit, idx) => (
                            <span key={idx} className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center text-4xl md:text-5xl leading-none font-bold ${isCorrect ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400 line-through decoration-2 decoration-rose-400'}`}>
                                {digit}
                            </span>
                        ))}
                    </div>
                    {!isCorrect && <span className="text-3xl md:text-4xl text-emerald-500 dark:text-emerald-400 font-bold">{question.correctAnswer}</span>}
                </div>
            );
        }
        return (
            <div className="flex gap-0.5 justify-center items-center min-h-[48px] md:min-h-[56px]">
                {inputValue ? (
                    inputValue.split('').map((digit, idx) => (
                        <span key={idx} className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center text-4xl md:text-5xl leading-none font-bold text-indigo-600 dark:text-indigo-300 animate-in zoom-in duration-200">
                            {digit}
                        </span>
                    ))
                ) : (
                    <span className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center text-4xl md:text-5xl leading-none font-bold text-slate-300 dark:text-slate-600 animate-pulse">?</span>
                )}
            </div>
        );
    };

    // Calculate dividend width for proper line sizing
    const dividendCharCount = String(num1).length;
    const dividendWidth = dividendCharCount * 48 + 20; // ~48px per digit + padding

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-4 md:gap-6 py-4 px-4">

            <div className="flex flex-col md:flex-row items-center md:items-center justify-center gap-8 md:gap-16 w-full md:max-w-4xl transition-all duration-300">

                {/* Question Area */}
                <div className="w-full md:flex-1 flex flex-col items-center justify-center py-6 min-h-[280px] md:min-h-[320px] relative">

                    {/* Motivational Badge */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-max z-10">
                        <span className={`
                            px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm transform -rotate-2
                            ${['You act like a pro!', 'Super Math!', 'Math Wizard!', 'You got this!', 'Amazing!', 'Keep it up!'][Math.floor(Math.random() * 6)] === 'Super Math!'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rotate-2'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}
                        `}>
                            {['You act like a pro!', 'Super Math!', 'Math Wizard!', 'You got this!', 'Amazing!', 'Keep it up!'][Math.floor(Math.random() * 6)]}
                        </span>
                    </div>

                    {isDivision ? (
                        /* Long Division Layout - Clean & Aligned */
                        <div className="flex flex-col items-center font-bold text-slate-800 dark:text-slate-100 select-none mt-12">

                            {/* Answer Row */}
                            <div className="flex items-end mb-4">
                                {/* Spacer for Divisor */}
                                <div className="w-[65px] md:w-[80px]" />
                                {/* Spacer for Bracket */}
                                <div className="w-[32px] md:w-[40px]" />
                                {/* Answer aligned with Dividend */}
                                <div className="flex justify-center" style={{ width: dividendWidth + 32 }}>
                                    {renderInputDisplay()}
                                </div>
                            </div>

                            {/* Main Row: Divisor + Bracket/Line + Dividend */}
                            <div className="flex items-end">

                                {/* Divisor */}
                                <span className="text-6xl md:text-7xl leading-none tracking-tight pr-1">{num2}</span>

                                {/* Combined Bracket + Top Line SVG */}
                                <svg
                                    width={32 + dividendWidth + 32}
                                    height="80"
                                    viewBox={`0 0 ${32 + dividendWidth + 32} 80`}
                                    fill="none"
                                    className="text-slate-800 dark:text-slate-100 shrink-0"
                                    style={{ marginBottom: '-4px' }}
                                >
                                    {/* 
                                        Path: 
                                        M 2,76 - Start near bottom-left
                                        C 26,58 26,22 2,4 - Curve up to top-left
                                        L {width},4 - Horizontal line to the right
                                    */}
                                    <path
                                        d={`M 2,76 C 28,58 28,22 2,4 L ${32 + dividendWidth + 32 - 2},4`}
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </svg>

                                {/* Dividend - Positioned to overlap with the SVG's right side */}
                                <span
                                    className="text-6xl md:text-7xl leading-none tracking-tight"
                                    style={{ marginLeft: -(dividendWidth + 24) }}
                                >
                                    {num1}
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Standard Vertical Stack */
                        <div className="flex flex-col items-end font-bold text-slate-800 dark:text-slate-100 select-none scale-110 md:scale-125 origin-center mt-8">
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center justify-end">
                                    <span className="w-8" />
                                    <span className="text-5xl leading-none tracking-tight font-bold tabular-nums text-right min-w-[2ch]">
                                        {num1}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end">
                                    <span className="text-3xl text-slate-400 dark:text-slate-400 font-medium w-8 text-center pb-2">
                                        {displayOp}
                                    </span>
                                    <span className="text-5xl leading-none tracking-tight font-bold tabular-nums text-right min-w-[2ch]">
                                        {num2}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-1.5 bg-slate-800 dark:bg-slate-200 rounded-full mt-2 mb-4" />

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
