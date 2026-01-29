import React from 'react';
import { Delete } from 'lucide-react';

interface NumpadProps {
    onInput: (value: string) => void;
    onDelete: () => void;
    onClear: () => void;
    disabled?: boolean;
    className?: string;
}

interface NumpadButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'red' | 'ghost';
}

const NumpadButton: React.FC<NumpadButtonProps> = ({ children, onClick, disabled, className = "", variant = "default" }) => {
    const baseStyle = "w-full aspect-[1.3] sm:aspect-[1.1] lg:aspect-square rounded-xl sm:rounded-2xl text-2xl sm:text-3xl font-bold transition-all active:scale-95 flex items-center justify-center select-none touch-manipulation transform duration-100";

    const variants = {
        default: "bg-white text-slate-700 shadow-[0_4px_0_0_rgb(203,213,225)] active:translate-y-[4px] active:shadow-none border border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
        red: "bg-rose-50 text-rose-500 shadow-[0_4px_0_0_rgb(254,205,211)] active:translate-y-[4px] active:shadow-none border border-rose-100 hover:bg-rose-100",
        ghost: "text-slate-300 hover:text-rose-500 active:scale-95 transition-all"
    };

    const style = variants[variant] || variants.default;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${style} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

export const Numpad: React.FC<NumpadProps> = ({ onInput, onDelete, onClear, disabled, className = "" }) => {
    return (
        <div className={`w-full max-w-[280px] sm:max-w-[380px] lg:max-w-none bg-white/40 p-3 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 shadow-xl shadow-indigo-100/50 backdrop-blur-md ${className}`}>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                    <NumpadButton
                        key={num}
                        onClick={() => onInput(num.toString())}
                        disabled={disabled}
                    >
                        {num}
                    </NumpadButton>
                ))}
                <NumpadButton onClick={onDelete} variant="red" disabled={disabled}>
                    <Delete className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                </NumpadButton>
                <NumpadButton onClick={() => onInput('0')} disabled={disabled}>0</NumpadButton>
                <NumpadButton onClick={onClear} variant="ghost" disabled={disabled} className="font-mono text-xl">
                    C
                </NumpadButton>
            </div>
        </div>
    );
};
