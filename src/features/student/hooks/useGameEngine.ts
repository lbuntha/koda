
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    GeneratedQuestion,
    Skill,
    Difficulty,
    SystemConfig,
    GlobalSettings
} from '@types';
import {
    saveStudentResult,
    getRewardRules,
    getSkillMasteryStatus,
    getMasteryThreshold,
    getStudentStats
} from '@stores';
import { generateQuestionForSkill } from '@services/geminiService';
import confetti from 'canvas-confetti';

interface UseGameEngineProps {
    studentId: string;
    systemConfig: SystemConfig;
    globalSettings: GlobalSettings;
    skillStatuses: Record<string, any>;
    playSound: (type: 'correct' | 'wrong') => void;
    onRefreshData: () => void;
}

// Unicode-safe base64 encoder
const safeToBase64 = (str: string) => {
    try {
        return btoa(str);
    } catch {
        // Handle Unicode characters (emojis) by encoding bytes
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) =>
            String.fromCharCode(byte)
        ).join("");
        return btoa(binString);
    }
};

export const useGameEngine = ({
    studentId,
    systemConfig,
    globalSettings,
    skillStatuses,
    playSound,
    onRefreshData
}: UseGameEngineProps) => {
    // Game State
    const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
    const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Stats State
    const [streak, setStreak] = useState(0);
    const [sessionPoints, setSessionPoints] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);

    // Feedback State
    const [earnedRewards, setEarnedRewards] = useState<{ message: string, points: number, type: 'REWARD' | 'PENALTY' }[]>([]);
    const [scoreBreakdown, setScoreBreakdown] = useState<{ label: string, points: number }[]>([]);
    const [showMasteryModal, setShowMasteryModal] = useState(false);

    // Timer State
    const [autoAdvancePaused, setAutoAdvancePaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize stats
    useEffect(() => {
        const stats = getStudentStats(studentId);
        setSessionPoints(stats.totalXP);
        setStreak(stats.streak);
    }, [studentId]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        };
    }, []);

    const generateQuestion = useCallback(async (skill: Skill) => {
        try {
            let q: GeneratedQuestion;
            if (skill.questionBank && skill.questionBank.length > 0) {
                // Smart Selection Logic
                const completedIds = skillStatuses[skill.id]?.completedQuestionIds || [];
                const candidates = skill.questionBank.filter(qb => {
                    const qId = qb.questionText ? safeToBase64(qb.questionText.slice(0, 32)) : 'unknown';
                    return !completedIds.includes(qId);
                });

                const pool = candidates.length > 0 ? candidates : skill.questionBank;
                const randomIndex = Math.floor(Math.random() * pool.length);
                q = pool[randomIndex];
                await new Promise(resolve => setTimeout(resolve, 300));
            } else {
                q = await generateQuestionForSkill(
                    studentId,
                    skill,
                    systemConfig.defaultAiInstruction,
                    systemConfig.geminiModel,
                    systemConfig.tokenUsage?.student || 1024
                );
            }
            setQuestion(q);
            setQuestionStartTime(Date.now());
        } catch (e) {
            console.error(e);
            setQuestion({
                questionText: 'Error loading question',
                correctAnswer: 'Error',
                explanation: 'Please try again.'
            });
        } finally {
            setLoadingQuestion(false);
        }
    }, [studentId, skillStatuses, systemConfig]);

    const startPractice = useCallback(async (skill: Skill) => {
        setActiveSkill(skill);
        setLoadingQuestion(true);
        setIsSubmitted(false);
        setSelectedAnswer('');
        setEarnedRewards([]);
        setScoreBreakdown([]);
        setShowMasteryModal(false);
        setAutoAdvancePaused(false);
        await generateQuestion(skill);
    }, [generateQuestion]);

    const handleNext = useCallback(() => {
        if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        onRefreshData();
        if (activeSkill) startPractice(activeSkill);
    }, [onRefreshData, activeSkill, startPractice]);

    const startAutoAdvanceTimer = useCallback((correct: boolean) => {
        if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        const duration = correct ? 1200 : 4500;
        setTimeRemaining(duration);
        nextTimerRef.current = setTimeout(() => {
            handleNext();
        }, duration);
    }, [handleNext]);

    const togglePauseAutoAdvance = useCallback(() => {
        if (autoAdvancePaused) {
            handleNext();
        } else {
            if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
            setAutoAdvancePaused(true);
        }
    }, [autoAdvancePaused, handleNext]);

    const handleStopPractice = useCallback(() => {
        if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        setActiveSkill(null);
    }, []);

    const handleSubmit = async () => {
        if (!question || !activeSkill || isSubmitted) return;

        const endTime = Date.now();
        const durationSeconds = (endTime - questionStartTime) / 1000;
        const correct = selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

        setIsCorrect(correct);
        setIsSubmitted(true);
        setAutoAdvancePaused(false);
        playSound(correct ? 'correct' : 'wrong');

        // Stats Calculation
        let nextStreak = streak;
        if (correct) {
            nextStreak += 1;
            setStreak(nextStreak);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
        } else {
            nextStreak = 0;
            setStreak(0);
        }

        // Scoring Logic
        const breakdown: { label: string, points: number }[] = [];
        let totalScore = 0;

        if (correct) {
            let points = globalSettings.baseMasteryPoints;
            breakdown.push({ label: 'Base', points });

            let multiplier = 1;
            if (activeSkill.difficulty === Difficulty.MEDIUM) multiplier = globalSettings.mediumMultiplier;
            if (activeSkill.difficulty === Difficulty.HARD) multiplier = globalSettings.hardMultiplier;
            if (multiplier > 1) points += Math.floor(points * (multiplier - 1));

            if (nextStreak > 1 && globalSettings.streakBonus > 0) {
                const sBonus = globalSettings.streakBonus * nextStreak;
                breakdown.push({ label: `Streak x${nextStreak}`, points: sBonus });
                points += sBonus;
            }

            if (durationSeconds < 5) {
                const speedBonus = globalSettings.speedBonusFast;
                breakdown.push({ label: 'Speed', points: speedBonus });
                points += speedBonus;
            } else if (durationSeconds < 10) {
                const speedBonus = globalSettings.speedBonusStandard;
                points += speedBonus;
            }
            totalScore = points;
        }

        // Rules Engine (Rewards/Penalties)
        const rules = await getRewardRules();
        const appliedRewards: { message: string, points: number, type: 'REWARD' | 'PENALTY' }[] = [];

        rules.forEach(rule => {
            let match = false;
            const rawScore = correct ? 100 : 0;

            const val = typeof rule.conditionValue === 'number' ? rule.conditionValue : parseFloat(rule.conditionValue);

            if (rule.triggerType === 'SCORE') {
                if (rule.conditionOperator === 'EQUALS' && rawScore === val) match = true;
                if (rule.conditionOperator === 'GREATER_THAN' && rawScore > val) match = true;
                if (rule.conditionOperator === 'LESS_THAN' && rawScore < val) match = true;
            } else if (rule.triggerType === 'STREAK') {
                if (rule.conditionOperator === 'EQUALS' && nextStreak === val) match = true;
                if (rule.conditionOperator === 'GREATER_THAN' && nextStreak > val) match = true;
                if (rule.conditionOperator === 'LESS_THAN' && nextStreak < val) match = true;
            } else if (rule.triggerType === 'DIFFICULTY' && correct) {
                if (activeSkill.difficulty === rule.conditionValue) match = true;
            }

            if (match) {
                const pointsValue = rule.effectType === 'PENALTY' ? globalSettings.standardPenaltyPoints : rule.points;
                appliedRewards.push({ message: rule.message, points: pointsValue, type: rule.effectType });
                if (rule.effectType === 'REWARD') totalScore += pointsValue;
                else totalScore = totalScore - pointsValue;
            }
        });

        setScoreBreakdown(breakdown);
        setEarnedRewards(appliedRewards);
        setSessionPoints(prev => prev + totalScore);

        // Mastery Check
        const currentPoints = skillStatuses[activeSkill.id]?.currentPoints || 0;
        const newTotal = currentPoints + totalScore;
        const threshold = getMasteryThreshold();

        if (currentPoints < threshold && newTotal >= threshold) {
            if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
            setTimeout(() => {
                confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 }, colors: ['#FFD700', '#FFA500', '#FFFFFF'] });
                setShowMasteryModal(true);
            }, 800);
        } else {
            startAutoAdvanceTimer(correct);
        }

        // Save Result
        const qId = question.questionText ? safeToBase64(question.questionText.slice(0, 32)) : Date.now().toString();
        await saveStudentResult({
            id: Date.now().toString(),
            studentId,
            skillId: activeSkill.id,
            score: totalScore,
            timestamp: Date.now(),
            attempts: 1,
            questionId: qId
        });
    };

    return {
        activeSkill,
        question,
        loadingQuestion,
        selectedAnswer,
        setSelectedAnswer,
        isSubmitted,
        isCorrect,
        streak,
        sessionPoints,
        earnedRewards,
        showMasteryModal,
        setShowMasteryModal,
        autoAdvancePaused,
        startPractice,
        handleStopPractice,
        handleSubmit,
        handleNext,
        togglePauseAutoAdvance
    };
};
