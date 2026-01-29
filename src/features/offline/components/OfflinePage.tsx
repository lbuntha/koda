import React from 'react';
import { WifiOff, RefreshCw, Rocket } from 'lucide-react';
import { useTheme } from '@theme/index';
import { KodaLogo } from '@shared/components/KodaLogo';
import { Button } from '@shared/components/ui';

interface OfflinePageProps {
    onRetry?: () => void;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({ onRetry }) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#0c1222]' : 'bg-[#f0f9ff]'}`}>
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                />
                <div
                    className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-cyan-600' : 'bg-cyan-400'}`}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-md">
                {/* Offline Icon */}
                <div
                    className={`
                        w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center
                        ${isDark ? 'bg-slate-800' : 'bg-white'} 
                        shadow-xl
                    `}
                >
                    <div className="relative">
                        <WifiOff className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                        {/* Animated pulse ring */}
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-500" style={{ animationDuration: '2s' }} />
                    </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <KodaLogo size="md" animated={false} />
                </div>

                {/* Message */}
                <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    You're Offline
                </h1>
                <p className={`text-base mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Don't worry, explorer! Your learning adventure is just on pause.
                    Check your internet connection and try again.
                </p>

                {/* Mascot/Illustration placeholder */}
                <div
                    className={`
                        w-32 h-32 mx-auto mb-8 rounded-2xl flex items-center justify-center
                        ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/30' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'}
                    `}
                >
                    <Rocket
                        className={`w-16 h-16 ${isDark ? 'text-indigo-400' : 'text-indigo-500'} animate-float`}
                    />
                </div>

                {/* Retry Button */}
                <Button
                    onClick={handleRetry}
                    variant="gradient"
                    size="lg"
                    className="w-full max-w-xs mx-auto"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                </Button>

                {/* Helpful tip */}
                <p className={`mt-6 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    💡 Tip: Some content you've viewed before may still be available offline!
                </p>
            </div>
        </div>
    );
};

export default OfflinePage;
