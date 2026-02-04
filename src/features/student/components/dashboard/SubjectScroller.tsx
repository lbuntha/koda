import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface SubjectItem {
    name: string;
    icon: LucideIcon;
    bgClass: string;
    textClass: string;
    count: number;
}

interface SubjectScrollerProps {
    subjects: SubjectItem[];
    onSelect: (subject: string) => void;
}

export const SubjectScroller: React.FC<SubjectScrollerProps> = ({ subjects, onSelect }) => {
    return (
        <section className="mb-8">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Explore</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                {subjects.map((sub) => (
                    <button
                        key={sub.name}
                        onClick={() => onSelect(sub.name)}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-transform hover:scale-105 active:scale-95 ${sub.bgClass} border-transparent bg-opacity-50 dark:bg-opacity-20`}
                    // Note: bgClass typically includes 'bg-color-50' etc. We might need to ensure border color matches or is generic.
                    >
                        <sub.icon className={`w-8 h-8 ${sub.textClass}`} />
                        <span className={`text-xs font-bold ${sub.textClass.replace('text-', 'text-slate-')}`}>{sub.name}</span>
                        {/* Note: textClass is usually 'text-color-600'. For the label we might want darker. */}
                    </button>
                ))}
            </div>
        </section>
    );
};
