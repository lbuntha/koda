import React, { useState, useEffect } from 'react';
import { Skill, GeneratedQuestion } from '@types';
import { Button, Badge, Card } from '@shared/components/ui';
import { Sparkles, X, Save, RefreshCw, Trash2, CheckCircle, Sliders, PlayCircle, Loader2, Edit2, Check } from 'lucide-react';
import { generateQuestionBankForSkill } from '@services/geminiService';
import { getSystemConfig, SystemConfig, DEFAULT_SYSTEM_CONFIG } from '@stores';
import { getComponentDef } from '@stores/componentStore';
import { ComponentAttributeEditor } from '@shared/components/ComponentAttributeEditor';
import { useToast } from '@shared/context/ToastContext';

interface QuizGenerationModalProps {
  template: Skill | null;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (skill: Skill) => void;
  mode?: 'CREATE' | 'EDIT';
  initialQuestions?: GeneratedQuestion[];
  userId: string;
}

export const QuizGenerationModal: React.FC<QuizGenerationModalProps> = ({
  template,
  isOpen,
  onClose,
  onPublish,
  mode = 'CREATE',
  initialQuestions = [],
  userId
}) => {
  const toast = useToast();
  const [step, setStep] = useState<'CONFIG' | 'REVIEW'>('CONFIG');
  const [count, setCount] = useState<number | string>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  // Component Overrides
  const [componentAttributes, setComponentAttributes] = useState<Record<string, any>>({});
  const [typeDef, setTypeDef] = useState<any>(null); // State for async definition
  const hasAttributes = typeDef?.attributes && typeDef.attributes.length > 0;

  // Editing State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<GeneratedQuestion>({
    questionText: '',
    options: [],
    correctAnswer: '',
    explanation: ''
  });

  // Generation Limit (Bank Size can be larger than single quiz session)
  const MAX_GENERATE_LIMIT = 50;

  useEffect(() => {
    const loadConfig = async () => {
      if (isOpen) {
        // Parallel load config and type def
        const [config, def] = await Promise.all([
          getSystemConfig(),
          template ? getComponentDef(template.questionType) : Promise.resolve(null)
        ]);

        setSystemConfig(config);
        setTypeDef(def);

        // Default to mastery count, but allow up to 50 for bank generation
        const defaultMasteryCount = config.questionsToMasterSkill || 5;
        // Initial value: Try to match mastery target, clamped between min and GEN LIMIT
        const safeCount = Math.max(config.minQuestionsPerQuiz, Math.min(defaultMasteryCount, MAX_GENERATE_LIMIT));
        setCount(safeCount);

        // If editing existing questions, skip config and go straight to review
        if (mode === 'EDIT' && initialQuestions.length > 0) {
          setGeneratedQuestions([...initialQuestions]);
          setStep('REVIEW');
        } else {
          setGeneratedQuestions([]);
          setStep('CONFIG');

          // Initializing attributes from template or defaults (using the fetched def)
          const defHasAttributes = def?.attributes && def.attributes.length > 0;

          if (template?.componentAttributes) {
            setComponentAttributes(template.componentAttributes);
          } else if (defHasAttributes) {
            // Load defaults from registry
            const defaults: Record<string, any> = {};
            def?.attributes?.forEach((attr: any) => {
              defaults[attr.name] = attr.defaultValue;
            });
            setComponentAttributes(defaults);
          } else {
            setComponentAttributes({});
          }
        }
      }
    };
    loadConfig();
  }, [isOpen]); // Missing deps but logic depends on open trigger

  if (!isOpen || !template) return null;

  const handleBlur = () => {
    let val = typeof count === 'string' ? parseInt(count) : count;
    if (isNaN(val)) val = systemConfig.minQuestionsPerQuiz;
    // Allow generating up to 50 questions for a bank
    val = Math.max(systemConfig.minQuestionsPerQuiz, Math.min(val, MAX_GENERATE_LIMIT));
    setCount(val);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let finalCount = typeof count === 'string' ? parseInt(count) : count;
      if (isNaN(finalCount)) finalCount = 5;

      // Create effective skill with overrides
      const effectiveSkill: Skill = {
        ...template,
        componentAttributes: componentAttributes
      };

      const questions = await generateQuestionBankForSkill(
        userId,
        effectiveSkill,
        finalCount,
        systemConfig.defaultAiInstruction,
        systemConfig.geminiModel,
        16000 // Allow large output for batches
      );
      setGeneratedQuestions(questions);
      setStep('REVIEW');
      setEditingIndex(null);
    } catch (e: any) {
      console.error("Quiz Generation Error:", e);
      let errorMessage = "Failed to generate quiz.";
      if (e.message) {
        errorMessage += ` Reason: ${e.message}`;
      }
      toast.error("Generation Failed", errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    const skillId = mode === 'CREATE' ? `quiz-${Date.now()}` : template.id;
    const status = mode === 'CREATE' ? 'APPROVED' : (template.moderationStatus || 'PENDING');

    const newSkill: Skill = {
      ...template,
      id: skillId,
      questionBank: generatedQuestions,
      moderationStatus: status
    };
    onPublish(newSkill);
    onClose();
    setStep('CONFIG');
    setGeneratedQuestions([]);
    setEditingIndex(null);
  };

  const removeQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditForm(JSON.parse(JSON.stringify(generatedQuestions[index])));
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...generatedQuestions];
    updated[editingIndex] = editForm;
    setGeneratedQuestions(updated);
    setEditingIndex(null);
  };

  const updateEditOption = (optIndex: number, value: string) => {
    const newOptions = [...(editForm.options || [])];
    newOptions[optIndex] = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-800">

        {/* Style injection for slider thumb to guarantee cross-browser drag support */}
        <style>{`
          .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #4f46e5;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 0 0 1px #e2e8f0, 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s;
          }
          .slider-thumb::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          .slider-thumb::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #4f46e5;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 0 0 1px #e2e8f0, 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: transform 0.1s;
          }
        `}</style>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {mode === 'CREATE' ? 'Quiz Generator' : 'Edit Question Bank'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Based on: <span className="font-medium text-indigo-600 dark:text-indigo-400">{template.skillName}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 'CONFIG' ? (
            <div className="space-y-6">

              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-lg">
                <h4 className="font-bold text-indigo-800 dark:text-indigo-300 text-sm mb-2">Template Source</h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-indigo-700/80 dark:text-indigo-300/80">
                  <div><span className="font-semibold">Subject:</span> {template.subject}</div>
                  <div><span className="font-semibold">Grade:</span> {template.grade}</div>
                  <div><span className="font-semibold">Type:</span> {template.questionType}</div>
                  <div><span className="font-semibold">Difficulty:</span> {template.difficulty}</div>
                </div>
                <p className="text-xs mt-3 italic text-indigo-600 dark:text-indigo-400">"{template.example}"</p>
              </div>

              {/* Component Attribute Editor (if applicable) */}
              {hasAttributes && typeDef && (
                <ComponentAttributeEditor
                  schema={typeDef.attributes || []}
                  values={componentAttributes}
                  onChange={(key, value) => setComponentAttributes(prev => ({ ...prev, [key]: value }))}
                />
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
                  <span>Number of Questions</span>
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                    Min: {systemConfig.minQuestionsPerQuiz}, Max: {systemConfig.maxQuestionsPerQuiz}
                  </span>
                </label>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                  {/* Mastery Target Indicator */}
                  {systemConfig.questionsToMasterSkill >= systemConfig.minQuestionsPerQuiz &&
                    systemConfig.questionsToMasterSkill <= MAX_GENERATE_LIMIT && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-300 pointer-events-none opacity-50 flex flex-col justify-end"
                        style={{
                          left: `${((systemConfig.questionsToMasterSkill - systemConfig.minQuestionsPerQuiz) / (MAX_GENERATE_LIMIT - systemConfig.minQuestionsPerQuiz)) * 72 + 10}%` // Approx positioning logic
                        }}
                      >
                      </div>
                    )}

                  <div className="flex-1">
                    <input
                      type="range"
                      min={systemConfig.minQuestionsPerQuiz}
                      max={MAX_GENERATE_LIMIT}
                      step={1}
                      value={typeof count === 'number' ? count : (parseInt(count as string) || systemConfig.minQuestionsPerQuiz)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setCount(val);
                      }}
                      className="slider-thumb w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    {count === systemConfig.questionsToMasterSkill && (
                      <div className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        <Sparkles className="w-3 h-3" /> Perfect for Mastery!
                      </div>
                    )}
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min={systemConfig.minQuestionsPerQuiz}
                      max={MAX_GENERATE_LIMIT}
                      value={count}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setCount('');
                        } else {
                          const num = parseInt(val);
                          setCount(num);
                        }
                      }}
                      onBlur={handleBlur}
                      className={`w-full text-center font-bold text-lg border bg-white dark:bg-slate-800 rounded-lg py-1 focus:ring-2 outline-none ${count === systemConfig.questionsToMasterSkill
                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 ring-emerald-100 dark:ring-emerald-900'
                        : 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700 ring-indigo-500'
                        }`}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex justify-between">
                  <span>
                    Admin defined limit: {systemConfig.minQuestionsPerQuiz}-{systemConfig.maxQuestionsPerQuiz}
                  </span>
                  {count !== systemConfig.questionsToMasterSkill && systemConfig.questionsToMasterSkill && (
                    <span className="text-slate-400">Mastery Target: {systemConfig.questionsToMasterSkill}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                This will generate fresh content using the Admin's template as a style guide.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Review Questions ({generatedQuestions.length})</h4>
                <Button size="sm" variant="ghost" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate All
                </Button>
              </div>

              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <React.Fragment key={idx}>
                    {editingIndex === idx ? (
                      // EDIT MODE
                      <div className="p-4 border-2 border-indigo-500 dark:border-indigo-600 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/20 space-y-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Editing Question {idx + 1}</span>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Question Text</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={editForm.questionText}
                            onChange={e => setEditForm({ ...editForm, questionText: e.target.value })}
                          />
                        </div>

                        {editForm.options && editForm.options.length > 0 && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Options</label>
                            <div className="grid grid-cols-2 gap-2">
                              {editForm.options.map((opt, optIdx) => (
                                <input
                                  key={optIdx}
                                  type="text"
                                  className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  value={opt}
                                  onChange={e => updateEditOption(optIdx, e.target.value)}
                                  placeholder={`Option ${optIdx + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Correct Answer</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-emerald-200 dark:border-emerald-700 rounded-lg text-sm bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              value={editForm.correctAnswer}
                              onChange={e => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Explanation</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              value={editForm.explanation}
                              onChange={e => setEditForm({ ...editForm, explanation: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingIndex(null)}>Cancel</Button>
                          <Button size="sm" onClick={saveEdit}><Check className="w-4 h-4 mr-1" /> Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      // VIEW MODE
                      <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors relative flex gap-3">
                        <div className="flex-1 pr-16">
                          <div className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1 flex gap-2">
                            <span className="text-slate-400 dark:text-slate-500 font-normal select-none">{idx + 1}.</span>
                            {q.questionText}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 inline-block px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                              Ans: {q.correctAnswer}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 inline-block px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 italic truncate max-w-[200px]">
                              {q.explanation}
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 pl-2">
                          <button
                            onClick={() => startEditing(idx)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeQuestion(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
          {step === 'CONFIG' ? (
            <>
              <div className="text-xs text-slate-400 dark:text-slate-500">Ready to build?</div>
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-32">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Generate</>}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep('CONFIG')} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                {mode === 'CREATE' ? 'Back' : 'Clear & Regenerate'}
              </Button>
              <Button onClick={handlePublish} disabled={generatedQuestions.length === 0 || editingIndex !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                <Save className="w-4 h-4" /> {mode === 'CREATE' ? 'Publish to Curriculum' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
