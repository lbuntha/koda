import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@theme/index';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };

    const bgStyle = isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200';

    const titleStyle = isDark ? 'text-slate-100' : 'text-slate-900';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full ${sizes[size]} ${bgStyle} rounded-xl shadow-2xl border`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <h2 className={`text-lg font-semibold ${titleStyle}`}>{title}</h2>
                        <button
                            onClick={onClose}
                            className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
