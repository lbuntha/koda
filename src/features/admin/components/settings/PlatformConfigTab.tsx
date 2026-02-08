// PlatformConfigTab - Grades, Subjects, Quiz Limits, and AI Configuration
import React, { useState } from 'react';
import {
    Settings, Cpu, Plus, X, Image, Palette, Grid3X3, ListChecks,
    // Subject Icons
    Calculator, Sigma, Ruler, Pi, Divide,
    FlaskConical, Microscope, Atom, TestTube2, Dna,
    BookOpen, BookText, Languages, PenLine, ScrollText,
    Landmark, Clock, Globe, Map, Compass,
    Palette as PaletteIcon, Brush, Paintbrush,
    Music, Music2, Headphones,
    Code, Binary, Laptop, Terminal,
    Dumbbell, Trophy, Medal, Activity, Heart,
    Leaf, Star, Sparkles, Lightbulb, Brain, GraduationCap,
    type LucideIcon
} from 'lucide-react';
import { SystemConfig, SubjectConfig, DEFAULT_SUBJECT_CONFIGS } from '@stores';
import { Card, Button } from '@shared/components/ui';
import { useToast } from '@shared/context';

interface PlatformConfigTabProps {
    config: SystemConfig;
    onConfigUpdate: (key: keyof SystemConfig, value: any) => void;
    onAddOption: (type: 'grades' | 'subjects', value: string) => Promise<void>;
    onRemoveOption: (type: 'grades' | 'subjects', value: string) => void;
}

