export enum Difficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard'
}

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED';

export interface GeneratedQuestion {
    questionText: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    imageUrl?: string;
    difficulty?: string;
}

export interface Skill {
    id: string;
    grade: string;
    subject: string;
    section: string;
    skillName: string;
    example: string;
    questionType: string;
    difficulty: Difficulty;
    masteryRequirements?: {
        type: 'SCORE' | 'QUESTIONS';
        value: number;
        minAccuracy?: number;
        isPercentage?: boolean;
    };
    moderationStatus?: ModerationStatus;
    moderationComment?: string;
    questionBank?: GeneratedQuestion[];
    customLayoutId?: 'default' | 'visual-counter' | 'flash-card' | 'vertical-math';
    tags?: string[];
    publishedAt?: string;
    publishedBy?: string;
    /** Custom AI prompt instruction for this specific component (overrides global default) */
    aiPromptInstruction?: string;
    /** Component-specific configuration values (e.g. { digits: 2, operation: 'add' }) */
    componentAttributes?: Record<string, any>;

    /** Access Level for the content */
    accessLevel?: 'free' | 'premium';
}
