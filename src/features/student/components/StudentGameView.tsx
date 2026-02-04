import React from 'react';
import { Skill } from '@types';
import { ConfirmationModal } from '@shared/components/ui';
import { GameHeader } from './GameHeader';
import { GameStage } from './GameStage';
import { MasteryModal } from './MasteryModal';
import { SafeAreaContainer } from '@shared/components/layout';

interface StudentGameViewProps {
    activeSkill: Skill;
    showMasteryModal: boolean;
    setShowMasteryModal: (show: boolean) => void;
    handleStopPractice: () => void;
    gameEngine: any; // Using any for now to avoid types hell, ideally should be GameEngine
    skillStatuses: Record<string, any>;
    sessionPoints: number;
    resetConfirmation: { isOpen: boolean; step: 'idle' | 'confirm' | 'resetting' };
    setResetConfirmation: (state: { isOpen: boolean; step: 'idle' | 'confirm' | 'resetting' }) => void;
    confirmResetProgress: () => void;
    requestResetProgress: () => void;
    streak: number;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
}

export const StudentGameView: React.FC<StudentGameViewProps> = ({
    activeSkill,
    showMasteryModal,
    setShowMasteryModal,
    handleStopPractice,
    gameEngine,
    skillStatuses,
    sessionPoints,
    resetConfirmation,
    setResetConfirmation,
    confirmResetProgress,
    requestResetProgress,
    streak,
    soundEnabled,
    setSoundEnabled
}) => {
    return (
        <SafeAreaContainer className="bg-white dark:bg-slate-950 z-[50]">
            <MasteryModal
                isOpen={showMasteryModal}
                onClose={() => { setShowMasteryModal(false); handleStopPractice(); }}
                onContinue={() => { setShowMasteryModal(false); gameEngine.handleNext(); }}
                skillName={activeSkill.skillName}
                score={(skillStatuses[activeSkill.id]?.currentPoints || 0) + sessionPoints}
            />

            <ConfirmationModal
                isOpen={resetConfirmation.isOpen}
                title="Reset Progress?"
                message="Are you sure you want to reset your progress for this skill? All points, rank status, and history will be permanently lost."
                confirmLabel="Yes, Reset"
                isDanger={true}
                onConfirm={confirmResetProgress}
                onCancel={() => setResetConfirmation({ isOpen: false, step: 'idle' })}
            />

            <GameHeader
                skillName={activeSkill.skillName}
                subject={activeSkill.subject}
                streak={streak}
                sessionPoints={sessionPoints}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onStopPractice={handleStopPractice}
                onRequestReset={requestResetProgress}
            />

            {/* Mobile Skill Title - Shown below header to avoid overlapping with points */}
            <div className="sm:hidden px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 text-center shrink-0">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider leading-tight">{activeSkill.subject}</p>
                <h2 className="text-sm font-medium text-slate-800 dark:text-white truncate leading-tight px-4">{activeSkill.skillName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto relative w-full bg-white dark:bg-slate-950">
                <GameStage
                    loadingQuestion={gameEngine.loadingQuestion}
                    question={gameEngine.question}
                    activeSkill={gameEngine.activeSkill}
                    selectedAnswer={gameEngine.selectedAnswer}
                    isSubmitted={gameEngine.isSubmitted}
                    isCorrect={gameEngine.isCorrect}
                    autoAdvancePaused={gameEngine.autoAdvancePaused}
                    onSetSelectedAnswer={gameEngine.setSelectedAnswer}
                    onSubmit={gameEngine.handleSubmit}
                    onNext={gameEngine.handleNext}
                    onTogglePause={gameEngine.togglePauseAutoAdvance}
                />
            </div>
        </SafeAreaContainer>
    );
};
