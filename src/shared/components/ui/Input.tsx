import React from 'react';
import { useTheme } from '@theme/index';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const inputStyle = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'
        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500';

    const labelStyle = isDark ? 'text-slate-300' : 'text-slate-700';

    return (
        <div className="w-full">
            {label && (
                <label className={`block text-sm font-medium mb-1 ${labelStyle}`}>
                    {label}
                </label>
            )}
            <input
                className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${inputStyle} ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    className = '',
    ...props
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const selectStyle = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-indigo-500'
        : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500';

    const labelStyle = isDark ? 'text-slate-300' : 'text-slate-700';

    return (
        <div className="w-full">
            {label && (
                <label className={`block text-sm font-medium mb-1 ${labelStyle}`}>
                    {label}
                </label>
            )}
            <select
                className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selectStyle} ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Input;
