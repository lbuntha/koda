import React, { useState, useRef, useEffect } from 'react';
import {
    LogOut,
    User as UserIcon,
    Settings,
    ChevronDown,
    Sun,
    Moon,
    Monitor,
    Shield
} from 'lucide-react';
import { Role, User } from '@types';
import { useTheme } from '@theme/index';
import { Avatar } from '@shared/components/ui';

interface ProfileMenuProps {
    user?: User | null;
    currentRole: Role;
    onExit: () => void;
    onProfileClick?: () => void;
    roleConfig: {
        label: string;
        avatar: string;
        gradient: string;
    };
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
    user,
    currentRole,
    onExit,
    onProfileClick,
    roleConfig
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { mode, setMode, resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleProfileClick = () => {
        setIsOpen(false);
        if (onProfileClick) onProfileClick();
    };

    const handleLogout = () => {
        setIsOpen(false);
        onExit();
    };

    // Sub-component for Theme Option
    const ThemeOption = ({ theme, icon: Icon, label }: { theme: 'light' | 'dark' | 'system', icon: any, label: string }) => (
        <button
            onClick={() => setMode(theme)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${mode === theme
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
        >
            <Icon className="w-4 h-4 mb-1" />
            <span className="text-[10px]">{label}</span>
        </button>
    );

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className={`
                    flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl transition-all
                    ${isOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}
                    ${isDark
                        ? 'hover:bg-slate-800'
                        : 'hover:bg-slate-100'
                    }
                `}
            >
                {/* Avatar */}
                <Avatar
                    src={roleConfig.avatar}
                    role={currentRole}
                    size="md"
                    className="border-2 border-transparent"
                />

                {/* Name & Role - Hidden on mobile */}
                <div className="hidden sm:flex flex-col items-start text-left">
                    <span className={`text-sm font-semibold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {roleConfig.label}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {currentRole === Role.ADMIN ? 'Administrator' :
                            currentRole === Role.TEACHER ? 'Teacher' :
                                currentRole === Role.PARENT ? 'Parent' : 'Student'}
                    </span>
                </div>

                <ChevronDown className={`w-4 h-4 hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* User Info Header (Mobile/Compact) */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {user?.displayName || user?.name || roleConfig.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                        </p>
                    </div>

                    <div className="p-2 space-y-1">
                        {/* Profile Link (Student & Parent) */}
                        {(currentRole === Role.STUDENT || currentRole === Role.PARENT || currentRole === Role.TEACHER) && (
                            <button
                                onClick={handleProfileClick}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <span>My Profile</span>
                            </button>
                        )}

                        {/* Admin/Settings Link placeholder */}
                        {currentRole === Role.ADMIN && (
                            <button
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <span>Admin Settings</span>
                            </button>
                        )}

                        {/* Theme Toggle Section */}
                        <div className="px-1 py-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-1">Appearance</p>
                            <div className="flex gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                                <ThemeOption theme="light" icon={Sun} label="Light" />
                                <ThemeOption theme="dark" icon={Moon} label="Dark" />
                                <ThemeOption theme="system" icon={Monitor} label="Auto" />
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
