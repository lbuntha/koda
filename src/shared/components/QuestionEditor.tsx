// QuestionEditor - Step 2 of ComponentBuilder
import React from 'react';
import { Plus, Trash2, Save, Edit, CheckCircle, Circle, HelpCircle, Check } from 'lucide-react';
import { GeneratedQuestion } from '@types';
import { Button } from '@shared/components/ui';
import { SystemConfig } from '@stores';

interface QuestionEditorProps {
    questions: GeneratedQuestion[];
    onQuestionsChange: (questions: GeneratedQuestion[]) => void;
    layout: string;
    systemConfig: SystemConfig;
    onBack: () => void;
    onSave: () => void;
    isEditing: boolean;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
    questions,
    onQuestionsChange,
    layout,
    systemConfig,
    onBack,
    onSave,
    isEditing
}) => {
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [currentQ, setCurrentQ] = React.useState<GeneratedQuestion>({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
    });

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...(currentQ.options || [])];
        const oldVal = newOptions[idx];
        newOptions[idx] = val;

        let newCorrect = currentQ.correctAnswer;
        if (currentQ.correctAnswer === oldVal) {
            newCorrect = val;
        }

        setCurrentQ({ ...currentQ, options: newOptions, correctAnswer: newCorrect });
    };

    const markOptionAsCorrect = (val: string) => {
        setCurrentQ({ ...currentQ, correctAnswer: val });
    };

    const handleAddOrUpdateQuestion = () => {
        if (!currentQ.questionText || !currentQ.correctAnswer) return;

        const cleanOptions = currentQ.options || [];
        const questionPayload = { ...currentQ, options: cleanOptions };

        if (editingIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = questionPayload;
            onQuestionsChange(updatedQuestions);
            setEditingIndex(null);
        } else {
            onQuestionsChange([...questions, questionPayload]);
        }

        setCurrentQ({ questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    };

    const editQuestion = (index: number) => {
        const q = questions[index];
        const paddedOptions = [...(q.options || [])];
        while (paddedOptions.length < 4) paddedOptions.push('');

        setCurrentQ({ ...q, options: paddedOptions });
        setEditingIndex(index);
    };

    const deleteQuestion = (index: number) => {
        onQuestionsChange(questions.filter((_, idx) => idx !== index));
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setCurrentQ({ questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    };

    return (
        <div className="space-y-6">
            {/* Editor Form */}
            <div className={`p-5 rounded-xl border transition-all duration-300 ${editingIndex !== null
                ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/40 shadow-lg'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}>
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <span className={`text-sm font-bold uppercase tracking-wider ${editingIndex !== null ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {editingIndex !== null ? `EDITING QUESTION #${editingIndex + 1}` : `NEW QUESTION #${questions.length + 1}`}
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Mastery Goal</span>
                            <div className="flex items-center gap-1">
                                <div className={`text-xs font-bold ${questions.length >= systemConfig.questionsToMasterSkill ? 'text-emerald-600' : 'text-amber-500'}`}>
                                    {questions.length} / {systemConfig.questionsToMasterSkill}
                                </div>
                                {questions.length >= systemConfig.questionsToMasterSkill && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <span className="text-xs text-slate-400 font-medium">{questions.length} total</span>
                    </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                    <input
                        type="text"
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg text-base shadow-sm focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder={layout === 'vertical-math' ? "e.g. 4 + 2" : "Type question here..."}
                        value={currentQ.questionText}
                        onChange={e => setCurrentQ({ ...currentQ, questionText: e.target.value })}
                    />
                    {layout === 'vertical-math' && (
                        <p className="text-[10px] text-slate-500 mt-1">Format: number, operator, number (e.g. "12 - 5" or "4 + 4")</p>
                    )}
                </div>

                {/* Options Grid (Hide for Vertical Math) */}
                {layout !== 'vertical-math' && (
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Answer Options (Select the correct one)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQ.options?.map((opt, idx) => {
                                const isCorrect = currentQ.correctAnswer && currentQ.correctAnswer === opt && opt !== '';
                                return (
                                    <div key={idx} className={`relative flex items-center p-1 rounded-lg border-2 transition-colors ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white focus-within:border-indigo-300'}`}>
                                        <input
                                            type="text"
                                            className="flex-1 p-2 bg-transparent text-sm focus:outline-none"
                                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => markOptionAsCorrect(opt)}
                                            disabled={!opt}
                                            title="Mark as correct answer"
                                            className={`p-2 rounded-md mr-1 transition-all ${isCorrect ? 'text-emerald-600 bg-emerald-100' : 'text-slate-300 hover:text-emerald-500 hover:bg-slate-50'}`}
                                        >
                                            {isCorrect ? <CheckCircle className="w-5 h-5 fill-emerald-100" /> : <Circle className="w-5 h-5" />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Direct Answer Input for Vertical Math */}
                {layout === 'vertical-math' && (
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Correct Answer</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm outline-none"
                            placeholder="e.g. 6"
                            value={currentQ.correctAnswer}
                            onChange={e => setCurrentQ({ ...currentQ, correctAnswer: e.target.value })}
                        />
                    </div>
                )}

                {/* Explanation */}
                <div className="mb-4 relative">
                    <div className="absolute top-3 left-3 text-slate-400 dark:text-slate-500">
                        <HelpCircle className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-9 p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Explanation / Feedback for the student..."
                        value={currentQ.explanation}
                        onChange={e => setCurrentQ({ ...currentQ, explanation: e.target.value })}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    {editingIndex !== null && (
                        <Button size="sm" variant="ghost" className="flex-1 text-slate-500" onClick={cancelEdit}>
                            Cancel Edit
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant={editingIndex !== null ? 'primary' : 'secondary'}
                        className="flex-1 h-10 shadow-sm"
                        onClick={handleAddOrUpdateQuestion}
                        disabled={!currentQ.questionText || !currentQ.correctAnswer}
                    >
                        {editingIndex !== null ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {questions.map((q, i) => (
                    <div
                        key={i}
                        className={`group relative flex flex-col gap-2 p-4 border rounded-xl transition-all duration-200 ${editingIndex === i
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-inner'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{i + 1}</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{q.questionText}</p>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{q.explanation}</p>
                                </div>
                            </div>

                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => editQuestion(i)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteQuestion(i)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Option Chips */}
                        <div className="flex flex-wrap gap-2 ml-9">
                            {q.options && q.options.length > 0 ? (
                                q.options.filter(o => o).map((opt, optIdx) => (
                                    <span
                                        key={optIdx}
                                        className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 ${opt === q.correctAnswer
                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold'
                                            : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                                            }`}
                                    >
                                        {opt}
                                        {opt === q.correctAnswer && <Check className="w-3 h-3" />}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] px-2 py-1 rounded-md border bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    Answer: {q.correctAnswer} <Check className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-400 dark:text-slate-500 text-sm">No questions added yet.</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <Button variant="ghost" onClick={onBack}>Back to Details</Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={onSave} disabled={questions.length === 0}>
                    <Save className="w-4 h-4" /> Save {isEditing ? 'Changes' : 'Template'}
                </Button>
            </div>
        </div>
    );
};
