import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, ChevronDown, Check, X } from 'lucide-react';
import { Avatar } from '@shared/components/ui';
import { Skill, Role, User } from '@types';
import { LeaderboardEntry } from '@stores';

// Inside component:
interface StudentLeaderboardProps {
    currentUser: User | undefined;
    leaderboardData: LeaderboardEntry[];
    skills: Skill[];
    leaderboardSkillFilter: string;
    setLeaderboardSkillFilter: (filter: string) => void;
    // We need to know who "I" am for the highlight logic, usually currentUser.id
    currentStudentId: string;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
    currentUser,
    leaderboardData,
    skills,
    leaderboardSkillFilter,
    setLeaderboardSkillFilter,
    currentStudentId
}) => {
    const [showAll, setShowAll] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    const selectedSkillName = leaderboardSkillFilter === 'all'
        ? 'All Skills (Total XP)'
        : skills.find(s => s.id === leaderboardSkillFilter)?.skillName || 'Unknown Skill';

    return (
        <div className="px-4 pb-4 animate-in fade-in duration-200">
            {/* Header with Skill Filter */}
            <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Leaderboard</h3>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {currentUser?.grades?.[0] || (currentUser as any)?.grade || 'All Grades'}
                </span>
            </div>

            {/* Custom Skill Filter Dropdown */}
            <div className="mb-4 relative z-20">
                <button
                    onClick={() => setIsDropdownOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-800 shadow-sm active:scale-98 transition-all"
                >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {selectedSkillName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-indigo-400" />
                </button>

                {/* Dropdown / Bottom Sheet */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDropdownOpen(false)}
                                className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                            />

                            {/* Content - Bottom Sheet on Mobile, Dropdown on Desktop */}
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-slate-900 rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:absolute sm:bottom-auto sm:left-0 sm:right-0 sm:top-full sm:mt-2 sm:rounded-xl sm:shadow-xl sm:border sm:border-slate-200 dark:sm:border-slate-700 sm:max-h-64 sm:transform-none !sm:translate-y-0"
                                style={{
                                    // Reset transforms for desktop via JS if needed, but Tailwind sm: utility often cleaner 
                                    // if we used purely CSS for positioning. 
                                    // For framer-motion mixed with media queries, separate components or 'custom' variants are better
                                    // But for simplicity: Mobile first (Bottom Sheet), overriden style for desktop in CSS classes
                                }}
                            >
                                <div className="sm:hidden flex items-center justify-between mb-4 px-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Select Leaderboard</h3>
                                    <button
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <button
                                        onClick={() => { setLeaderboardSkillFilter('all'); setIsDropdownOpen(false); }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${leaderboardSkillFilter === 'all'
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <span>All Skills (Total XP)</span>
                                        {leaderboardSkillFilter === 'all' && <Check className="w-4 h-4" />}
                                    </button>

                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                                    {skills.map(skill => (
                                        <button
                                            key={skill.id}
                                            onClick={() => { setLeaderboardSkillFilter(skill.id); setIsDropdownOpen(false); }}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${leaderboardSkillFilter === skill.id
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <span className="truncate">{skill.skillName}</span>
                                            {leaderboardSkillFilter === skill.id && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Your Position */}
            {(() => {
                const myEntry = leaderboardData.find(e => e.userId === currentStudentId);
                return myEntry ? (
                    <div className="mb-3">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Your Position</p>
                        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 border-2 border-indigo-200 dark:border-indigo-700">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${myEntry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                                myEntry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                                    myEntry.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                                        'bg-indigo-100 text-indigo-600'
                                }`}>
                                #{myEntry.rank}
                            </div>
                            <Avatar src={currentUser?.avatar} role={Role.STUDENT} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{currentUser?.displayName || currentUser?.name || 'You'}</p>
                            </div>
                            <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                {leaderboardSkillFilter === 'all'
                                    ? `${myEntry.masteredCount} mastered`
                                    : `${myEntry.progressPercent || 0}%`
                                }
                            </p>
                        </div>
                    </div>
                ) : null;
            })()}

            {/* Top Students */}
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Top Students</p>
                {leaderboardData.length > 5 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                        {showAll ? 'Show Less' : 'Show More'}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {leaderboardData.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No students found in this grade.</p>
                ) : (
                    leaderboardData.slice(0, showAll ? undefined : 5).map((entry) => {
                        const isMe = entry.userId === currentStudentId;
                        return (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${isMe
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                    }`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${entry.rank === 1 ? 'bg-amber-100 text-amber-600' :
                                    entry.rank === 2 ? 'bg-slate-100 text-slate-600' :
                                        entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                                            'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {entry.rank}
                                </div>
                                <Avatar src={entry.avatar} role={Role.STUDENT} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm truncate ${isMe ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {entry.displayName || entry.name}
                                        {isMe && <span className="text-[10px] ml-1 text-indigo-500">(You)</span>}
                                    </p>
                                </div>
                                <p className={`font-bold text-sm ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {leaderboardSkillFilter === 'all'
                                        ? `${entry.masteredCount} ⭐`
                                        : `${entry.progressPercent || 0}%`
                                    }
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
