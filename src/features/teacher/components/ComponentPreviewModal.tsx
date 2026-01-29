import React, { useState, useEffect } from 'react';
import { Skill, GeneratedQuestion } from '@types';
import { Button, Badge } from '@shared/components/ui';
import { Sparkles, X, Eye, HelpCircle, Copy } from 'lucide-react';
import { getSkillRenderer } from '@shared/components/SkillRenderers';

export const ComponentPreviewModal = ({
  component,
  isOpen,
  onClose,
  onAdd
}: {
  component: Skill | null,
  isOpen: boolean,
  onClose: () => void,
  onAdd?: (s: Skill) => void
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentQIndex(0);
      setShowAnswer(false);
    }
  }, [isOpen, component]);

  if (!isOpen || !component || !component.questionBank) return null;

  const question: GeneratedQuestion = component.questionBank[currentQIndex];
  const totalQuestions = component.questionBank.length;

  const handleNext = () => {
    setCurrentQIndex((prev) => (prev + 1) % totalQuestions);
    setShowAnswer(false);
  };

  // Resolve Renderer
  const Renderer = getSkillRenderer(component.customLayoutId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {component.skillName}
              <Badge color="green">Component</Badge>
            </h3>
            <p className="text-sm text-slate-500">{component.grade} • {component.subject}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Component Description</h4>
            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
              {component.example}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Student View Preview
                <span className="text-xs font-normal text-slate-400 ml-1">(Example {currentQIndex + 1} of {totalQuestions})</span>
              </h4>
              <button onClick={handleNext} className="text-xs text-indigo-600 hover:underline">
                Try next example
              </button>
            </div>

            {/* Simulated Question Card */}
            <div className="bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-indigo-600" />
              </div>

              {/* Using Dynamic Renderer in Preview Mode (simulated non-interactive) */}
              <div className="relative z-10">
                <Renderer
                  question={question}
                  onAnswer={() => { }} // No-op in preview
                  isSubmitted={false}
                  selectedAnswer=""
                />
              </div>

              <div className="flex items-center gap-3 relative z-10 mt-6 pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setShowAnswer(!showAnswer)}>
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Button>

                {showAnswer && (
                  <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-800 flex gap-2 animate-in fade-in slide-in-from-left-2">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-bold">Correct: {question.correctAnswer}</span>
                      <p className="mt-1">{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {onAdd && (
            <Button onClick={() => { onAdd(component); onClose(); }}>
              <Copy className="w-4 h-4" /> Add Component
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};