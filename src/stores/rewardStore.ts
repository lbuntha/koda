import { RewardRule } from '@types';
import { getAll, save, remove, saveAll } from '@lib/index';

const COLLECTION = 'rewards' as const;

const INITIAL_REWARDS: RewardRule[] = [
    { id: 'r1', name: 'Perfect Score Bonus', triggerType: 'SCORE', conditionOperator: 'EQUALS', conditionValue: 100, effectType: 'REWARD', points: 50, message: 'Perfect Score Bonus!' },
    { id: 'r2', name: 'Low Effort Penalty', triggerType: 'SCORE', conditionOperator: 'LESS_THAN', conditionValue: 40, effectType: 'PENALTY', points: 10, message: 'Needs Improvement' },
    { id: 'r3', name: 'Streak Master', triggerType: 'STREAK', conditionOperator: 'GREATER_THAN', conditionValue: 4, effectType: 'REWARD', points: 100, message: '5x Streak Bonus!' },
];

export const getRewardRules = async (): Promise<RewardRule[]> => {
    const rewards = await getAll<RewardRule>(COLLECTION);
    if (rewards.length === 0) {
        await saveAll(COLLECTION, INITIAL_REWARDS);
        return INITIAL_REWARDS;
    }
    return rewards;
};

// Sync version removal - we are moving to async only
export const getRewardRulesSync = (): RewardRule[] => {
    // Deprecated: returning empty or default to avoid breaking legacy calls immediately if any exist
    // But ideally this should not be used.
    console.warn("getRewardRulesSync is deprecated. Use getRewardRules instead.");
    return INITIAL_REWARDS;
};

export const addRewardRule = async (rule: RewardRule): Promise<void> => {
    await save(COLLECTION, rule);
};

export const updateRewardRule = async (rule: RewardRule): Promise<void> => {
    await save(COLLECTION, rule);
};

export const deleteRewardRule = async (id: string): Promise<void> => {
    await remove(COLLECTION, id);
};

