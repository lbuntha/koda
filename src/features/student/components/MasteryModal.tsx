
import React from 'react';
import { Button } from '@shared/components/ui';
import { Crown, Home, RotateCcw } from 'lucide-react';

interface MasteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    skillName: string;
    score: number;
}

export const MasteryModal: React.FC<MasteryModalProps> = ({
    isOpen,
    onClose,
    onContinue,
    skillName,
    score
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-8 border-4 border-yellow-400 relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-3xl -z-10"></div>
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200">
                    <Crown className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Skill Mastered!</h2>
                <p className="text-slate-500 mb-6">You've reached expert status in <br /><span className="font-bold text-indigo-600">{skillName}</span></p>
                <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total XP Earned</div>
                    <div className="text-3xl font-black text-slate-800">{score}</div>
                </div>
                <div className="space-y-3">
                    <Button onClick={onClose} size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200">
                        <Home className="w-4 h-4 mr-2" /> Return to Path
                    </Button>
                    <Button onClick={onContinue} variant="ghost" className="w-full text-slate-400 hover:text-slate-600">
                        <RotateCcw className="w-4 h-4 mr-2" /> Keep Practicing
                    </Button>
                </div>
            </div>
        </div>
    );
};
