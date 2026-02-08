
import { useTutorialContext, TutorialConfig } from './TutorialContext';

export const useTutorial = () => {
    const {
        isActive,
        currentStep,
        currentStepIndex,
        startTutorialWithConfig, // @ts-ignore
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial
    } = useTutorialContext();

    return {
        isActive,
        currentStep,
        currentStepIndex,
        isFirstStep: currentStepIndex === 0,
        startTutorial: startTutorialWithConfig,
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial
    };
};
