import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { GradeConfig } from '@stores';
import { Skill } from '@types';

interface GradeCatalogGridProps {
    skills: Skill[];
    onSelectGradeSubject: (grade: string, subject?: string) => void;
    gradeConfigs?: GradeConfig[];
}

export const GradeCatalogGrid: React.FC<GradeCatalogGridProps> = ({
    skills,
    onSelectGradeSubject,
    gradeConfigs = []
}) => {

    // Calculate stats
    const stats = useMemo(() => {
        const counts: Record<string, Record<string, number>> = {};
        skills.forEach(skill => {
            const g = skill.grade || 'Unassigned';
            const s = skill.subject || 'General';

            if (!counts[g]) counts[g] = {};
            if (!counts[g][s]) counts[g][s] = 0;
            counts[g][s]++;
        });
        return counts;
    }, [skills]);

    // Group Grades by Category
    const groupedGrades = useMemo(() => {
        const groups: Record<string, GradeConfig[]> = {};
        // Add "Uncategorized" bucket just in case
        const uncategorized: GradeConfig[] = [];

        gradeConfigs.forEach(grade => {
            if (grade.category) {
                if (!groups[grade.category]) groups[grade.category] = [];
                groups[grade.category].push(grade);
            } else {
                uncategorized.push(grade);
            }
        });

        // If specific order is needed, we could use an array of keys.
        // For now, we rely on the order in which they were added or simple iteration.
        return { groups, uncategorized };
    }, [gradeConfigs]);


    // Helper for dynamic colors
    const getColorClasses = (color: string) => {
        const map: Record<string, { badge: string, border: string, text: string, hoverBorder: string, gradient: string }> = {
            cyan: {
                badge: 'bg-cyan-500',
                border: 'border-cyan-100 dark:border-cyan-900/30',
                text: 'text-cyan-600 dark:text-cyan-400',
                hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
                gradient: 'from-cyan-50 to-transparent dark:from-cyan-900/10'
            },
            orange: {
                badge: 'bg-orange-500',
                border: 'border-orange-100 dark:border-orange-900/30',
                text: 'text-orange-600 dark:text-orange-400',
                hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
                gradient: 'from-orange-50 to-transparent dark:from-orange-900/10'
            },
            emerald: {
                badge: 'bg-emerald-500',
                border: 'border-emerald-100 dark:border-emerald-900/30',
                text: 'text-emerald-600 dark:text-emerald-400',
                hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
                gradient: 'from-emerald-50 to-transparent dark:from-emerald-900/10'
            },
            rose: {
                badge: 'bg-rose-500',
                border: 'border-rose-100 dark:border-rose-900/30',
                text: 'text-rose-600 dark:text-rose-400',
                hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
                gradient: 'from-rose-50 to-transparent dark:from-rose-900/10'
            },
            sky: {
                badge: 'bg-sky-500',
                border: 'border-sky-100 dark:border-sky-900/30',
                text: 'text-sky-600 dark:text-sky-400',
                hoverBorder: 'hover:border-sky-300 dark:hover:border-sky-700',
                gradient: 'from-sky-50 to-transparent dark:from-sky-900/10'
            },
            purple: {
                badge: 'bg-purple-500',
                border: 'border-purple-100 dark:border-purple-900/30',
                text: 'text-purple-600 dark:text-purple-400',
                hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
                gradient: 'from-purple-50 to-transparent dark:from-purple-900/10'
            },
            amber: {
                badge: 'bg-amber-500',
                border: 'border-amber-100 dark:border-amber-900/30',
                text: 'text-amber-600 dark:text-amber-400',
                hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
                gradient: 'from-amber-50 to-transparent dark:from-amber-900/10'
            },
            indigo: {
                badge: 'bg-indigo-500',
                border: 'border-indigo-100 dark:border-indigo-900/30',
                text: 'text-indigo-600 dark:text-indigo-400',
                hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
                gradient: 'from-indigo-50 to-transparent dark:from-indigo-900/10'
            }
        };
        return map[color] || map.emerald;
    };

    if (gradeConfigs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <p>No grade configurations found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">
            {/* Render Category Groups */}
            {Object.entries(groupedGrades.groups).map(([category, grades]) => (
                <div key={category} className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 px-1 flex items-center gap-2">
                        {category}
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 ml-4" />
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {grades.map(grade => {
                            const styles = getColorClasses(grade.color);
                            const gradeStats = stats[grade.id] || {};

                            // Check if grade has any active stats to highlight
                            const totalCount = Object.values(gradeStats).reduce((a, b) => a + b, 0);

                            return (
                                <div
                                    key={grade.id}
                                    className={`
                                         relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group
                                         bg-white dark:bg-slate-900
                                         ${styles.border} ${styles.hoverBorder}
                                         hover:shadow-md hover:-translate-y-0.5
                                     `}
                                    onClick={() => onSelectGradeSubject(grade.id)}
                                >
                                    {/* Subtle Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-30`} />

                                    <div className="relative p-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`${styles.badge} text-white font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg shadow-sm group-hover:scale-105 transition-transform`}>
                                                    {grade.shortLabel}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight truncate">
                                                        {grade.label}
                                                    </h3>
                                                    {grade.description && (
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 truncate">
                                                            {grade.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact Stats Grid */}
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {grade.subjects.map(subject => {
                                                const count = gradeStats[subject] || 0;
                                                const isInactive = count === 0;

                                                return (
                                                    <div
                                                        key={subject}
                                                        className={`
                                                             flex items-center justify-between px-2.5 py-1.5 rounded-md border transition-all
                                                             ${isInactive
                                                                ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent'
                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:border-slate-300'
                                                            }
                                                         `}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelectGradeSubject(grade.id, subject);
                                                        }}
                                                    >
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate mr-2">
                                                            {subject}
                                                        </span>
                                                        <span className={`text-xs font-bold ${isInactive ? 'text-slate-300 dark:text-slate-600' : styles.text}`}>
                                                            {count || '-'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Render any uncategorized items if they exist */}
            {groupedGrades.uncategorized.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 px-1 flex items-center gap-2">
                        Other Grades
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 ml-4" />
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {groupedGrades.uncategorized.map(grade => {
                            const styles = getColorClasses(grade.color);
                            const gradeStats = stats[grade.id] || {};
                            return (
                                <div
                                    key={grade.id}
                                    className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-900 ${styles.border} ${styles.hoverBorder} hover:shadow-md hover:-translate-y-0.5`}
                                    onClick={() => onSelectGradeSubject(grade.id)}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-30`} />
                                    <div className="relative p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`${styles.badge} text-white font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg shadow-sm group-hover:scale-105 transition-transform`}>
                                                    {grade.shortLabel}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight truncate">{grade.label}</h3>
                                                    {grade.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 truncate">{grade.description}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {grade.subjects.map(subject => {
                                                const count = gradeStats[subject] || 0;
                                                const isInactive = count === 0;
                                                return (
                                                    <div
                                                        key={subject}
                                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border transition-all ${isInactive ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:border-slate-300'}`}
                                                        onClick={(e) => { e.stopPropagation(); onSelectGradeSubject(grade.id, subject); }}
                                                    >
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate mr-2">{subject}</span>
                                                        <span className={`text-xs font-bold ${isInactive ? 'text-slate-300 dark:text-slate-600' : styles.text}`}>{count || '-'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
