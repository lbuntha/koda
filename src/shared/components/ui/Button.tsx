import React from 'react';
import { useTheme } from '@theme/index';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'fun' | 'super';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children, variant = 'primary', size = 'md', glow = false, className = '', ...props
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const baseStyle = `
        rounded-md font-semibold transition-all duration-200 
        flex items-center justify-center gap-2
        active:scale-[0.98] disabled:active:scale-100
    `;

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5",
        lg: "px-6 py-3 text-lg"
    };

    const variants = {
        primary: isDark
            ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md hover:shadow-lg hover:shadow-indigo-500/25"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-500/30",
        secondary: isDark
            ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm hover:shadow-cyan-500/25"
            : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm hover:shadow-cyan-500/30",
        outline: isDark
            ? "border-2 border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 bg-transparent hover:bg-indigo-500/10"
            : "border-2 border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 bg-white hover:bg-indigo-50",
        ghost: isDark
            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
        destructive: isDark
            ? "bg-red-600 text-white hover:bg-red-500 shadow-sm hover:shadow-red-500/25"
            : "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-red-500/30",
        // New gradient variant - premium CTA look
        gradient: `
            bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 
            text-white font-bold
            shadow-lg hover:shadow-xl
            hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600
            ${isDark ? 'shadow-indigo-500/30 hover:shadow-indigo-500/40' : 'shadow-indigo-500/25 hover:shadow-indigo-500/35'}
        `,
        // Fun variant - playful for younger students
        fun: `
            bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500
            text-white font-bold
            shadow-lg hover:shadow-xl
            hover:from-amber-500 hover:via-orange-600 hover:to-pink-600
            animate-glow-pulse
            ${isDark ? 'shadow-orange-500/30 hover:shadow-orange-500/40' : 'shadow-orange-500/25 hover:shadow-orange-500/35'}
        `,
        // Super variant - 3D game style for primary actions
        super: isDark
            ? "bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 active:mb-1 shadow-lg shadow-indigo-900/40 uppercase tracking-wider font-black"
            : "bg-indigo-500 hover:bg-indigo-400 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 active:mb-1 shadow-lg shadow-indigo-500/30 uppercase tracking-wider font-black",
    };

    const glowStyle = glow ? (isDark
        ? 'shadow-lg shadow-indigo-500/40'
        : 'shadow-lg shadow-indigo-500/30'
    ) : '';

    return (
        <button
            className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${glowStyle} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
