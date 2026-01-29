// AdminSidebar - Extracted sidebar navigation component
import React from 'react';
import {
    LayoutDashboard, Users, Settings, X,
    ShieldCheck, ArrowRight, Library, Eye
} from 'lucide-react';

export type AdminTab = 'DASHBOARD' | 'USERS' | 'LIBRARY' | 'SETTINGS' | 'LOGS';

interface AdminSidebarProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    isMobileMenuOpen: boolean;
    onCloseMobileMenu: () => void;
    onExit: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    onTabChange,
    isMobileMenuOpen,
    onCloseMobileMenu,
    onExit
}) => {
    const NavButton = ({ tab, icon: Icon, label }: {
        tab: AdminTab;
        icon: React.ComponentType<{ className?: string }>;
        label: string
    }) => (
        <button
            onClick={() => { onTabChange(tab); onCloseMobileMenu(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon className="w-4 h-4" /> {label}
        </button>
    );

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}>
            {/* Header */}
            <div className="p-6 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin<span className="text-indigo-400">Panel</span></span>
                </div>
                <button
                    onClick={onCloseMobileMenu}
                    className="md:hidden text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                <NavButton tab="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
                <NavButton tab="USERS" icon={Users} label="User Management" />
                <NavButton tab="LIBRARY" icon={Library} label="Skill Templates" />
                <NavButton tab="LOGS" icon={Eye} label="Usage Logs" />
                <NavButton tab="SETTINGS" icon={Settings} label="System Configuration" />
            </div>

            {/* Exit Button */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onExit}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm font-medium transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Exit Admin
                </button>
            </div>
        </div>
    );
};
