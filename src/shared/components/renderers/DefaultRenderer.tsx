import { RichText } from '@shared/components/ui/RichText';

// ...

export const DefaultRenderer: React.FC<SkillRendererProps> = ({ question, onAnswer, isSubmitted, selectedAnswer }) => {
    return (
        <div className="space-y-6 w-full max-w-2xl mx-auto">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100 text-left leading-relaxed">
                <RichText text={question.questionText} />
            </h2>
            <div className="space-y-3 md:space-y-4">
                {question.options && question.options.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {question.options.map((opt, idx) => {
                            // Define color map for options A, B, C, D
                            const colorMap = [
                                {
                                    bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800',
                                    hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700',
                                    text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                                },
                                {
                                    bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800',
                                    hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700',
                                    text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                                },
                                {
                                    bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800',
                                    hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700',
                                    text: 'text-amber-800 dark:text-amber-300', badge: 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200'
                                },
                                {
                                    bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800',
                                    hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700',
                                    text: 'text-rose-800 dark:text-rose-300', badge: 'bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-200'
                                }
                            ];
                            const theme = colorMap[idx % colorMap.length];

                            return (
                                <button
                                    key={idx}
                                    onClick={() => !isSubmitted && onAnswer(opt)}
                                    disabled={isSubmitted}
                                    className={`
                                        p-4 rounded-xl border-2 text-left transition-all text-sm md:text-base flex justify-between items-center group
                                        ${isSubmitted && opt === question.correctAnswer
                                            ? 'bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-500 ring-2 ring-green-200 dark:ring-green-900 z-10'
                                            : isSubmitted && opt === selectedAnswer && opt !== question.correctAnswer
                                                ? 'bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-500 opacity-70'
                                                : !isSubmitted && selectedAnswer === opt
                                                    ? 'bg-slate-800 dark:bg-slate-700 border-slate-900 dark:border-slate-600 text-white shadow-lg transform scale-[1.02]'
                                                    : `${theme.bg} ${theme.border} ${theme.text} ${theme.hover} hover:shadow-md hover:-translate-y-0.5`
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`
                                            flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shadow-sm transition-colors
                                            ${!isSubmitted && selectedAnswer === opt ? 'bg-slate-700 dark:bg-slate-900 text-slate-200' : theme.badge}
                                        `}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className={`font-medium ${!isSubmitted && selectedAnswer === opt ? 'text-white' : ''} ${isSubmitted ? 'dark:text-slate-200' : ''}`}>{opt}</span>
                                    </div>
                                    {isSubmitted && opt === question.correctAnswer && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 animate-in zoom-in spin-in-90 duration-300" />}
                                </button>
                            );
                        })}
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
