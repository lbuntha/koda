import React from 'react';
import { useTheme } from '@theme/index';
import { KodaLogo } from '@shared/components/KodaLogo';


interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    return (
        <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-[#0c1222]' : 'bg-[#f0f9ff]'}`}>
            {/* Background Pattern - Subtle Grid for Tech/Crypto Feel */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 ${isDark
                        ? 'opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]'
                        : 'opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]'}`}
                />

                {/* Subtle top glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none 
                    ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <KodaLogo size="lg" showTagline animated />
                    </div>

                    <h2 className={`text-center text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </h2>
                    <p className={`mt-2 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {subtitle}
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div
                        className={`
                            py-8 px-4 sm:px-10 rounded-lg
                            animate-slide-up
                            ${isDark
                                ? 'bg-slate-900 border border-slate-800 shadow-xl'
                                : 'bg-white border border-slate-200 shadow-xl'
                            }
                        `}
                    >
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className={`mt-8 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tech education for ages 6-18 • Learn to code, create, and explore
                </p>
            </div>
        </div>
    );
};

