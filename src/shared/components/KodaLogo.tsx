import React from 'react';
import { useTheme } from '@theme/index';

interface KodaLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTagline?: boolean;
    animated?: boolean;
    className?: string;
}

export const KodaLogo: React.FC<KodaLogoProps> = ({
    size = 'md',
    showTagline = false,
    animated = true,
    className = ''
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const sizes = {
        sm: { icon: 'w-8 h-8', text: 'text-xl', tagline: 'text-xs' },
        md: { icon: 'w-10 h-10', text: 'text-2xl', tagline: 'text-sm' },
        lg: { icon: 'w-14 h-14', text: 'text-3xl', tagline: 'text-base' },
        xl: { icon: 'w-20 h-20', text: 'text-5xl', tagline: 'text-lg' },
    };

    const sizeConfig = sizes[size];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Logo Icon - Stylized K with gradient */}
            <div
                className={`
                    ${sizeConfig.icon} 
                    bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400
                    rounded-xl flex items-center justify-center 
                    shadow-lg relative overflow-hidden
                    ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}
                `}
                style={{
                    boxShadow: isDark
                        ? '0 4px 20px rgba(99, 102, 241, 0.4)'
                        : '0 4px 15px rgba(99, 102, 241, 0.3)',
                }}
            >
                {/* Animated shine effect */}
                {animated && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                )}

                {/* K letter with custom styling */}
                <svg
                    viewBox="0 0 24 24"
                    className="w-3/5 h-3/5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 4v16" />
                    <path d="M6 12l8-8" />
                    <path d="M6 12l8 8" />
                </svg>
            </div>

            {/* Logo Text */}
            <div className="flex flex-col">
                <span
                    className={`
                        ${sizeConfig.text} font-extrabold tracking-tight
                        bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 
                        bg-clip-text text-transparent
                        ${animated ? 'hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-400 transition-all duration-300' : ''}
                    `}
                    style={{
                        // Fallback for browsers that don't support bg-clip
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Koda
                </span>

                {showTagline && (
                    <span
                        className={`
                            ${sizeConfig.tagline} 
                            ${isDark ? 'text-slate-400' : 'text-slate-500'}
                            font-medium tracking-wide
                        `}
                    >
                        Explore. Learn. Grow.
                    </span>
                )}
            </div>
        </div>
    );
};

// Compact icon-only version for mobile/navbar
export const KodaIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <div
            className={`
                ${sizes[size]} 
                bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400
                rounded-xl flex items-center justify-center 
                shadow-lg hover:scale-105 transition-transform duration-300
                ${className}
            `}
            style={{
                boxShadow: isDark
                    ? '0 4px 20px rgba(99, 102, 241, 0.4)'
                    : '0 4px 15px rgba(99, 102, 241, 0.3)',
            }}
        >
            <svg
                viewBox="0 0 24 24"
                className="w-3/5 h-3/5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M6 4v16" />
                <path d="M6 12l8-8" />
                <path d="M6 12l8 8" />
            </svg>
        </div>
    );
};

export default KodaLogo;
