import React from 'react';
import { BookOpen, Save, Check, ListChecks, FileText, UploadCloud, Edit, Zap, Trash2, Sparkles, CalendarClock } from 'lucide-react';
import { Card, Button } from '@shared/components/ui';
import { Skill } from '@types';

interface CurriculumTableProps {
    skills: Skill[];
    viewMode: 'LIVE' | 'PENDING';
    onViewModeChange: (mode: 'LIVE' | 'PENDING') => void;
    onPublish: (id: string) => void;
    onEdit: (skill: Skill) => void;
    onDelete: (id: string) => void;
    onGenQuestions: (skill: Skill) => void;
}

export const CurriculumTable: React.FC<CurriculumTableProps> = ({
    skills,
    viewMode,
    onViewModeChange,
    onPublish,
    onEdit,
    onDelete,
    onGenQuestions
}) => {
    const displayedSkills = skills.filter(skill => {
        if (viewMode === 'PENDING') {
            return skill.moderationStatus === 'PENDING';
        } else {
            return skill.moderationStatus !== 'PENDING';
        }
    }).sort((a, b) => {
        // Sort by createdAt descending (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    const pendingCount = skills.filter(s => s.moderationStatus === 'PENDING').length;
    const liveCount = skills.filter(s => s.moderationStatus !== 'PENDING').length;

    return (
        <Card className="lg:col-span-2 overflow-hidden flex flex-col p-0 h-[600px] shadow-lg shadow-slate-200/50 dark:shadow-none border-0 rounded-xl bg-white dark:bg-slate-900">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Course Modules
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <Save className="w-3 h-3" /> Auto-saved
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full md:w-fit">
                    <button
                        onClick={() => onViewModeChange('LIVE')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'LIVE'
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Check className="w-4 h-4" />
                        Active
                        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${viewMode === 'LIVE' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                            {liveCount}
                        </span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('PENDING')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'PENDING'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <ListChecks className="w-4 h-4" />
                        Drafts
                        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${viewMode === 'PENDING' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                            {pendingCount}
                        </span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Module Details</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {displayedSkills.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                        {viewMode === 'PENDING' ? (
                                            <>
                                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <p className="font-medium text-slate-500 dark:text-slate-400">No drafts pending review.</p>
                                                <p className="text-xs mt-1">Use the AI Generator to create new content.</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                                                    <Check className="w-8 h-8" />
                                                </div>
                                                <p className="font-medium text-slate-500 dark:text-slate-400">No active curriculum yet.</p>
                                                <p className="text-xs mt-1">Approve pending drafts to make them live.</p>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayedSkills.map((skill) => (
                                <tr key={skill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-5 w-24 align-top">
                                        {(() => {
                                            const status = skill.moderationStatus || 'APPROVED';
                                            if (status === 'FLAGGED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Flagged</span>;
                                            if (status === 'REJECTED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Rejected</span>;
                                            if (status === 'PENDING') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Draft</span>;
                                            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Live</span>;
                                        })()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{skill.section}</div>
                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-base">{skill.skillName}</div>
                                            <div className="flex gap-2 items-center mt-0.5">
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{skill.grade}</span>
                                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{skill.subject}</span>
                                                {skill.createdAt && (
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-1" title="Created Date">
                                                        <CalendarClock className="w-3 h-3" />
                                                        {new Date(skill.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 w-32 align-top">
                                        <div className="flex flex-col gap-1">
                                            {skill.questionBank ? (
                                                <span className="text-xs font-medium text-slate-500">Fixed Quiz</span>
                                            ) : (
                                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> AI Generated
                                                </span>
                                            )}
                                            {skill.accessLevel === 'premium' && (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded w-fit">PREMIUM</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right whitespace-nowrap align-middle">
                                        <div className="flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">

                                            {/* Publish Button for Drafts */}
                                            {skill.moderationStatus === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => onPublish(skill.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-xs shadow-sm shadow-emerald-200"
                                                >
                                                    <UploadCloud className="w-3 h-3 mr-1.5" /> Publish
                                                </Button>
                                            )}

                                            <button
                                                onClick={() => onEdit(skill)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                title="Edit Details"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            {(!skill.questionBank || skill.questionBank.length === 0) ? (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-xs h-9 px-3"
                                                    onClick={() => onGenQuestions(skill)}
                                                >
                                                    <Zap className="w-3 h-3 mr-1.5" /> Generate
                                                </Button>
                                            ) : (
                                                <button
                                                    onClick={() => onGenQuestions(skill)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                    title="View Questions"
                                                >
                                                    <ListChecks className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => onDelete(skill.id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
