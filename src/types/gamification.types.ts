export interface StudentResult {
    id: string;
    studentId: string;
    skillId: string;
    score: number;
    timestamp: number;
    attempts: number;
    questionId?: string; // Hash or ID to track unique questions answered
}

export interface AnalyticsData {
    subject: string;
    mastery: number;
    timeSpent: number;
}

export interface RewardRule {
    id: string;
    name: string;
    triggerType: 'SCORE' | 'STREAK' | 'DIFFICULTY' | 'ACCURACY';
    conditionOperator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS';
    conditionValue: number | string;
    effectType: 'REWARD' | 'PENALTY';
    points: number;
    message: string;
}

export interface StudentGoal {
    studentId: string;
    skillId: string;
    createdAt: number;
}

export interface SkillRank {
    name: string;
    threshold: number;
    icon: string;
    color: string;
    description: string;
}

// Badge/Achievement configuration
export type BadgeCategory = 'MASTERY' | 'STREAK' | 'XP' | 'CUSTOM';
export type BadgeUnlockType = 'MASTERY_COUNT' | 'STREAK_DAYS' | 'XP_THRESHOLD' | 'CUSTOM';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;                    // emoji or image URL
    category: BadgeCategory;
    unlockCriteria: {
        type: BadgeUnlockType;
        value: number;               // threshold value
    };
    isActive: boolean;
    order: number;                   // display order
}
