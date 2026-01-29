import React from 'react';
import { Bell, User as UserIcon } from 'lucide-react';
import { Role, User } from '@types';
import { useTheme } from '@theme/index';
// import { ThemeToggle } from './ThemeToggle'; // Removed
import { ProfileMenu } from './ProfileMenu';
import { KodaLogo, KodaIcon } from '@shared/components/KodaLogo';

interface NavbarProps {
    currentRole: Role;
    onExit: () => void;
    user?: User | null;
    onProfileClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onExit, user, onProfileClick }) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const getRoleConfig = () => {
        // If user data is provided and matches current role, use their custom profile
        if (user && user.role === currentRole) {
            const baseConfig = {
                gradient: 'from-slate-400 to-slate-500',
                bgLight: 'bg-slate-100',
                bgDark: 'bg-slate-800',
                textLight: 'text-slate-600',
                textDark: 'text-slate-400',
            };

            // Enhance base config based on role for colors
            switch (currentRole) {
                case Role.TEACHER:
                    Object.assign(baseConfig, {
                        gradient: 'from-indigo-500 to-purple-500',
                        bgLight: 'bg-indigo-50',
                        bgDark: 'bg-indigo-900/30',
                        textLight: 'text-indigo-700',
                        textDark: 'text-indigo-300',
                    });
                    break;
                case Role.STUDENT:
                    Object.assign(baseConfig, {
                        gradient: 'from-emerald-500 to-teal-500',
                        bgLight: 'bg-emerald-50',
                        bgDark: 'bg-emerald-900/30',
                        textLight: 'text-emerald-700',
                        textDark: 'text-emerald-300',
                    });
                    break;
                case Role.PARENT:
                    Object.assign(baseConfig, {
                        gradient: 'from-purple-500 to-pink-500',
                        bgLight: 'bg-purple-50',
                        bgDark: 'bg-purple-900/30',
                        textLight: 'text-purple-700',
                        textDark: 'text-purple-300',
                    });
                    break;
                case Role.ADMIN:
                    Object.assign(baseConfig, {
                        gradient: 'from-slate-500 to-slate-600',
                        bgLight: 'bg-slate-100',
                        bgDark: 'bg-slate-800',
                        textLight: 'text-slate-700',
                        textDark: 'text-slate-300',
                    });
                    break;
            }

            return {
                label: user.displayName || user.name || 'User',
                avatar: user.avatar || (currentRole === Role.STUDENT ? '👨‍🎓' : '👤'),
                ...baseConfig
            };
        }

        switch (currentRole) {
            case Role.TEACHER:
                return {
                    label: 'Teacher',
                    gradient: 'from-indigo-500 to-purple-500',
                    bgLight: 'bg-indigo-50',
                    bgDark: 'bg-indigo-900/30',
                    textLight: 'text-indigo-700',
                    textDark: 'text-indigo-300',
                    avatar: '👨‍🏫'
                };
            case Role.STUDENT:
                return {
                    label: 'Student',
                    gradient: 'from-emerald-500 to-teal-500',
                    bgLight: 'bg-emerald-50',
                    bgDark: 'bg-emerald-900/30',
                    textLight: 'text-emerald-700',
                    textDark: 'text-emerald-300',
                    avatar: '👨‍🎓'
                };
            case Role.PARENT:
                return {
                    label: 'Parent',
                    gradient: 'from-purple-500 to-pink-500',
                    bgLight: 'bg-purple-50',
                    bgDark: 'bg-purple-900/30',
                    textLight: 'text-purple-700',
                    textDark: 'text-purple-300',
                    avatar: '👪'
                };
            case Role.ADMIN:
                return {
                    label: 'Admin',
                    gradient: 'from-slate-500 to-slate-600',
                    bgLight: 'bg-slate-100',
                    bgDark: 'bg-slate-800',
                    textLight: 'text-slate-700',
                    textDark: 'text-slate-300',
                    avatar: '⚙️'
                };
            default:
                return {
                    label: '',
                    gradient: 'from-slate-400 to-slate-500',
                    bgLight: 'bg-slate-100',
                    bgDark: 'bg-slate-800',
                    textLight: 'text-slate-600',
                    textDark: 'text-slate-400',
                    avatar: '👤'
                };
        }
    };

    const roleConfig = getRoleConfig();

    // Check if it's a student role - hide navbar on mobile for student
    const isStudent = currentRole === Role.STUDENT;

    return (
        <nav className={`
            ${isStudent ? 'hidden sm:block' : 'block'}
            sticky top-0 z-50 
            ${isDark
                ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50'
                : 'bg-white/95 backdrop-blur-xl border-b border-slate-100'
            }
        `}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="sm:hidden">
                        <KodaIcon size="sm" />
                    </div>
                    <div className="hidden sm:block">
                        <KodaLogo size="sm" animated />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Notification Bell - Hidden on mobile for students */}
                    {!isStudent && (
                        <button
                            className={`
                                relative p-2 rounded-xl transition-all
                                ${isDark
                                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }
                            `}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>
                    )}

                    {/* Profile Menu (Includes Theme & Logout) */}
                    <div className="flex items-center ml-1">
                        <ProfileMenu
                            user={user}
                            currentRole={currentRole}
                            onExit={onExit}
                            onProfileClick={onProfileClick}
                            roleConfig={roleConfig}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
