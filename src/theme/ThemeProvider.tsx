import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode, ThemeColors, themeConfig } from './theme.config';

interface ThemeContextValue {
    mode: ThemeMode;
    resolvedMode: 'light' | 'dark';
    colors: ThemeColors;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'edu_theme_mode';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

interface ThemeProviderProps {
    children: ReactNode;
    defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    defaultMode = 'system'
}) => {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
            return stored || defaultMode;
        }
        return defaultMode;
    });

    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const resolvedMode: 'light' | 'dark' = mode === 'system' ? systemTheme : mode;
    const colors = themeConfig[resolvedMode];

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Remove previous theme class
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedMode);

        // Apply CSS variables
        Object.entries(colors).forEach(([key, value]) => {
            const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssKey, value);
        });
    }, [resolvedMode, colors]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
        localStorage.setItem(STORAGE_KEY, newMode);
    };

    const toggleMode = () => {
        const nextMode = resolvedMode === 'light' ? 'dark' : 'light';
        setMode(nextMode);
    };

    return (
        <ThemeContext.Provider value={{ mode, resolvedMode, colors, setMode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeProvider;
