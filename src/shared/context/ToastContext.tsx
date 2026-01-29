// Toast Context - Global toast notification system
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast colors and icons
const toastConfig: Record<ToastType, {
    icon: typeof CheckCircle;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
}> = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        iconColor: 'text-emerald-500',
        titleColor: 'text-emerald-800'
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        iconColor: 'text-rose-500',
        titleColor: 'text-rose-800'
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-500',
        titleColor: 'text-amber-800'
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800'
    }
};

// Individual Toast Component
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${config.bgColor} ${config.borderColor} animate-slide-in`}
            role="alert"
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${config.titleColor}`}>{toast.title}</p>
                {toast.message && (
                    <p className="text-sm text-slate-600 mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// Toast Container Component
const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast
}) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>
    );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = toast.duration ?? 4000;

        setToasts(prev => [...prev, { ...toast, id }]);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    // Convenience methods
    const success = useCallback((title: string, message?: string) => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: 'error', title, message, duration: 6000 }); // Errors stay longer
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
