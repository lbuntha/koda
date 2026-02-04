import React from 'react';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { Skill, SkillStatus } from '@types';
import { SkillGrid } from './SkillGrid';

interface StudentSubjectViewProps {
    selectedSubject: string;
    setSelectedSubject: (subject: string | null) => void;
    getSubjectConfig: (subject: string) => any;
    getIconByName: (name: string) => any;
    skillsBySubject: Record<string, Skill[]>;
    skillStatuses: Record<string, SkillStatus>;
    userGoals: string[];
    toggleGoal: (skillId: string) => void;
    onStartPractice: (skill: Skill) => void;
}

export const StudentSubjectView: React.FC<StudentSubjectViewProps> = ({
    selectedSubject,
    setSelectedSubject,
    getSubjectConfig,
    getIconByName,
    skillsBySubject,
    skillStatuses,
    userGoals,
    toggleGoal,
    onStartPractice
}) => {
    return (
        <div className="sm:hidden flex flex-col min-h-[100dvh]">
            {/* Subject Header */}
            <div className={`${getSubjectConfig(selectedSubject).bg} px-4 pt-5 pb-6`}>
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => setSelectedSubject(null)}
                        className="w-9 h-9 bg-white/80 dark:bg-slate-800/80 rounded-full flex items-center justify-center shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    {getSubjectConfig(selectedSubject).imageUrl ? (
                        <img
                            src={getSubjectConfig(selectedSubject).imageUrl}
                            alt={selectedSubject}
                            className="w-10 h-10 rounded-xl object-cover shadow-sm"
                        />
                    ) : (
                        (() => { const Icon = getIconByName(getSubjectConfig(selectedSubject).icon); return <Icon className="w-6 h-6" />; })()
                    )}
                    <h1 className={`text-xl font-black ${getSubjectConfig(selectedSubject).color}`}>
                        {selectedSubject}
                    </h1>
                </div>

                {/* Subject Stats */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-slate-800 dark:text-white">{skillsBySubject[selectedSubject]?.length || 0}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">Skills</p>
                    </div>
                    <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-slate-800 dark:text-white">
                            {skillsBySubject[selectedSubject]?.filter(s => skillStatuses[s.id]?.mastered).length || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">Mastered</p>
                    </div>
                    <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-slate-800 dark:text-white">
                            {skillsBySubject[selectedSubject]?.reduce((acc, s) => acc + (skillStatuses[s.id]?.currentPoints || 0), 0) || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">XP</p>
                    </div>
                </div>
            </div>

            {/* Skills List */}
            <div className="flex-1 overflow-y-auto pb-24 pt-4">
                <SkillGrid
                    skills={skillsBySubject[selectedSubject] || []}
                    userGoals={userGoals}
                    skillStatuses={skillStatuses}
                    onStartPractice={onStartPractice}
                    onToggleGoal={toggleGoal}
                />
            </div>
        </div>
    );
};
