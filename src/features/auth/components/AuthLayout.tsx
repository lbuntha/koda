import React from 'react';
import { useTheme } from '@theme/index';
import { KodaLogo } from '@shared/components/KodaLogo';
import { Sparkles, Star } from 'lucide-react';

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
            {/* Gradient mesh background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary gradient blob */}
                <div
                    className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                />
                {/* Secondary gradient blob */}
                <div
                    className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 ${isDark ? 'bg-cyan-600' : 'bg-cyan-400'}`}
                />
                {/* Accent blob */}
                <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`}
                />

                {/* Floating decorative elements - Stars/Sparkles for younger appeal */}
                <div className="absolute top-20 left-[15%] animate-float opacity-40">
                    <Star className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'} fill-current`} />
                </div>
                <div className="absolute top-40 right-[20%] animate-float opacity-30" style={{ animationDelay: '1s' }}>
                    <Sparkles className={`w-8 h-8 ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
                </div>
                <div className="absolute bottom-32 left-[25%] animate-float opacity-40" style={{ animationDelay: '0.5s' }}>
                    <Star className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'} fill-current`} />
                </div>
                <div className="absolute bottom-48 right-[15%] animate-float opacity-30" style={{ animationDelay: '1.5s' }}>
                    <Sparkles className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                </div>
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
                            py-8 px-4 sm:px-10 sm:rounded-2xl
                            animate-slide-up
                            ${isDark
                                ? 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/20'
                                : 'bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10'
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

