import React from 'react';
import { useTheme } from '@theme/index';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    glass?: boolean;
    hover?: boolean;
    glow?: 'none' | 'primary' | 'xp' | 'success';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    glass = false,
    hover = false,
    glow = 'none',
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const baseStyle = glass
        ? isDark
            ? 'bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50'
            : 'bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50'
        : isDark
            ? 'bg-[#1a2234] rounded-2xl shadow-sm border border-slate-700/50'
            : 'bg-white rounded-2xl shadow-sm border border-indigo-100/50';

    const hoverStyle = hover
        ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer'
        : '';

    const glowStyles = {
        none: '',
        primary: isDark
            ? 'shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30'
            : 'shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25',
        xp: isDark
            ? 'shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 border-amber-500/30'
            : 'shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 border-amber-200',
        success: isDark
            ? 'shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border-emerald-500/30'
            : 'shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 border-emerald-200',
    };

    return (
        <div className={`${baseStyle} ${paddings[padding]} ${hoverStyle} ${glowStyles[glow]} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
