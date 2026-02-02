import { Badge } from '@types';
import { getAll, save, remove, saveAll } from '@lib/index';

const COLLECTION = 'badges' as const;

// Default badges (will be auto-populated on first load)
const INITIAL_BADGES: Badge[] = [
    // Mastery Badges
    { id: 'b1', name: 'First Skill', description: 'Master 1 skill', icon: '🌟', category: 'MASTERY', unlockCriteria: { type: 'MASTERY_COUNT', value: 1 }, isActive: true, order: 1 },
    { id: 'b2', name: 'Rising Star', description: 'Master 5 skills', icon: '⭐', category: 'MASTERY', unlockCriteria: { type: 'MASTERY_COUNT', value: 5 }, isActive: true, order: 2 },
    { id: 'b3', name: 'Champion', description: 'Master 10 skills', icon: '🏆', category: 'MASTERY', unlockCriteria: { type: 'MASTERY_COUNT', value: 10 }, isActive: true, order: 3 },
    // Streak Badges
    { id: 'b4', name: 'On Fire', description: '3 day streak', icon: '🔥', category: 'STREAK', unlockCriteria: { type: 'STREAK_DAYS', value: 3 }, isActive: true, order: 4 },
    { id: 'b5', name: 'Dedicated', description: '7 day streak', icon: '💪', category: 'STREAK', unlockCriteria: { type: 'STREAK_DAYS', value: 7 }, isActive: true, order: 5 },
    { id: 'b6', name: 'Unstoppable', description: '14 day streak', icon: '🚀', category: 'STREAK', unlockCriteria: { type: 'STREAK_DAYS', value: 14 }, isActive: true, order: 6 },
    // XP Badges
    { id: 'b7', name: 'Starter', description: '1,000 XP', icon: '🎯', category: 'XP', unlockCriteria: { type: 'XP_THRESHOLD', value: 1000 }, isActive: true, order: 7 },
    { id: 'b8', name: 'Explorer', description: '5,000 XP', icon: '🎖️', category: 'XP', unlockCriteria: { type: 'XP_THRESHOLD', value: 5000 }, isActive: true, order: 8 },
    { id: 'b9', name: 'Achiever', description: '10,000 XP', icon: '🥇', category: 'XP', unlockCriteria: { type: 'XP_THRESHOLD', value: 10000 }, isActive: true, order: 9 },
];

export const getBadges = async (): Promise<Badge[]> => {
    const badges = await getAll<Badge>(COLLECTION);
    if (badges.length === 0) {
        await saveAll(COLLECTION, INITIAL_BADGES);
        return INITIAL_BADGES;
    }
    return badges.sort((a, b) => a.order - b.order);
};

export const addBadge = async (badge: Badge): Promise<void> => {
    await save(COLLECTION, badge);
};

export const updateBadge = async (badge: Badge): Promise<void> => {
    await save(COLLECTION, badge);
};

export const deleteBadge = async (id: string): Promise<void> => {
    await remove(COLLECTION, id);
};
