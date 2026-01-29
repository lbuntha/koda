// SkillMetadataForm - Step 1 of ComponentBuilder
import React from 'react';
import { Plus, Trash2, Tag, X } from 'lucide-react';
import { Button, Badge } from '@shared/components/ui';
import { SystemConfig } from '@stores';
import { REGISTERED_QUESTION_TYPES, getQuestionTypeDef } from '@services/questionTypeRegistry';
import { COMPONENT_LAYOUTS } from '@services/componentRegistry';

export interface SkillMetadata {
    grade: string;
    subject: string;
    skillName: string;
    example: string;
    layout: string;
    questionType: string;
    tags: string[];
    masteryRequirements?: {
        type: 'QUESTIONS' | 'SCORE';
        value: number;
        minAccuracy?: number;
        isPercentage?: boolean;
    };
    accessLevel: 'free' | 'premium';
}

interface SkillMetadataFormProps {
    meta: SkillMetadata;
    onMetaChange: (meta: SkillMetadata) => void;
    systemConfig: SystemConfig;
    onNext: () => void;
    isEditing: boolean;
}

export const SkillMetadataForm: React.FC<SkillMetadataFormProps> = ({
    meta,
    onMetaChange,
    systemConfig,
    onNext,
    isEditing
}) => {
    const [tagInput, setTagInput] = React.useState('');

    const handleAddTag = () => {
        if (tagInput.trim() && !meta.tags.includes(tagInput.trim())) {
            onMetaChange({ ...meta, tags: [...meta.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onMetaChange({ ...meta, tags: meta.tags.filter(t => t !== tagToRemove) });
    };

    const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        const def = getQuestionTypeDef(newType);
        const newLayout = def.defaultLayoutId;
        onMetaChange({ ...meta, questionType: newType, layout: newLayout });
    };

    return (
        <div className="space-y-4">
            {/* Grade & Subject */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Grade</label>
                    <select
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={meta.grade}
                        onChange={e => onMetaChange({ ...meta, grade: e.target.value })}
                    >
                        {systemConfig.grades.map(g => <option key={g.id} value={g.id}>{g.label || g.id}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Subject</label>
                    <select
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={meta.subject}
                        onChange={e => onMetaChange({ ...meta, subject: e.target.value })}
                    >
                        {systemConfig.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Skill Name */}
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Skill Name</label>
                <input
                    type="text"
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Advanced Fractions"
                    value={meta.skillName}
                    onChange={e => onMetaChange({ ...meta, skillName: e.target.value })}
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description / Example</label>
                <input
                    type="text"
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Brief description for students"
                    value={meta.example}
                    onChange={e => onMetaChange({ ...meta, example: e.target.value })}
                />
            </div>

            {/* Tags */}
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tags & Keywords</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Add tags (e.g. Fractions, Algebra, Geometry)"
                    />
                    <Button size="sm" onClick={handleAddTag} disabled={!tagInput.trim()} type="button">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                {meta.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {meta.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium">
                                <Tag className="w-3 h-3 text-slate-400" />
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-rose-500 ml-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-400 italic mb-2">No tags added yet. Tags help find content easier.</p>
                )}
            </div>

            {/* Access Level & Question Type */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Access Level</label>
                    <select
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={meta.accessLevel || 'free'}
                        onChange={e => onMetaChange({ ...meta, accessLevel: e.target.value as 'free' | 'premium' })}
                    >
                        <option value="free">Free</option>
                        <option value="premium">Premium (Paid Only)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Question Type</label>
                    <select
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={meta.questionType}
                        onChange={handleQuestionTypeChange}
                    >
                        {systemConfig.questionTypes.map(typeId => {
                            // Find definition to get label, fallback to ID if not found
                            const def = REGISTERED_QUESTION_TYPES.find(d => d.id === typeId);
                            return <option key={typeId} value={typeId}>{def?.label || typeId}</option>;
                        })}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Layout Template (Engine)</label>
                    <select
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={meta.layout}
                        onChange={e => onMetaChange({ ...meta, layout: e.target.value })}
                    >
                        {COMPONENT_LAYOUTS.map(layout => (
                            <option key={layout.id} value={layout.id}>{layout.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                {COMPONENT_LAYOUTS.find(l => l.id === meta.layout)?.description || 'Select a layout...'}
            </div>

            {/* Mastery Override Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mastery Settings</label>
                    <Badge color={meta.masteryRequirements ? 'indigo' : 'gray'} className="text-[10px]">
                        {meta.masteryRequirements ? 'Custom Rules Active' : 'Using System Default'}
                    </Badge>
                </div>

                {!meta.masteryRequirements ? (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Default: <strong className="text-slate-700 dark:text-slate-300">{systemConfig.defaultMasteryRequirements?.value} {systemConfig.defaultMasteryRequirements?.type}</strong>
                            {systemConfig.defaultMasteryRequirements?.minAccuracy ? ` w/ ${systemConfig.defaultMasteryRequirements.minAccuracy}% Accuracy` : ''}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => onMetaChange({ ...meta, masteryRequirements: { type: 'QUESTIONS', value: 10, minAccuracy: 80 } })} className="h-7 text-xs">
                            Override
                        </Button>
                    </div>
                ) : (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Custom Mastery Rules</span>
                            <Button size="sm" variant="ghost" onClick={() => onMetaChange({ ...meta, masteryRequirements: undefined })} className="h-6 w-6 p-0 text-rose-400 hover:text-rose-600">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Type</label>
                                <select
                                    className="w-full p-1.5 border border-slate-200 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={meta.masteryRequirements.type}
                                    onChange={e => onMetaChange({
                                        ...meta,
                                        masteryRequirements: { ...meta.masteryRequirements!, type: e.target.value as any }
                                    })}
                                >
                                    <option value="QUESTIONS">Questions</option>
                                    <option value="SCORE">Score (XP)</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">Target {meta.masteryRequirements.isPercentage ? '(%)' : ''}</label>
                                    {meta.masteryRequirements.type === 'QUESTIONS' && (
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 dark:border-slate-600 w-3 h-3 text-indigo-600 focus:ring-0 bg-white dark:bg-slate-700"
                                                checked={meta.masteryRequirements.isPercentage || false}
                                                onChange={e => onMetaChange({
                                                    ...meta,
                                                    masteryRequirements: { ...meta.masteryRequirements!, isPercentage: e.target.checked }
                                                })}
                                            />
                                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">% of Bank</span>
                                        </label>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    className="w-full p-1.5 border border-slate-200 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={meta.masteryRequirements.value}
                                    max={meta.masteryRequirements.isPercentage ? 100 : undefined}
                                    onChange={e => onMetaChange({
                                        ...meta,
                                        masteryRequirements: { ...meta.masteryRequirements!, value: Number(e.target.value) }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Min Acc (%)</label>
                                <input
                                    type="number"
                                    className="w-full p-1.5 border border-slate-200 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={meta.masteryRequirements.minAccuracy || 0}
                                    onChange={e => onMetaChange({
                                        ...meta,
                                        masteryRequirements: { ...meta.masteryRequirements!, minAccuracy: Number(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Button className="w-full mt-4" disabled={!meta.skillName} onClick={onNext}>
                Next: {isEditing ? 'Edit Questions' : 'Add Questions'}
            </Button>
        </div>
    );
};
