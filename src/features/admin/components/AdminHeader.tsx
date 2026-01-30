// AdminHeader - Extracted header component
import React from 'react';
import { Menu } from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
    activeTab: AdminTab;
    onOpenMobileMenu: () => void;
}

const TAB_TITLES: Record<AdminTab, string> = {
    DASHBOARD: 'System Overview',
    USERS: 'User Management',
    SETTINGS: 'Platform Settings',
    LIBRARY: 'Component Library Management',
    LOGS: 'Usage Logs'
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
    activeTab,
    onOpenMobileMenu
}) => {
    return (
        <header className="h-16 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 transition-colors duration-300">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <button
                    onClick={onOpenMobileMenu}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">
                    {TAB_TITLES[activeTab]}
                </h2>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    System Operational
                </div>
                <div className="sm:hidden w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
        </header>
    );
};
