import React from 'react';
import { Play, TrendingUp, Sparkles, Target } from 'lucide-react';
import { Skill } from '@types';

interface StudentHeroProps {
    skill: Skill | null;
    onPlay: (skillId: string) => void;
    streak: number;
    skillStatus?: any;
    isLoading?: boolean;
}

export const StudentHero: React.FC<StudentHeroProps> = ({ skill, onPlay, streak, skillStatus, isLoading = false }) => {
    // 1. Loading State
    if (isLoading) return (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden mb-8 h-48 flex items-center justify-center">
            <div className="text-center relative z-10">
                <Spinner />
                <p className="mt-2 text-indigo-200 text-sm">Finding your next mission...</p>
            </div>
        </div>
    );

    // 2. Empty State (No skill)
    if (!skill) return (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 text-slate-500 text-center shadow-inner mb-8 border border-slate-200 dark:border-slate-700">
            <div className="max-w-md mx-auto">
                {/* <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                </div> */}
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Active Missions</h3>
                <p className="text-sm">You've completed everything for now, or you need to select a grade in your profile!</p>
            </div>
        </div>
    );

    const progress = skillStatus?.progressPercent || 0;
    const isMastered = skillStatus?.mastered;

    return (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 dark:shadow-none relative overflow-hidden mb-8 group transition-transform hover:scale-[1.01]">
            {/* Background Decorations */}
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500 rounded-full opacity-50 blur-2xl group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-purple-500 rounded-full opacity-50 blur-2xl group-hover:opacity-70 transition-opacity"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm tracking-wider uppercase">
                        {isMastered ? 'Mastery Review' : 'Next Up'}
                    </span>
                    {streak > 0 && (
                        <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30">
                            <span className="text-[10px] font-bold text-orange-200">{streak} Day Streak</span>
                            <span className="text-xs">🔥</span>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="text-3xl font-black mb-1 leading-tight tracking-tight">{skill.skillName}</h2>
                    <p className="text-indigo-200 text-sm font-medium flex items-center gap-2">
                        <span>{skill.subject}</span>
                        <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                        <span>Grade {skill.grade}</span>
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {/* Placeholder for 'Friends doing this' or similar, currently just decorative icons or empty */}
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-indigo-500/50">
                            <Target className="w-4 h-4 text-indigo-200" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-indigo-500/50 ml-6">
                            <span className="text-[10px] font-bold text-indigo-100">{progress}%</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onPlay(skill.id)}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-900/20 flex items-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all"
                    >
                        <Play className="w-5 h-5 fill-indigo-600" />
                        {progress > 0 ? 'Resume' : 'Start'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Spinner = () => (
    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
);
