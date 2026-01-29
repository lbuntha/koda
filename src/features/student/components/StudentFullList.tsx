import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Skill } from '@types';
import { SkillGrid } from './SkillGrid';

interface StudentFullListProps {
    title: string;
    description?: string;
    skills: Skill[];
    onBack: () => void;
    // Props for SkillGrid
    userGoals: string[];
    skillStatuses: Record<string, any>;
    onStartPractice: (skill: Skill) => void;
    onToggleGoal: (e: React.MouseEvent, skillId: string) => void;
    icon?: any;
    colorClass?: string;
}

export const StudentFullList: React.FC<StudentFullListProps> = ({
    title,
    description,
    skills,
    onBack,
    userGoals,
    skillStatuses,
    onStartPractice,
    onToggleGoal,
    icon: Icon,
    colorClass = 'text-indigo-600'
}) => {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {Icon && <Icon className={`w-6 h-6 ${colorClass}`} />}
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 pb-24 sm:pb-8 max-w-7xl mx-auto w-full">
                <SkillGrid
                    skills={skills}
                    userGoals={userGoals}
                    skillStatuses={skillStatuses}
                    onStartPractice={onStartPractice}
                    onToggleGoal={onToggleGoal}
                />
            </div>
        </div>
    );
};
