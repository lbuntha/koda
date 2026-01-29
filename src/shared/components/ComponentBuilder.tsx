// ComponentBuilder - Refactored component for creating/editing skills
import React, { useState, useEffect } from 'react';
import { GeneratedQuestion, Skill, Difficulty } from '@types';
import { Card, Button } from '@shared/components/ui';
import { PenTool, X } from 'lucide-react';
import { getSystemConfig, SystemConfig, DEFAULT_SYSTEM_CONFIG } from '@stores';
import { SkillMetadataForm, SkillMetadata } from './SkillMetadataForm';
import { QuestionEditor } from './QuestionEditor';

interface ComponentBuilderProps {
  onSave: (skill: Skill) => void;
  initialSection?: string;
  isLibraryTemplate?: boolean;
  initialData?: Skill | null;
  onCancel?: () => void;
}

export const ComponentBuilder: React.FC<ComponentBuilderProps> = ({
  onSave,
  initialSection = 'Custom Components',
  isLibraryTemplate = false,
  initialData,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [meta, setMeta] = useState<SkillMetadata>({
    grade: initialData?.grade || 'Grade 1',
    subject: initialData?.subject || 'Math',
    skillName: initialData?.skillName || '',
    example: initialData?.example || '',
    layout: (initialData?.customLayoutId || 'default'),
    questionType: initialData?.questionType || 'Multiple Choice',
    tags: initialData?.tags || [],
    masteryRequirements: initialData?.masteryRequirements,
    accessLevel: initialData?.accessLevel || 'free'
  });

  const [questions, setQuestions] = useState<GeneratedQuestion[]>(initialData?.questionBank || []);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getSystemConfig();
      setSystemConfig(config);
    };
    loadConfig();
  }, []);

  const saveComponent = () => {
    if (questions.length === 0) return;

    const newSkill: Skill = {
      id: initialData?.id || (isLibraryTemplate ? `lib-tmpl-${Date.now()}` : `custom-${Date.now()}`),
      grade: meta.grade,
      subject: meta.subject,
      section: initialSection,
      skillName: meta.skillName,
      example: meta.example,
      questionType: meta.questionType,
      difficulty: initialData?.difficulty || Difficulty.MEDIUM,
      moderationStatus: 'APPROVED',
      customLayoutId: meta.layout as any,
      questionBank: questions,
      tags: meta.tags,
      ...(meta.masteryRequirements ? { masteryRequirements: meta.masteryRequirements } : {}),
      accessLevel: meta.accessLevel
    };

    onSave(newSkill);
    if (!initialData) {
      setStep(1);
      setMeta({
        grade: 'Grade 1',
        subject: 'Math',
        skillName: '',
        example: '',
        layout: 'default',
        questionType: 'Multiple Choice',
        tags: [],
        accessLevel: 'free'
      });
      setQuestions([]);
    }
  };

  return (
    <Card className="h-fit border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-indigo-700 dark:text-indigo-400 border-b border-indigo-50 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5" />
          <h2 className="font-semibold">
            {initialData ? 'Edit Component Template' : (isLibraryTemplate ? 'New Library Template' : 'Custom Component Builder')}
          </h2>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Step 1: Metadata Form */}
      {step === 1 && (
        <SkillMetadataForm
          meta={meta}
          onMetaChange={setMeta}
          systemConfig={systemConfig}
          onNext={() => setStep(2)}
          isEditing={!!initialData}
        />
      )}

      {/* Step 2: Question Editor */}
      {step === 2 && (
        <QuestionEditor
          questions={questions}
          onQuestionsChange={setQuestions}
          layout={meta.layout}
          systemConfig={systemConfig}
          onBack={() => setStep(1)}
          onSave={saveComponent}
          isEditing={!!initialData}
        />
      )}
    </Card>
  );
};
