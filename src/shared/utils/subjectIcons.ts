// Subject Icons Utility - Maps subjects to Lucide icons
import {
    Calculator,
    Sigma,
    Ruler,
    FlaskConical,
    Atom,
    Microscope,
    Dna,
    BookOpen,
    BookText,
    Languages,
    PenLine,
    Landmark,
    Clock,
    ScrollText,
    Globe,
    Map,
    Compass,
    Palette,
    Brush,
    Music,
    Music2,
    Code,
    Binary,
    Laptop,
    Dumbbell,
    Trophy,
    Heart,
    Leaf,
    Sparkles,
    Star,
    Lightbulb,
    Brain,
    GraduationCap,
    School,
    type LucideIcon,
} from 'lucide-react';

/**
 * Mapping of subject names to their corresponding Lucide icons.
 * Use lowercase keys for consistent matching.
 */
export const subjectIcons: Record<string, LucideIcon> = {
    // Mathematics
    'math': Calculator,
    'mathematics': Calculator,
    'algebra': Sigma,
    'geometry': Ruler,
    'calculus': Sigma,
    'statistics': Calculator,
    'arithmetic': Calculator,

    // Sciences
    'science': FlaskConical,
    'physics': Atom,
    'chemistry': FlaskConical,
    'biology': Microscope,
    'anatomy': Dna,
    'ecology': Leaf,
    'astronomy': Star,
    'environmental': Leaf,

    // Languages & Literature
    'english': BookText,
    'language': Languages,
    'reading': BookOpen,
    'writing': PenLine,
    'literature': BookOpen,
    'grammar': BookText,
    'khmer': Languages,
    'french': Languages,
    'chinese': Languages,
    'spanish': Languages,
    'japanese': Languages,

    // Social Studies
    'history': Landmark,
    'geography': Globe,
    'civics': Landmark,
    'economics': Calculator,
    'social studies': Globe,
    'world history': Clock,
    'ancient history': ScrollText,

    // Arts
    'art': Palette,
    'visual arts': Brush,
    'music': Music,
    'band': Music2,
    'drama': Sparkles,
    'theater': Sparkles,
    'dance': Sparkles,

    // Technology
    'computer': Code,
    'computer science': Code,
    'programming': Binary,
    'coding': Code,
    'technology': Laptop,
    'ict': Laptop,
    'robotics': Binary,

    // Physical Education & Health
    'pe': Dumbbell,
    'physical education': Dumbbell,
    'sports': Trophy,
    'health': Heart,
    'nutrition': Heart,
    'wellness': Heart,

    // Other
    'philosophy': Brain,
    'psychology': Brain,
    'general': GraduationCap,
    'study skills': Lightbulb,
    'homeroom': School,
    'default': BookOpen,
} as const;

/**
 * Get the icon component for a given subject name.
 * Falls back to BookOpen if subject is not found.
 * 
 * @param subject - The subject name (case-insensitive)
 * @returns The Lucide icon component
 * 
 * @example
 * const Icon = getSubjectIcon('math');
 * <Icon className="w-5 h-5" />
 */
export const getSubjectIcon = (subject: string): LucideIcon => {
    const key = subject.toLowerCase().trim();
    return subjectIcons[key] || subjectIcons['default'];
};

/**
 * Get a color class for a given subject (for visual variety)
 * 
 * @param subject - The subject name
 * @returns Tailwind CSS color classes
 */
export const getSubjectColor = (subject: string): string => {
    const key = subject.toLowerCase().trim();

    const colorMap: Record<string, string> = {
        // Math - Blue
        'math': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'mathematics': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'algebra': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'geometry': 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',

        // Science - Green/Teal
        'science': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        'physics': 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
        'chemistry': 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
        'biology': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',

        // Languages - Purple
        'english': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        'language': 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
        'reading': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        'writing': 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',

        // History/Geography - Amber/Orange
        'history': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        'geography': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',

        // Arts - Pink/Rose
        'art': 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
        'music': 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',

        // Technology - Slate/Gray
        'computer': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        'programming': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',

        // PE/Health - Red
        'pe': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        'health': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };

    return colorMap[key] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

/**
 * Subject icon with badge component helper
 * Returns props for rendering a subject badge with icon
 */
export const getSubjectBadgeProps = (subject: string) => {
    return {
        Icon: getSubjectIcon(subject),
        colorClass: getSubjectColor(subject),
        label: subject,
    };
};
