import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface DailyProgressProps {
    completedCount: number;
    totalGoal: number;
}

export const DailyProgress: React.FC<DailyProgressProps> = ({ completedCount, totalGoal }) => {
    const percentage = Math.min(100, Math.round((completedCount / totalGoal) * 100));
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <section className="mb-8">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Daily Goal</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-100 dark:text-slate-800" />
                        <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="text-emerald-500 transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-200">{completedCount}/{totalGoal}</span>
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Complete {totalGoal} Skills</h4>
                    <p className="text-xs text-slate-400">
                        {completedCount >= totalGoal ? "Goal reached! 🎉" : "Keep up the momentum!"}
                    </p>
                </div>
            </div>
        </section>
    );
};
