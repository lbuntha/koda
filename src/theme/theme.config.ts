// Theme color tokens and configuration - Cosmic Explorer Theme
// Designed for Koda: Tech Education Platform for ages 6-18
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
    // Base
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;

    // Primary - Electric Indigo
    primary: string;
    primaryForeground: string;
    primaryHover: string;

    // Secondary - Cyan (Tech/Discovery feel)
    secondary: string;
    secondaryForeground: string;

    // Accent colors
    accent: string;
    accentForeground: string;

    // Semantic
    destructive: string;
    destructiveForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;

    // Borders & Muted
    border: string;
    input: string;
    ring: string;
    muted: string;
    mutedForeground: string;

    // Gamification tokens
    xp: string;
    xpGlow: string;
    streak: string;
    streakGlow: string;
    badge: string;
    badgeGlow: string;
}

export interface ThemeConfig {
    light: ThemeColors;
    dark: ThemeColors;
}

export const themeConfig: ThemeConfig = {
    light: {
        // Base - Sky tinted for friendly feel
        background: '#f0f9ff',
        foreground: '#0f172a',
        card: '#ffffff',
        cardForeground: '#0f172a',

        // Primary - Electric Indigo
        primary: '#6366f1',
        primaryForeground: '#ffffff',
        primaryHover: '#4f46e5',

        // Secondary - Cyan (tech/discovery)
        secondary: '#06b6d4',
        secondaryForeground: '#ffffff',

        // Accent - Purple (creativity)
        accent: '#a855f7',
        accentForeground: '#ffffff',

        // Semantic
        destructive: '#ef4444',
        destructiveForeground: '#ffffff',
        success: '#10b981',
        successForeground: '#ffffff',
        warning: '#f59e0b',
        warningForeground: '#ffffff',

        // Borders & Muted
        border: '#e0e7ff',
        input: '#e0e7ff',
        ring: '#6366f1',
        muted: '#f1f5f9',
        mutedForeground: '#64748b',

        // Gamification - Amber/Gold theme
        xp: '#f59e0b',
        xpGlow: 'rgba(245, 158, 11, 0.4)',
        streak: '#f97316',
        streakGlow: 'rgba(249, 115, 22, 0.4)',
        badge: '#eab308',
        badgeGlow: 'rgba(234, 179, 8, 0.4)',
    },
    dark: {
        // Base - Deep Space
        background: '#0c1222',
        foreground: '#f8fafc',
        card: '#1a2234',
        cardForeground: '#f8fafc',

        // Primary - Soft Indigo
        primary: '#818cf8',
        primaryForeground: '#0f172a',
        primaryHover: '#a5b4fc',

        // Secondary - Bright Cyan
        secondary: '#22d3ee',
        secondaryForeground: '#0f172a',

        // Accent - Light Purple
        accent: '#c084fc',
        accentForeground: '#0f172a',

        // Semantic
        destructive: '#f87171',
        destructiveForeground: '#0f172a',
        success: '#34d399',
        successForeground: '#0f172a',
        warning: '#fbbf24',
        warningForeground: '#0f172a',

        // Borders & Muted
        border: '#2d3a50',
        input: '#2d3a50',
        ring: '#818cf8',
        muted: '#1e293b',
        mutedForeground: '#94a3b8',

        // Gamification - Bright Gold in dark mode
        xp: '#fbbf24',
        xpGlow: 'rgba(251, 191, 36, 0.5)',
        streak: '#fb923c',
        streakGlow: 'rgba(251, 146, 60, 0.5)',
        badge: '#facc15',
        badgeGlow: 'rgba(250, 204, 21, 0.5)',
    },
};

// Role-specific accent colors - Age appropriate theming
export const roleColors = {
    admin: {
        light: {
            accent: '#475569',
            accentBg: '#f1f5f9',
            gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
        },
        dark: {
            accent: '#94a3b8',
            accentBg: '#1e293b',
            gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
        },
    },
    teacher: {
        light: {
            accent: '#6366f1',
            accentBg: '#eef2ff',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
        dark: {
            accent: '#818cf8',
            accentBg: '#312e81',
            gradient: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
        },
    },
    student: {
        // Cyan/Teal - tech discovery feel, appeals to 6-18 age range
        light: {
            accent: '#06b6d4',
            accentBg: '#ecfeff',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        },
        dark: {
            accent: '#22d3ee',
            accentBg: '#164e63',
            gradient: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
        },
    },
    parent: {
        light: {
            accent: '#a855f7',
            accentBg: '#faf5ff',
            gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
        },
        dark: {
            accent: '#c084fc',
            accentBg: '#581c87',
            gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
        },
    },
};

// Achievement badge colors (Bronze → Diamond progression)
export const achievementColors = {
    bronze: {
        bg: '#92400e',
        text: '#fef3c7',
        glow: 'rgba(146, 64, 14, 0.4)',
    },
    silver: {
        bg: '#6b7280',
        text: '#f9fafb',
        glow: 'rgba(107, 114, 128, 0.4)',
    },
    gold: {
        bg: '#ca8a04',
        text: '#fefce8',
        glow: 'rgba(202, 138, 4, 0.5)',
    },
    diamond: {
        bg: '#0ea5e9',
        text: '#f0f9ff',
        glow: 'rgba(14, 165, 233, 0.5)',
    },
};
