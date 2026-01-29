import React from 'react';
import { useTheme } from '@theme/index';

type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate' | 'cyan' | 'orange' | 'indigo' | 'gray';
type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

interface BadgeProps {
    children: React.ReactNode;
    color?: BadgeColor;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: React.ReactNode;
    pulse?: boolean;
    achievement?: AchievementTier;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    color = 'blue',
    size = 'sm',
    className = '',
    icon,
    pulse = false,
    achievement,
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const sizes = {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-sm',
    };

    const colors: Record<BadgeColor, string> = isDark ? {
        blue: 'bg-indigo-900/50 text-indigo-300 border-indigo-700',
        green: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
        yellow: 'bg-amber-900/50 text-amber-300 border-amber-700',
        red: 'bg-rose-900/50 text-rose-300 border-rose-700',
        purple: 'bg-purple-900/50 text-purple-300 border-purple-700',
        slate: 'bg-slate-700 text-slate-300 border-slate-600',
        cyan: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
        orange: 'bg-orange-900/50 text-orange-300 border-orange-700',
        indigo: 'bg-indigo-900/50 text-indigo-300 border-indigo-700',
        gray: 'bg-slate-700 text-slate-300 border-slate-600',
    } : {
        blue: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        yellow: 'bg-amber-50 text-amber-700 border-amber-200',
        red: 'bg-rose-50 text-rose-700 border-rose-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        gray: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    // Achievement tier styling - special gradient badges
    const achievementStyles: Record<AchievementTier, string> = {
        bronze: 'bg-gradient-to-r from-amber-700 to-orange-600 text-amber-100 border-amber-600 shadow-sm shadow-amber-500/30',
        silver: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white border-slate-400 shadow-sm shadow-slate-400/30',
        gold: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-900 border-yellow-400 shadow-sm shadow-yellow-400/40',
        diamond: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-400 shadow-sm shadow-cyan-400/40',
    };

    const pulseStyle = pulse ? 'animate-glow-pulse' : '';

    const style = achievement ? achievementStyles[achievement] : colors[color];

    return (
        <span
            className={`
                ${sizes[size]} rounded-full font-semibold border 
                ${style} ${pulseStyle}
                inline-flex items-center gap-1.5
                ${className}
            `}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
