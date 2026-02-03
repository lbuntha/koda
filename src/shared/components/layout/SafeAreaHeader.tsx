// SafeAreaHeader - A container that handles iPhone notch/safe-area padding consistently
import React from 'react';

interface SafeAreaHeaderProps {
    children: React.ReactNode;
    className?: string;
    /** Whether to use dark background (for dark mode headers like Admin sidebar) */
    dark?: boolean;
    /** Whether to add a bottom border */
    withBorder?: boolean;
    /** Whether this header should be sticky */
    sticky?: boolean;
}

/**
 * SafeAreaHeader provides consistent safe-area-inset-top padding for headers/toolbars.
 * This ensures content is pushed below the iPhone notch on all pages.
 * 
 * Example usage:
 * <SafeAreaHeader sticky withBorder>
 *   <button>Menu</button>
 *   <h1>Page Title</h1>
 * </SafeAreaHeader>
 */
export const SafeAreaHeader: React.FC<SafeAreaHeaderProps> = ({
    children,
    className = '',
    dark = false,
    withBorder = true,
    sticky = true
}) => {
    const baseClasses = `
        pt-[max(0.5rem,env(safe-area-inset-top))]
        ${sticky ? 'sticky top-0 z-20' : ''}
        ${withBorder ? 'border-b' : ''}
        ${dark
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        }
    `.replace(/\s+/g, ' ').trim();

    return (
        <div className={`${baseClasses} ${className}`}>
            {children}
        </div>
    );
};

/**
 * SafeAreaContainer - A wrapper for full-screen views that need safe-area padding at the top
 * Use this for modal/fullscreen game views that are position:fixed
 */
interface SafeAreaContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`fixed inset-0 flex flex-col pt-[max(0.75rem,env(safe-area-inset-top))] ${className}`}>
            {children}
        </div>
    );
};
