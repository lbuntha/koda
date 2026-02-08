import { SkillRank } from '@types';
import { save, getById } from '@lib/firestore';

// --- Mastery Configuration ---

const COLLECTION = 'settings';

export const DEFAULT_SKILL_RANKS: SkillRank[] = [
    { name: 'Beginner', threshold: 0, icon: '🌱', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', description: 'Just starting out' },
    { name: 'Novice', threshold: 100, icon: '🥉', color: 'text-amber-700 bg-amber-50 border-amber-200', description: 'Getting the hang of it' },
    { name: 'Apprentice', threshold: 300, icon: '🥈', color: 'text-slate-500 bg-slate-50 border-slate-200', description: 'Consistent practice' },
    { name: 'Scholar', threshold: 600, icon: '🥇', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', description: 'High proficiency' },
    { name: 'Master', threshold: 1000, icon: '👑', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', description: 'True expert status' }
];

// Helper to wrap settings in an object with an ID for Firestore
interface SettingsDoc<T> {
    id: string;
    data: T;
}

export const getSkillRanks = async (): Promise<SkillRank[]> => {
    const doc = await getById<SettingsDoc<SkillRank[]>>(COLLECTION, 'skill_ranks');
    if (!doc) {
        await saveSkillRanks(DEFAULT_SKILL_RANKS);
        return DEFAULT_SKILL_RANKS;
    }
    return doc.data;
};

export const saveSkillRanks = async (ranks: SkillRank[]): Promise<void> => {
    await save(COLLECTION, { id: 'skill_ranks', data: ranks });
};

// Synchronous helpers for local calculations (using defaults or cached if needed, 
// but for now we'll rely on the components passing the ranks in)
export const getMasteryThreshold = (ranks: SkillRank[] = DEFAULT_SKILL_RANKS): number => {
    return ranks[ranks.length - 1].threshold;
};

export const getSkillRank = (currentPoints: number, ranks: SkillRank[] = DEFAULT_SKILL_RANKS): SkillRank => {
    const sortedRanks = [...ranks].sort((a, b) => b.threshold - a.threshold);
    return sortedRanks.find(r => currentPoints >= r.threshold) || ranks[0];
};

export const getNextRank = (currentPoints: number, ranks: SkillRank[] = DEFAULT_SKILL_RANKS): SkillRank | null => {
    const sortedRanks = [...ranks].sort((a, b) => a.threshold - b.threshold);
    return sortedRanks.find(r => r.threshold > currentPoints) || null;
};

// --- Global Settings ---

export interface GlobalSettings {
    baseMasteryPoints: number;
    standardPenaltyPoints: number;
    streakBonus: number;
    mediumMultiplier: number;
    hardMultiplier: number;
    speedBonusFast: number;
    speedBonusStandard: number;
    // Accuracy Settings
    minAccuracyThreshold: number; // e.g. 50%
    accuracyMaxPoints: number;    // Points for 100% accuracy
}

export const DEFAULT_SETTINGS: GlobalSettings = {
    baseMasteryPoints: 100,
    standardPenaltyPoints: 10,
    streakBonus: 5,
    mediumMultiplier: 1.5,
    hardMultiplier: 2.0,
    speedBonusFast: 25,
    speedBonusStandard: 10,
    minAccuracyThreshold: 60,
    accuracyMaxPoints: 100
};

export const getGlobalSettings = async (): Promise<GlobalSettings> => {
    const doc = await getById<SettingsDoc<GlobalSettings>>(COLLECTION, 'global_settings');
    if (!doc) {
        await saveGlobalSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }
    return doc.data;
};

export const saveGlobalSettings = async (settings: GlobalSettings): Promise<void> => {
    await save(COLLECTION, { id: 'global_settings', data: settings });
};

// --- System Configuration ---

export interface SubjectConfig {
    name: string;
    icon: string; // Lucide icon name like 'Calculator', 'FlaskConical'
    color: string; // Tailwind color like 'indigo', 'emerald', 'rose'
    imageUrl?: string; // Optional custom image URL
}

export interface SystemConfig {
    grades: GradeConfig[];
    subjects: string[]; // Keep for backward compatibility
    subjectConfigs?: SubjectConfig[];
    // gradeDefinitions removed - merged into grades
    minQuestionsPerQuiz: number;
    maxQuestionsPerQuiz: number;
    questionsToMasterSkill: number;
    defaultAiInstruction: string;
    geminiModel: string;
    apiKey?: string; // Optional override for Gemini API Key
    tokenUsage: { // Default limits per role
        teacher: number;
        parent: number;
        student: number;
        kid: number;
    };
    subscriptionTiers: SubscriptionTier[];
    questionTypes: string[];
    defaultMasteryRequirements: {
        type: 'SCORE' | 'QUESTIONS';
        value: number;
        minAccuracy?: number;
        isPercentage?: boolean;
    };
    /** Custom AI prompt overrides per question type ID */
    questionTypePrompts?: {
        [key: string]: string;
    };
}

export interface SubscriptionTier {
    id: string;
    name: string;
    price: number;
    tokenQuota: number; // Monthly token allowance
    maxRequestTokens: number; // Max tokens per single request for this tier
    maxChildren?: number; // Max children allowed for this tier
    features: string[];
}

export const DEFAULT_SUBJECT_CONFIGS: SubjectConfig[] = [
    { name: 'Math', icon: 'Calculator', color: 'indigo' },
    { name: 'Science', icon: 'FlaskConical', color: 'emerald' },
    { name: 'English', icon: 'BookOpen', color: 'amber' },
    { name: 'History', icon: 'Landmark', color: 'orange' },
    { name: 'Geography', icon: 'Globe', color: 'sky' },
    { name: 'Computer Science', icon: 'Code', color: 'purple' },
    { name: 'Language Arts', icon: 'PenLine', color: 'rose' },
    { name: 'Social Studies', icon: 'Landmark', color: 'orange' },
];

export interface GradeConfig {
    id: string;
    label: string;
    shortLabel: string;
    description: string;
    color: string;
    category?: string; // e.g. "Early Childhood", "Elementary"
    subjects: string[];
}

export const DEFAULT_GRADE_DEFINITIONS: GradeConfig[] = [
    {
        id: 'Pre-K',
        label: 'Pre-K',
        shortLabel: 'P',
        description: 'Foundations of counting and letter names.',
        color: 'cyan',
        category: 'Early Childhood',
        subjects: ['Math', 'Language Arts']
    },
    {
        id: 'Kindergarten',
        label: 'Kindergarten',
        shortLabel: 'K',
        description: 'Shapes, sounds, plants, communities.',
        color: 'orange',
        category: 'Early Childhood',
        subjects: ['Math', 'Language Arts', 'Science', 'Social Studies']
    },
    {
        id: 'Grade 1',
        label: 'First Grade',
        shortLabel: '1',
        description: 'Addition, vowels, light, sound, rules.',
        color: 'emerald',
        category: 'Elementary',
        subjects: ['Math', 'Language Arts', 'Science', 'Social Studies']
    },
    {
        id: 'Grade 2',
        label: 'Second Grade',
        shortLabel: '2',
        description: 'Place-value, plurals, history figures.',
        color: 'rose',
        category: 'Elementary',
        subjects: ['Math', 'Language Arts', 'Science', 'Social Studies']
    },
    {
        id: 'Grade 3',
        label: 'Third Grade',
        shortLabel: '3',
        description: 'Multiplication, graphs, weather, geography.',
        color: 'sky',
        category: 'Elementary',
        subjects: ['Math', 'Language Arts', 'Science', 'Social Studies']
    },
    {
        id: 'Grade 4',
        label: 'Fourth Grade',
        shortLabel: '4',
        description: 'Fractions, government, rock layers.',
        color: 'purple',
        category: 'Elementary',
        subjects: ['Math', 'Language Arts', 'Science', 'Social Studies']
    }
];

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
    grades: DEFAULT_GRADE_DEFINITIONS,
    subjects: ['Math', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Language Arts', 'Social Studies'],
    subjectConfigs: DEFAULT_SUBJECT_CONFIGS,
    minQuestionsPerQuiz: 3,
    maxQuestionsPerQuiz: 20,
    questionsToMasterSkill: 10,
    defaultAiInstruction: "Ensure questions are age-appropriate, encouraging, and free of bias.",
    geminiModel: "gemini-2.0-flash",
    tokenUsage: {
        teacher: 2048,
        parent: 1024,
        student: 1024,
        kid: 512
    },
    subscriptionTiers: [
        { id: 'free', name: 'Free Starter', price: 0, tokenQuota: 10000, maxRequestTokens: 1024, maxChildren: 1, features: ['Basic Quizzes'] },
        { id: 'basic', name: 'Basic Learner', price: 5, tokenQuota: 100000, maxRequestTokens: 2048, maxChildren: 3, features: ['Extended Context', 'Priority Support'] },
        { id: 'pro', name: 'Pro Scholar', price: 15, tokenQuota: 500000, maxRequestTokens: 4096, maxChildren: 10, features: ['Reasoning Models', 'Review History'] }
    ],
    questionTypes: [
        "Multiple Choice",
        "Fill In",
        "True/False",
        "Visual Counter",
        "Vertical Math",
        "Direct Input"
    ],
    defaultMasteryRequirements: {
        type: 'QUESTIONS',
        value: 10,
        minAccuracy: 60
    }
};

export const getSystemConfig = async (): Promise<SystemConfig> => {
    const doc = await getById<SettingsDoc<any>>(COLLECTION, 'system_config'); // Use any to handle migration
    if (!doc) {
        await saveSystemConfig(DEFAULT_SYSTEM_CONFIG);
        return DEFAULT_SYSTEM_CONFIG;
    }

    const data = doc.data;

    // Migration: If grades is array of strings, map to objects
    if (Array.isArray(data.grades) && typeof data.grades[0] === 'string') {
        const stringGrades = data.grades as unknown as string[];
        data.grades = stringGrades.map(g => {
            // Try to find default config for this grade ID
            const def = DEFAULT_GRADE_DEFINITIONS.find(d => d.id === g);
            if (def) return def;

            // Fallback for unknown grade strings
            return {
                id: g,
                label: g,
                shortLabel: g.charAt(0).toUpperCase(),
                description: '',
                color: 'slate',
                category: 'Other',
                subjects: DEFAULT_SUBJECT_CONFIGS.map(s => s.name)
            };
        });
    }

    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_SYSTEM_CONFIG, ...data };
};

export const saveSystemConfig = async (config: SystemConfig): Promise<void> => {
    await save(COLLECTION, { id: 'system_config', data: config });
};

export const addSystemOption = async (type: 'grades' | 'subjects', value: string): Promise<void> => {
    const config = await getSystemConfig();
    if (!config[type].find((item: any) => typeof item === 'string' ? item === value : item.id === value)) {
        // This helper is getting tricky with mixed types. 
        // For now, if adding a grade via this legacy helper, we might need a full object.
        // But this tool call suggests simple string addition.
        // We'll skip implementation update for addSystemOption/removeSystemOption for grades for now 
        // as they are likely used by older admin panels.
        // Ideally we refactor those too, but let's stick to the type fix first.
        if (type === 'subjects') {
            config.subjects.push(value);
            // Ensure subjectConfigs exists
            if (!config.subjectConfigs) config.subjectConfigs = [];
            // Add default config if not exists
            if (!config.subjectConfigs.find(c => c.name === value)) {
                config.subjectConfigs.push({
                    name: value,
                    icon: 'BookOpen',
                    color: DEFAULT_SUBJECT_CONFIGS[config.subjectConfigs.length % DEFAULT_SUBJECT_CONFIGS.length].color
                });
            }
            await saveSystemConfig(config);
        } else if (type === 'grades') {
            // Create a default grade config
            const newGrade: GradeConfig = {
                id: value,
                label: value,
                shortLabel: value.charAt(0).toUpperCase(), // specific logic for short label could be improved later
                description: '',
                color: 'slate',
                category: 'Other',
                subjects: DEFAULT_SUBJECT_CONFIGS.map(s => s.name)
            };
            config.grades.push(newGrade);
            await saveSystemConfig(config);
        }
    }
};

export const removeSystemOption = async (type: 'grades' | 'subjects', value: string): Promise<void> => {
    const config = await getSystemConfig();
    if (type === 'subjects') {
        config.subjects = config.subjects.filter(item => item !== value);
        await saveSystemConfig(config);
    } else if (type === 'grades') {
        config.grades = config.grades.filter(g => g.id !== value);
        await saveSystemConfig(config);
    }
};
