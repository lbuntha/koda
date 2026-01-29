
import React from 'react';
import { Skill, Difficulty, SkillRank } from '@types';
import { Badge, Button } from '@shared/components/ui';
import { Target, Play, CheckCircle, ChevronRight, Sparkles, Star, Lock } from 'lucide-react';
import { useAuth } from '@auth';

interface SkillGridProps {
    skills: Skill[];
    userGoals: string[];
    skillStatuses: Record<string, any>;
    onStartPractice: (skill: Skill) => void;
    onToggleGoal: (e: React.MouseEvent, skillId: string) => void;
}

// Category colors for mobile list
const categoryColors = [
    { bg: 'bg-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    { bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-rose-500', light: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
    { bg: 'bg-sky-500', light: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
    { bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
];

export const SkillGrid: React.FC<SkillGridProps> = ({
    skills,
    userGoals,
    skillStatuses,
    onStartPractice,
    onToggleGoal
}) => {
    const { user } = useAuth();

    // Desktop Card Render
    const renderDesktopCard = (skill: Skill, index: number) => {
        const isPremium = skill.accessLevel === 'premium';
        const isLocked = isPremium && user?.subscriptionTier === 'free';

        const status = skillStatuses[skill.id] || {
            mastered: false,
            progress: 0,
            currentPoints: 0,
            rank: { name: 'Novice', color: 'bg-slate-100 text-slate-500', icon: '🌱' }
        };
        const isGoal = userGoals.includes(skill.id);
        const isMastered = status.mastered;

        const difficultyColors = {
            [Difficulty.EASY]: 'from-emerald-400 to-teal-500 text-white',
            [Difficulty.MEDIUM]: 'from-amber-400 to-orange-500 text-white',
            [Difficulty.HARD]: 'from-rose-400 to-pink-500 text-white'
        };

        return (
            <div
                key={skill.id}
                className={`
                    group relative bg-white dark:bg-slate-900 rounded-xl 
                    border transition-all duration-300 overflow-hidden flex flex-col justify-between
                    ${isLocked ? 'opacity-80 grayscale-[0.5] hover:grayscale-0' : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl'}
                    ${isMastered
                        ? 'border-emerald-200 dark:border-emerald-500/30'
                        : isGoal
                            ? 'border-amber-200 dark:border-amber-500/30 ring-1 ring-amber-200 dark:ring-amber-500/30'
                            : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'}
                `}
                onClick={() => !isLocked && onStartPractice(skill)}
            >
                {isLocked && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-white p-1.5 rounded-full z-20 shadow-md backdrop-blur-md">
                        <Lock className="w-3 h-3" />
                    </div>
                )}

                <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gradient-to-r ${difficultyColors[skill.difficulty as Difficulty] || difficultyColors[Difficulty.EASY]} shadow-sm opacity-90`}>
                            {skill.difficulty}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleGoal(e, skill.id); }}
                            className={`p-1.5 rounded-full transition-all ${isGoal ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            title={isGoal ? "Remove Goal" : "Set as Goal"}
                        >
                            <Target className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Title */}
                    <div className="mb-3 flex-1">
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                            {skill.skillName}
                        </h3>
                        {skill.example && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic opacity-80">
                                "{skill.example}"
                            </p>
                        )}
                    </div>

                    {/* Progress & Stats */}
                    <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-end text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <span className="text-lg">{status.rank?.icon || '🌱'}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{status.rank?.name || 'Novice'}</span>
                            </div>
                            <span className="font-bold text-slate-400 dark:text-slate-500 text-[10px]">{status.progressLabel || `${status.currentPoints} XP`}</span>
                        </div>

                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isMastered ? 'bg-emerald-500' : isGoal ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(status.progress, 100)}%` }}
                            />
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="flex gap-2 truncate pr-2">
                                <span className="font-medium text-slate-500 dark:text-slate-400">{skill.grade}</span>
                                {skill.publishedBy && <span>• By {skill.publishedBy}</span>}
                                {skill.publishedAt && <span className="hidden sm:inline">• {new Date(skill.publishedAt).toLocaleDateString()}</span>}
                            </div>

                            {isMastered ? (
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                </span>
                            ) : isLocked ? (
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                </span>
                            ) : (
                                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    Start <ChevronRight className="w-3 h-3" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Mobile List Item Render (like the reference - numbered list)
    const renderMobileListItem = (skill: Skill, index: number) => {
        const isPremium = skill.accessLevel === 'premium';
        const isLocked = isPremium && user?.subscriptionTier === 'free';

        const status = skillStatuses[skill.id] || { mastered: false, progress: 0, currentPoints: 0 };
        const isMastered = status.mastered;
        const colorSet = categoryColors[index % categoryColors.length];

        return (
            <div
                key={skill.id}
                onClick={() => !isLocked && onStartPractice(skill)}
                className={`flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 transition-all 
                ${isLocked ? 'opacity-70' : 'active:scale-[0.98] cursor-pointer'}`}
            >
                {/* Number Badge */}
                <div className={`w-8 h-8 ${colorSet.bg} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {skill.skillName}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {skill.subject} • {skill.difficulty}
                    </p>
                </div>

                {/* Stats */}
                <div className="shrink-0 text-right">
                    {isMastered ? (
                        <div className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle className="w-4 h-4" />
                            <Star className="w-3 h-3 fill-emerald-500" />
                        </div>
                    ) : (
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{status.currentPoints}</p>
                            <p className="text-[10px] text-slate-400">XP</p>
                        </div>
                    )}
                </div>

                {/* Arrow / Lock */}
                {isLocked ? (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
            </div>
        );
    };

    if (skills.length === 0) {
        return (
            <div className="py-12 text-center px-4">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No skills found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Check back later for new content</p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile List View */}
            <div className="sm:hidden px-4 space-y-2">
                {skills.map((skill, index) => renderMobileListItem(skill, index))}
            </div>

            {/* Desktop Grid View */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-5">
                {skills.map((skill, index) => renderDesktopCard(skill, index))}
            </div>
        </>
    );
};
