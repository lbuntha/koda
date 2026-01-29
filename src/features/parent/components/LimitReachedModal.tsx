import React from 'react';
import { X, Crown, ArrowRight } from 'lucide-react';

interface LimitReachedModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCount: number;
    maxCount: number;
    planName?: string;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
    isOpen,
    onClose,
    currentCount,
    maxCount,
    planName = "Free"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 px-6 pt-8 pb-8 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Crown className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Plan Limit Reached</h2>
                    <p className="text-amber-50 text-sm font-medium">
                        You've used {currentCount} of {maxCount} child profiles included in your {planName} plan.
                    </p>
                </div>

                <div className="p-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Upgrade to Pro for:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                Up to 10 Child Profiles
                            </li>
                            <li className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                Advanced AI Reasoning Models
                            </li>
                            <li className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                Priority Support & Analytics
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        Upgrade Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full mt-3 text-xs text-slate-400 font-medium hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};