// Available colors for subjects
const SUBJECT_COLORS = [
    { name: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600', dark: 'dark:bg-indigo-900/30 dark:text-indigo-400' },
    { name: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600', dark: 'dark:bg-emerald-900/30 dark:text-emerald-400' },
    { name: 'amber', bg: 'bg-amber-100', text: 'text-amber-600', dark: 'dark:bg-amber-900/30 dark:text-amber-400' },
    { name: 'rose', bg: 'bg-rose-100', text: 'text-rose-600', dark: 'dark:bg-rose-900/30 dark:text-rose-400' },
    { name: 'sky', bg: 'bg-sky-100', text: 'text-sky-600', dark: 'dark:bg-sky-900/30 dark:text-sky-400' },
    { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', dark: 'dark:bg-purple-900/30 dark:text-purple-400' },
    { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-600', dark: 'dark:bg-orange-900/30 dark:text-orange-400' },
    { name: 'teal', bg: 'bg-teal-100', text: 'text-teal-600', dark: 'dark:bg-teal-900/30 dark:text-teal-400' },
    { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-600', dark: 'dark:bg-pink-900/30 dark:text-pink-400' },
];

// SVG Icon collection for subjects (Lucide icons)
const SUBJECT_ICONS: { name: string; icon: LucideIcon }[] = [
    // Math
    { name: 'Calculator', icon: Calculator },
    { name: 'Sigma', icon: Sigma },
    { name: 'Ruler', icon: Ruler },
    { name: 'Pi', icon: Pi },
    { name: 'Divide', icon: Divide },
    // Science
    { name: 'FlaskConical', icon: FlaskConical },
    { name: 'Microscope', icon: Microscope },
    { name: 'Atom', icon: Atom },
    { name: 'TestTube2', icon: TestTube2 },
    { name: 'Dna', icon: Dna },
    // Language/Reading
    { name: 'BookOpen', icon: BookOpen },
    { name: 'BookText', icon: BookText },
    { name: 'Languages', icon: Languages },
    { name: 'PenLine', icon: PenLine },
    { name: 'ScrollText', icon: ScrollText },
    // History/Social
    { name: 'Landmark', icon: Landmark },
    { name: 'Clock', icon: Clock },
    { name: 'Globe', icon: Globe },
    { name: 'Map', icon: Map },
    { name: 'Compass', icon: Compass },
    // Arts
    { name: 'Palette', icon: PaletteIcon },
    { name: 'Brush', icon: Brush },
    { name: 'Paintbrush', icon: Paintbrush },
    { name: 'Music', icon: Music },
    { name: 'Music2', icon: Music2 },
    // Technology
    { name: 'Code', icon: Code },
    { name: 'Binary', icon: Binary },
    { name: 'Laptop', icon: Laptop },
    { name: 'Terminal', icon: Terminal },
    // Physical/Health
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Trophy', icon: Trophy },
    { name: 'Heart', icon: Heart },
    { name: 'Activity', icon: Activity },
    // Other
    { name: 'Leaf', icon: Leaf },
    { name: 'Star', icon: Star },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Brain', icon: Brain },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'GraduationCap', icon: GraduationCap },
];

// Helper to get icon component by name
const getIconByName = (iconName: string): LucideIcon => {
    const found = SUBJECT_ICONS.find(i => i.name === iconName);
    return found?.icon || BookOpen;
};

export const PlatformConfigTab: React.FC<PlatformConfigTabProps> = ({
    config,
    onConfigUpdate,
    onAddOption,
    onRemoveOption
}) => {
    const [newGrade, setNewGrade] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [editingSubject, setEditingSubject] = useState<string | null>(null);
    const [editingGrade, setEditingGrade] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const toast = useToast();

    // Get subject configs, falling back to defaults
    const subjectConfigs = config.subjectConfigs || DEFAULT_SUBJECT_CONFIGS;

    const getSubjectConfig = (subjectName: string): SubjectConfig => {
        const found = subjectConfigs.find(c => c.name === subjectName);
        if (found) return found;
        // Create default config for unknown subjects
        return { name: subjectName, icon: 'BookOpen', color: 'slate' };
    };

    const updateSubjectConfig = (subjectName: string, updates: Partial<SubjectConfig>) => {
        const currentConfigs = [...subjectConfigs];
        const index = currentConfigs.findIndex(c => c.name === subjectName);

        if (index >= 0) {
            currentConfigs[index] = { ...currentConfigs[index], ...updates };
        } else {
            currentConfigs.push({ name: subjectName, icon: 'BookOpen', color: 'slate', ...updates });
        }

        onConfigUpdate('subjectConfigs', currentConfigs);
        toast.success('Subject updated', `"${subjectName}" configuration saved`);
    };

    const updateGradeConfig = (gradeId: string, updates: any) => {
        const currentGrades = [...config.grades];
        const index = currentGrades.findIndex(g => g.id === gradeId);

        if (index >= 0) {
            currentGrades[index] = { ...currentGrades[index], ...updates };
            onConfigUpdate('grades', currentGrades);
        }
    };

    const handleAddGrade = async () => {
        if (!newGrade.trim()) return;
        await onAddOption('grades', newGrade.trim());
        setNewGrade('');
        toast.success('Grade added', `"${newGrade.trim()}" has been added`);
    };

    const handleAddSubject = async () => {
        if (!newSubject.trim()) return;
        await onAddOption('subjects', newSubject.trim());
        // subjectConfigs update is now handled in the store to prevent race conditions

        setNewSubject('');
        toast.success('Subject added', `"${newSubject.trim()}" has been added`);
    };

    const handleRemoveSubject = (subject: string) => {
        onRemoveOption('subjects', subject);
        // Also remove from subjectConfigs
        onConfigUpdate('subjectConfigs', subjectConfigs.filter(c => c.name !== subject));
    };

    const getColorClasses = (colorName: string) => {
        const color = SUBJECT_COLORS.find(c => c.name === colorName);
        return color || SUBJECT_COLORS[0];
    };

    return (
        <div className="space-y-6">
            {/* Grades & Subjects */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Platform Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Grade Levels */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Grade Levels</h4>
                        <div className="flex gap-2 mb-3">
                            <input
                                className="flex-1 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="Add Grade (e.g. Grade 7)"
                                value={newGrade}
                                onChange={e => setNewGrade(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddGrade()}
                            />
                            <Button size="sm" onClick={handleAddGrade} disabled={!newGrade}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {config.grades.map(g => (
                                <span key={g.id} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                    {g.label || g.id}
                                    <button onClick={() => onRemoveOption('grades', g.id)} className="hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subjects */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Subjects</h4>
                        <div className="flex gap-2 mb-3">
                            <input
                                className="flex-1 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="Add Subject (e.g. Art)"
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                            />
                            <Button size="sm" onClick={handleAddSubject} disabled={!newSubject}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {config.subjects.map(s => {
                                const subConfig = getSubjectConfig(s);
                                const colorClasses = getColorClasses(subConfig.color);

                                return (
                                    <span
                                        key={s}
                                        className={`${colorClasses.bg} ${colorClasses.text} ${colorClasses.dark} px-2 py-1 rounded text-xs border border-transparent flex items-center gap-1 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-indigo-400 transition-all`}
                                        onClick={() => setEditingSubject(editingSubject === s ? null : s)}
                                    >
                                        {(() => { const Icon = getIconByName(subConfig.icon); return <Icon className="w-3.5 h-3.5" />; })()}
                                        {s}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveSubject(s); }}
                                            className="hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Grade Customization */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Grid3X3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Grade Customization</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Customize how each grade level appears. Set labels, colors, and descriptions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.grades.map(grade => {
                        const colorClasses = getColorClasses(grade.color);
                        const isEditing = editingGrade === grade.id;

                        return (
                            <div
                                key={grade.id}
                                className={`relative rounded-xl border-2 transition-all ${isEditing
                                    ? 'border-emerald-400 dark:border-emerald-500 shadow-lg'
                                    : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {/* Preview */}
                                <div
                                    className={`${colorClasses.bg} ${colorClasses.dark} rounded-t-lg p-4 cursor-pointer`}
                                    onClick={() => setEditingGrade(isEditing ? null : grade.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center shadow-sm ${colorClasses.text} text-xl font-bold`}>
                                            {grade.shortLabel}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${colorClasses.text}`}>{grade.label}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{grade.category || 'No Category'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Panel */}
                                {isEditing && (
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-b-lg border-t border-slate-100 dark:border-slate-700 space-y-3">
                                        {/* Labels */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Full Label</label>
                                                <input
                                                    type="text"
                                                    value={grade.label}
                                                    onChange={(e) => updateGradeConfig(grade.id, { label: e.target.value })}
                                                    className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Short (1-2 chars)</label>
                                                <input
                                                    type="text"
                                                    maxLength={3}
                                                    value={grade.shortLabel}
                                                    onChange={(e) => updateGradeConfig(grade.id, { shortLabel: e.target.value })}
                                                    className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Category</label>
                                            <select
                                                value={grade.category || 'Other'}
                                                onChange={(e) => updateGradeConfig(grade.id, { category: e.target.value })}
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-900"
                                            >
                                                <option value="Early Childhood">Early Childhood</option>
                                                <option value="Elementary">Elementary</option>
                                                <option value="Middle School">Middle School</option>
                                                <option value="High School">High School</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Description</label>
                                            <textarea
                                                value={grade.description || ''}
                                                onChange={(e) => updateGradeConfig(grade.id, { description: e.target.value })}
                                                rows={2}
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-900 resize-none"
                                            />
                                        </div>

                                        {/* Color Picker */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1">
                                                <Palette className="w-3 h-3" /> Color
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {SUBJECT_COLORS.map(color => (
                                                    <button
                                                        key={color.name}
                                                        onClick={() => updateGradeConfig(grade.id, { color: color.name })}
                                                        className={`w-6 h-6 rounded-md ${color.bg} transition-all ${grade.color === color.name
                                                            ? 'ring-2 ring-offset-1 ring-emerald-400'
                                                            : 'hover:scale-110'
                                                            }`}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Subject Selection */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">
                                                Allowed Subjects
                                            </label>
                                            <div className="flex flex-wrap gap-1.5 border border-slate-100 dark:border-slate-700/50 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
                                                {config.subjects.map(s => {
                                                    const isActive = grade.subjects?.includes(s);
                                                    return (
                                                        <button
                                                            key={s}
                                                            onClick={() => {
                                                                const current = grade.subjects || [];
                                                                const updated = isActive
                                                                    ? current.filter(sub => sub !== s)
                                                                    : [...current, s];
                                                                updateGradeConfig(grade.id, { subjects: updated });
                                                            }}
                                                            className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${isActive
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setEditingGrade(null)}
                                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Subject Customization */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Subject Customization</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Customize how each subject appears in the student app. Add icons, images, and colors.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.subjects.map(subject => {
                        const subConfig = getSubjectConfig(subject);
                        const colorClasses = getColorClasses(subConfig.color);
                        const isEditing = editingSubject === subject;

                        return (
                            <div
                                key={subject}
                                className={`relative rounded-xl border-2 transition-all ${isEditing
                                    ? 'border-indigo-400 dark:border-indigo-500 shadow-lg'
                                    : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {/* Preview */}
                                <div
                                    className={`${colorClasses.bg} ${colorClasses.dark} rounded-t-lg p-4 cursor-pointer`}
                                    onClick={() => setEditingSubject(isEditing ? null : subject)}
                                >
                                    <div className="flex items-center gap-3">
                                        {subConfig.imageUrl ? (
                                            <img
                                                src={subConfig.imageUrl}
                                                alt={subject}
                                                className="w-14 h-14 rounded-xl object-cover shadow-md"
                                            />
                                        ) : (
                                            <div className={`w-14 h-14 rounded-xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center shadow-sm ${colorClasses.text}`}>
                                                {(() => { const Icon = getIconByName(subConfig.icon); return <Icon className="w-7 h-7" />; })()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className={`font-bold ${colorClasses.text}`}>{subject}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Click to edit</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Panel */}
                                {isEditing && (
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-b-lg border-t border-slate-100 dark:border-slate-700 space-y-3">
                                        {/* Icon Picker */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1">
                                                <Grid3X3 className="w-3 h-3" /> Icon
                                            </label>
                                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                                {SUBJECT_ICONS.map(({ name, icon: IconComp }) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => updateSubjectConfig(subject, { icon: name })}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${subConfig.icon === name
                                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-400 text-indigo-600 dark:text-indigo-400'
                                                            : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                                                            }`}
                                                        title={name}
                                                    >
                                                        <IconComp className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Picker */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1">
                                                <Palette className="w-3 h-3" /> Color
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {SUBJECT_COLORS.map(color => (
                                                    <button
                                                        key={color.name}
                                                        onClick={() => updateSubjectConfig(subject, { color: color.name })}
                                                        className={`w-8 h-8 rounded-lg ${color.bg} transition-all ${subConfig.color === color.name
                                                            ? 'ring-2 ring-offset-1 ring-indigo-400'
                                                            : 'hover:scale-110'
                                                            }`}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Image URL */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1">
                                                <Image className="w-3 h-3" /> Custom Image URL
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.png"
                                                value={subConfig.imageUrl || ''}
                                                onChange={(e) => updateSubjectConfig(subject, { imageUrl: e.target.value || undefined })}
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Optional. Leave empty to use emoji instead.</p>
                                        </div>

                                        <button
                                            onClick={() => setEditingSubject(null)}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Question Types Configuration */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Question Types</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Manage the list of available question types.
                </p>

                <div className="flex gap-2 mb-4">
                    <input
                        className="flex-1 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Add Question Type ID (e.g. 'Matching')"
                        id="new-qtype-input" // distinct ID
                        onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value;
                                if (val && !config.questionTypes.includes(val)) {
                                    onConfigUpdate('questionTypes', [...(config.questionTypes || []), val.trim()]);
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {(config.questionTypes || []).map(qt => (
                        <span key={qt} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                            {qt}
                            <button
                                onClick={() => onConfigUpdate('questionTypes', config.questionTypes.filter(t => t !== qt))}
                                className="hover:text-rose-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </Card>

            {/* Quiz Limits */}
            <Card>
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Quiz Limits</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Min Questions</label>
                        <input
                            type="number"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={config.minQuestionsPerQuiz}
                            onChange={e => onConfigUpdate('minQuestionsPerQuiz', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Max Questions</label>
                        <input
                            type="number"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            value={config.maxQuestionsPerQuiz}
                            onChange={e => onConfigUpdate('maxQuestionsPerQuiz', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </Card>

            {/* AI Configuration */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Configuration</h3>
                </div>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-500">Gemini API Key</label>
                        {process.env.GEMINI_API_KEY && !config.apiKey && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                                Active from .env
                            </span>
                        )}
                        {config.apiKey && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium border border-indigo-200">
                                Overridden by Settings
                            </span>
                        )}
                    </div>
                    <input
                        type="password"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder={process.env.GEMINI_API_KEY ? "Using .env key... (Enter to override)" : "Enter API Key here..."}
                        value={config.apiKey || ''}
                        onChange={e => onConfigUpdate('apiKey', e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                        Optional: Provide your key here if not set in environment variables.
                    </p>
                </div>

                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Gemini Model</label>
                    <select
                        key="gemini-model-select-v2"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        value={config.geminiModel || 'gemini-pro'}
                        onChange={e => onConfigUpdate('geminiModel', e.target.value)}
                    >
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Stable)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest)</option>
                        <option value="gemini-3-flash-preview">Gemini 3.0 Flash (Preview)</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                        Select the AI model used for generating quizzes and content.
                    </p>
                </div>

                <div className="mt-4">
                    <label className="text-xs text-slate-500 block mb-2 font-bold uppercase">Token Usage Limits per Request</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Teacher / Admin</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                value={config.tokenUsage?.teacher || 2048}
                                onChange={e => onConfigUpdate('tokenUsage', { ...config.tokenUsage, teacher: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Parent</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                value={config.tokenUsage?.parent || 1024}
                                onChange={e => onConfigUpdate('tokenUsage', { ...config.tokenUsage, parent: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Student</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                value={config.tokenUsage?.student || 1024}
                                onChange={e => onConfigUpdate('tokenUsage', { ...config.tokenUsage, student: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Kid</label>
                            <input
                                type="number"
                                className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                value={config.tokenUsage?.kid || 512}
                                onChange={e => onConfigUpdate('tokenUsage', { ...config.tokenUsage, kid: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Maximum tokens (input + output) allowed per AI request for each user role.
                    </p>
                </div>
            </Card>
        </div>
    );
};
