export enum Role {
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT',
    PARENT = 'PARENT',
    ADMIN = 'ADMIN',
    NONE = 'NONE'
}

export interface User {
    id: string;
    name: string;
    role: Role;
    email: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    lastLogin: string;        // ISO date string or formatted date
    createdAt?: string;       // ISO date string - when user signed up
    permissions?: string[];
    children?: string[];      // Array of Student User IDs (for Parents)

    // Profile Fields
    avatar?: string;          // Avatar emoji or image URL
    displayName?: string;     // Optional display name override
    grades?: string[];        // Student's grade levels (can select multiple)
    bio?: string;             // Short bio/description
    dailyGoal?: number;       // Target number of skills to complete daily

    // Token Management
    subscriptionTier?: string; // 'free', 'basic', 'pro'
    tokenUsage?: number;
    quotaResetDate?: string;   // ISO Date
    phone?: string;         // Contact phone number
    preferences?: string[]; // Learning preferences or interests

    // Performance Stats (Optimized)
    stats?: {
        totalQuestions: number;
        correctQuestions: number;
        skillsMastered: number;
        streak: number;
        lastActivityDate: number;
    };
}
