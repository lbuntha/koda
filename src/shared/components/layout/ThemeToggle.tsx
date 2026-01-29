import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '@theme/index';

interface ThemeToggleProps {
    showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabels = false }) => {
    const { mode, setMode, resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
        { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
        { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
        { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
    ];

    const bgStyle = isDark ? 'bg-slate-800' : 'bg-slate-100';
    const activeStyle = isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-900 shadow-sm';
    const inactiveStyle = isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700';

    return (
        <div className={`inline-flex rounded-lg p-1 ${bgStyle}`}>
            {modes.map(({ value, icon, label }) => (
                <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === value ? activeStyle : inactiveStyle
                        }`}
                    title={label}
                >
                    {icon}
                    {showLabels && <span>{label}</span>}
                </button>
            ))}
        </div>
    );
};

export default ThemeToggle;
