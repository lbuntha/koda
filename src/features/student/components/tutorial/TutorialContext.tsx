import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface TutorialStep {
    targetId: string;
    targets?: string[]; // Fallback targets if targetId is not visible
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TutorialConfig {
    id: string;
    steps: TutorialStep[];
}

interface TutorialContextType {
    isActive: boolean;
    currentStepIndex: number;
    currentStep: TutorialStep | null;
    startTutorial: (tutorialId: string) => void;
    startTutorialWithConfig: (config: TutorialConfig) => void;
    endTutorial: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [config, setConfig] = useState<TutorialConfig | null>(null);

    // Store configurations here or load them dynamically
    const [tutorialConfigs, setTutorialConfigs] = useState<Record<string, TutorialConfig>>({});

    const registerTutorial = useCallback((conf: TutorialConfig) => {
        setTutorialConfigs(prev => ({ ...prev, [conf.id]: conf }));
    }, []);

    const startTutorial = useCallback((tutorialId: string) => {
        // In a real app, we might load config here
        // For now, we assume it's registered or we load it from a static file look up
        // We'll handle config loading in the component that initiates it or pass it in.
        // For simplicity, let's assume we pass the config in 'register' or we have a lookup outside.
        // Refactoring slightly: Let's assume the hook handles the "data" part, 
        // and context just handles the "state" part. 
        // BUT, the context needs to know the STEPS.
        // So we will allow setting the config directly.

        setActiveTutorialId(tutorialId);
        setCurrentStepIndex(0);
    }, []);

    // Effect to actually load the steps when ID changes
    // This is a bit chicken-and-egg. Let's make startTutorial accept the config or load it.
    // Simpler: The consumer calls startTutorial with the ID, and the Context looks it up.
    // If not found, do nothing. 
    // We will inject the configs via a prop or just import them in the context if they are static.
    // Since we are making this for Student View specific right now, let's import the data here or 
    // allow `startTutorial` to take the steps.

    // Let's go with: startTutorial takes the config to be flexible.

    const startTutorialWithConfig = useCallback((tutorialConfig: TutorialConfig) => {
        setConfig(tutorialConfig);
        setActiveTutorialId(tutorialConfig.id);
        setCurrentStepIndex(0);
    }, []);

    const endTutorial = useCallback(() => {
        // Mark as complete in localStorage
        if (activeTutorialId) {
            localStorage.setItem(`tutorial_completed_${activeTutorialId}`, 'true');
        }
        setActiveTutorialId(null);
        setConfig(null);
        setCurrentStepIndex(0);
    }, [activeTutorialId]);

    const skipTutorial = useCallback(() => {
        // Mark as complete (skipped is treated as seen)
        if (activeTutorialId) {
            localStorage.setItem(`tutorial_completed_${activeTutorialId}`, 'true');
        }
        setActiveTutorialId(null);
        setConfig(null);
        setCurrentStepIndex(0);
    }, [activeTutorialId]);

    const nextStep = useCallback(() => {
        if (!config) return;
        if (currentStepIndex < config.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            endTutorial();
        }
    }, [config, currentStepIndex, endTutorial]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const currentStep = config ? config.steps[currentStepIndex] : null;

    return (
        <TutorialContext.Provider value={{
            isActive: !!activeTutorialId,
            currentStepIndex,
            currentStep,
            startTutorial: (id) => { console.warn("Use startTutorialWithConfig instead for now"); },
            // @ts-ignore - extending for implementation ease
            startTutorialWithConfig,
            endTutorial,
            nextStep,
            prevStep,
            skipTutorial
        }}>
            {children}
        </TutorialContext.Provider>
    );
};

export const useTutorialContext = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
};
