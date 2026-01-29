import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button, Card } from '@shared/components/ui';
import { SystemConfig } from '@stores';
import { generateCurriculumSkills } from '@services/geminiService';
import { Skill } from '@types';
import { getAllComponents } from '@stores/componentStore';
import { QuestionTypeDef } from '@services/questionTypeRegistry';
import { useToast } from '@shared/context/ToastContext';

interface AIGeneratorProps {
    systemConfig: SystemConfig;
    onGenerateSuccess: (skills: Skill[]) => void;
    onLoadingChange: (isLoading: boolean) => void;
    userId: string;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ systemConfig, onGenerateSuccess, onLoadingChange, userId }) => {
    const toast = useToast();
    const [grade, setGrade] = useState(systemConfig.grades[0]?.id || 'Grade 1');
    const [subject, setSubject] = useState(systemConfig.subjects[0] || 'Math');
    const [topic, setTopic] = useState('');
    const [sectionInput, setSectionInput] = useState('');
    const [skillCount, setSkillCount] = useState<number>(1);
    const [customInstruction, setCustomInstruction] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Dynamic Component List
    const [availableTypes, setAvailableTypes] = useState<QuestionTypeDef[]>([]);

    React.useEffect(() => {
        const loadTypes = async () => {
            const types = await getAllComponents();
            setAvailableTypes(types);
        };
        loadTypes();
    }, []);

    const handleGenerate = async () => {
        if (!topic) return;
        setIsLoading(true);
        onLoadingChange(true);
        try {
            const newSkills = await generateCurriculumSkills(
                userId,
                grade,
                subject,
                topic,
                skillCount,
                sectionInput,
                customInstruction,
                questionType,
                systemConfig.geminiModel,
                systemConfig.tokenUsage?.teacher || 2048
            );
            onGenerateSuccess(newSkills);
            setTopic('');
            setCustomInstruction('');
        } catch (error: any) {
            console.error("Generation Error:", error);
            toast.error("Generation Failed", error.message || "Ensure API Key is valid and try again.");
        } finally {
            setIsLoading(false);
            onLoadingChange(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/30 overflow-hidden shadow-lg shadow-indigo-100/20 dark:shadow-none">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-bold text-lg">AI Curriculum Generator</h2>
                </div>
                <p className="text-indigo-100 text-sm">Describe what you want to teach, and we'll build the module.</p>
            </div>

            <div className="p-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Topic / Focus</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Fractions, Photosynthesis, Ancient Rome..."
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all p-3 pl-4 text-base font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Grade</label>
                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 text-sm font-medium"
                        >
                            {systemConfig.grades.map(g => (
                                <option key={g.id} value={g.id}>{g.label || g.id}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 text-sm font-medium"
                        >
                            {systemConfig.subjects.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Question Type</label>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 text-sm font-medium"
                        >
                            <option value="">Auto (AI Decides)</option>
                            {availableTypes.map((qType) => (
                                <option key={qType.id} value={qType.id}>{qType.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Count</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={skillCount}
                            onChange={(e) => setSkillCount(parseInt(e.target.value) || 1)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 text-sm font-medium"
                        />
                    </div>
                </div>


                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Unit Name <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
                    <input
                        type="text"
                        value={sectionInput}
                        onChange={(e) => setSectionInput(e.target.value)}
                        placeholder="e.g. Unit 1: Foundations"
                        className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 ml-1">Configuration <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
                    <textarea
                        value={customInstruction}
                        onChange={(e) => setCustomInstruction(e.target.value)}
                        placeholder="Any specific requests? e.g. 'Focus on word problems' or 'Use pirate theme'"
                        className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all p-3 text-sm h-24 resize-none"
                    />
                </div>

                {showConfirm ? (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-in zoom-in-95 duration-200">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">Ready to Generate?</h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-3 leading-relaxed">
                            Creating <strong>{skillCount} skill(s)</strong> about "{topic}".
                            <br />
                            <span className="opacity-70">Estimated Cost: ~{skillCount * 500} Tokens</span>
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="flex-1 text-slate-500 hover:bg-white" onClick={() => setShowConfirm(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-300/50" onClick={handleGenerate} disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {isLoading ? 'Building...' : 'Launch AI'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={() => setShowConfirm(true)}
                        disabled={isLoading || !topic}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" /> Generate Curriculum
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};
