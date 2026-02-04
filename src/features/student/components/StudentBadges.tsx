import React from 'react';
import { Award } from 'lucide-react';
import { Badge } from '@types';

interface StudentBadgesProps {
    configuredBadges: Badge[];
    masteredCount: number;
    streak: number;
    totalXP: number;
}

export const StudentBadges: React.FC<StudentBadgesProps> = ({
    configuredBadges,
    masteredCount,
    streak,
    totalXP
}) => {
    return (
        <div className="px-4 pb-4 animate-in fade-in duration-200">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Achievements</h3>
                <span className="ml-auto text-xs text-slate-400">
                    {configuredBadges.filter(badge => {
                        const { type, value } = badge.unlockCriteria;
                        switch (type) {
                            case 'MASTERY_COUNT': return masteredCount >= value;
                            case 'STREAK_DAYS': return streak >= value;
                            case 'XP_THRESHOLD': return totalXP >= value;
                            default: return false;
                        }
                    }).length} / {configuredBadges.length} earned
                </span>
            </div>

            {/* All Badges in One Grid */}
            <div className="grid grid-cols-3 gap-2">
                {configuredBadges.map((badge) => {
                    const { type, value } = badge.unlockCriteria;
                    let earned = false;
                    switch (type) {
                        case 'MASTERY_COUNT': earned = masteredCount >= value; break;
                        case 'STREAK_DAYS': earned = streak >= value; break;
                        case 'XP_THRESHOLD': earned = totalXP >= value; break;
                        default: earned = false;
                    }
                    return (
                        <div key={badge.id} className={`rounded-xl p-2.5 text-center border transition-all ${earned
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-40 grayscale'
                            }`}>
                            <div className="text-2xl mb-0.5">{badge.icon}</div>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{badge.name}</p>
                            <p className="text-[8px] text-slate-400 truncate">{badge.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
