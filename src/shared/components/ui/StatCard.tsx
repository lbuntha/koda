// StatCard - Dashboard stat display component
import React from 'react';
import { Activity } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title, value, trend, icon: Icon, color
}) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-slate-900/50 p-6 rounded-xl flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}></div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-opacity-10 text-').replace('text-', '')} dark:bg-opacity-20`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')} dark:text-opacity-90`} />
            </div>
        </div>
        {trend && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Activity className="w-3 h-3" /> {trend}
                </span>
                <span>vs last month</span>
            </div>
        )}
    </div>
);
