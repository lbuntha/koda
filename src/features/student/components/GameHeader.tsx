
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@shared/components/ui';
import {
    XCircle,
    RotateCcw,
    Volume2,
    VolumeX,
    Flame,
    Coins
} from 'lucide-react';

interface GameHeaderProps {
    streak: number;
    sessionPoints: number;
    soundEnabled: boolean;
    onToggleSound: () => void;
    onStopPractice: () => void;
    onRequestReset: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
    streak,
    sessionPoints,
    soundEnabled,
    onToggleSound,
    onStopPractice,
    onRequestReset
}) => {
    // Track previous values for animation triggers
    const prevStreak = useRef(streak);
    const prevPoints = useRef(sessionPoints);

    const [streakAnimating, setStreakAnimating] = useState(false);
    const [pointsAnimating, setPointsAnimating] = useState(false);
    const [pointsDelta, setPointsDelta] = useState(0);

    // Animate streak when it changes
    useEffect(() => {
        if (streak > prevStreak.current) {
            setStreakAnimating(true);
            const timer = setTimeout(() => setStreakAnimating(false), 600);
            prevStreak.current = streak;
            return () => clearTimeout(timer);
        }
        prevStreak.current = streak;
    }, [streak]);

    // Animate points when they change
    useEffect(() => {
        if (sessionPoints > prevPoints.current) {
            const delta = sessionPoints - prevPoints.current;
            setPointsDelta(delta);
            setPointsAnimating(true);
            const timer = setTimeout(() => {
                setPointsAnimating(false);
                setPointsDelta(0);
            }, 800);
            prevPoints.current = sessionPoints;
            return () => clearTimeout(timer);
        }
        prevPoints.current = sessionPoints;
    }, [sessionPoints]);

    return (
        <div className="flex-none px-3 py-2 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-white dark:bg-slate-900/80 backdrop-blur-md z-10 sticky top-0 relative transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-6">
                <div className="flex items-center">
                    <button
                        onClick={onStopPractice}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold group"
                        aria-label="Quit"
                    >
                        <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={onRequestReset}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-bold group ml-1"
                        aria-label="Reset"
                    >
                        <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pl-2">
                {/* Sound Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleSound}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-500 shrink-0 p-0"
                    aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>

                {/* Streak Counter */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 scale-90 sm:scale-100 origin-right">
                    <div className={`
                        flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-100 dark:border-amber-900/40
                        transition-all duration-300
                        ${streakAnimating ? 'scale-110 ring-4 ring-amber-300/50 dark:ring-amber-500/30' : ''}
                    `}>
                        <div className={`
                            bg-amber-500 rounded-lg p-1 mr-2 sm:mr-3 shadow-sm transform scale-90 sm:scale-100 transition-transform duration-300
                            ${streakAnimating ? 'scale-125 rotate-12' : ''}
                        `}>
                            <Flame className={`w-4 h-4 sm:w-5 sm:h-5 text-white fill-white transition-all duration-300 ${streakAnimating ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="flex flex-col relative">
                            <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider leading-none mb-0.5">Streak</span>
                            <span className={`text-sm sm:text-xl font-black text-amber-600 dark:text-amber-500 leading-none tabular-nums transition-transform duration-300 ${streakAnimating ? 'scale-125' : ''}`}>
                                {streak}
                            </span>
                            {streakAnimating && (
                                <span className="absolute -top-3 -right-2 text-xs font-bold text-amber-500 animate-bounce">
                                    🔥
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={`
                        flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/40
                        transition-all duration-300
                        ${pointsAnimating ? 'scale-110 ring-4 ring-indigo-300/50 dark:ring-indigo-500/30' : ''}
                    `}>
                        <div className={`
                            bg-indigo-500 rounded-lg p-1 mr-2 sm:mr-3 shadow-sm transform scale-90 sm:scale-100 transition-transform duration-300
                            ${pointsAnimating ? 'scale-125 -rotate-12' : ''}
                        `}>
                            <Coins className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-all duration-300 ${pointsAnimating ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="flex flex-col relative">
                            <span className="text-[10px] sm:text-xs font-bold text-indigo-400 uppercase tracking-wider leading-none mb-0.5">XP</span>
                            <span className={`text-sm sm:text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none tabular-nums transition-transform duration-300 ${pointsAnimating ? 'scale-110' : ''}`}>
                                {sessionPoints.toLocaleString()}
                            </span>
                            {pointsAnimating && pointsDelta > 0 && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-500 animate-bounce whitespace-nowrap">
                                    +{pointsDelta}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
