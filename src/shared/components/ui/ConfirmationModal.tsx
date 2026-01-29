import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    isDanger?: boolean;
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    isDanger = false,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                <div className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        {isDanger ? <AlertTriangle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                        <Button
                            className={`flex-1 ${isDanger ? 'bg-red-600 hover:bg-red-700' : ''}`}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
