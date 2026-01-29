import React from 'react';
import { GeneratedQuestion } from '@types';
import { CheckCircle } from 'lucide-react';

export interface SkillRendererProps {
    question: GeneratedQuestion;
    onAnswer: (answer: string) => void;
    isSubmitted: boolean;
    selectedAnswer: string;
}

export const DefaultRenderer: React.FC<SkillRendererProps> = ({ question, onAnswer, isSubmitted, selectedAnswer }) => {
    return (
        <div className="space-y-6 w-full max-w-2xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 text-center">{question.questionText}</h2>
            <div className="space-y-3 md:space-y-4">
                {question.options && question.options.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {question.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => !isSubmitted && onAnswer(opt)}
                                disabled={isSubmitted}
                                className={`
                  p-4 rounded-xl border-2 text-left transition-all text-sm md:text-base flex justify-between items-center
                  ${isSubmitted && opt === question.correctAnswer ? 'bg-green-50 border-green-500' : ''}
                  ${isSubmitted && opt === selectedAnswer && opt !== question.correctAnswer ? 'bg-red-50 border-red-500' : ''}
                  ${!isSubmitted && selectedAnswer === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}
                `}
                            >
                                <div className="flex items-center">
                                    <span className="font-semibold text-slate-500 mr-2 w-6">{String.fromCharCode(65 + idx)}.</span>
                                    {opt}
                                </div>
                                {isSubmitted && opt === question.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                            </button>
                        ))}
                    </div>
                ) : (
                    <input
                        type="text"
                        placeholder="Type your answer..."
                        value={selectedAnswer}
                        onChange={(e) => onAnswer(e.target.value)}
                        disabled={isSubmitted}
                        className="w-full text-base md:text-lg p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-center font-bold"
                    />
                )}
            </div>
        </div>
    );
};
