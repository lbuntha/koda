import React, { useEffect, useState } from 'react';
import { User, Role } from '@types';
import { getUsers, updateUser } from '@stores';
import { logoutUser } from '@features/auth/services/authService';
import { Avatar } from '@shared/components/ui';
import { Lock, Pencil } from 'lucide-react';
import { EditChildModal } from './EditChildModal';
import { ParentProfile } from './ParentProfile';

interface ProfileSelectorProps {
    parentUser: User;
    onSelectProfile: (userId: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ parentUser, onSelectProfile }) => {
    const [profiles, setProfiles] = useState<User[]>([]);
    const [isManaging, setIsManaging] = useState(false);
    const [editingChild, setEditingChild] = useState<User | null>(null);
    const [isParentProfileOpen, setIsParentProfileOpen] = useState(false);

    const loadProfiles = async () => {
        const allUsers = await getUsers();
        const children = allUsers.filter(u => parentUser.children?.includes(u.id));
        setProfiles([parentUser, ...children]);
    };

    useEffect(() => {
        loadProfiles();
    }, [parentUser]);

    const handleUpdateChild = async (childId: string, updates: Partial<User>) => {
        const child = profiles.find(p => p.id === childId);
        if (!child) return;

        await updateUser({ ...child, ...updates });
        await loadProfiles(); // Refresh list
    };

    const handleUpdateParent = async (updates: Partial<User>) => {
        await updateUser({ ...parentUser, ...updates });
        await loadProfiles();
        // Since parentUser prop might not update immediately if it comes from AuthContext upstream, 
        // rely on loadProfiles fetching fresh data.
        // We might need to reload the page or trigger a deeper refresh if the avatar/name of the logged in user changes significantly context-wide, 
        // but for this selector, local refresh is enough.
        window.dispatchEvent(new Event('user-profile-updated'));
    };

    const handleProfileClick = (user: User) => {
        if (isManaging) {
            if (user.role === Role.PARENT) {
                setIsParentProfileOpen(true);
            } else {
                setEditingChild(user);
            }
        } else {
            onSelectProfile(user.id);
        }
    };

    const getProfileColor = (index: number, role: Role) => {
        if (role === Role.PARENT) return 'bg-[#5c54ff]'; // Distinctive purple-blue for parent
        const colors = [
            'bg-[#FFC629]', // Yellow
            'bg-[#00D29D]', // Green/Teal
            'bg-[#FF5C8D]', // Pink
            'bg-[#36C5F0]', // Light Blue
        ];
        // Offset index by 1 to skip parent color logic if mixed, but here we separate
        return colors[(index - 1) % colors.length] || colors[0];
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col items-center justify-center p-4 md:p-6 animate-in fade-in duration-500 transition-colors">
            <h1 className="text-2xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8 md:mb-16 text-center tracking-tight">
                {isManaging ? "Manage Profiles" : "Who's learning today?"}
            </h1>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 max-w-5xl w-full">
                {profiles.map((user, index) => {
                    const bgColor = getProfileColor(index, user.role);

                    return (
                        <button
                            key={user.id}
                            onClick={() => handleProfileClick(user)}
                            className="group flex flex-col items-center gap-3 md:gap-4 transition-transform hover:scale-105 active:scale-95 outline-none relative"
                        >
                            <div className={`
                                relative w-32 h-40 sm:w-40 sm:h-48 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center
                                ${bgColor} shadow-xl dark:shadow-2xl overflow-hidden transition-all
                                ${isManaging ? 'ring-4 ring-offset-4 ring-offset-slate-900 ring-indigo-500/50 scale-95' : ''}
                            `}>
                                {/* Profile Content - Centered */}
                                <div className="flex flex-col items-center justify-center gap-2 w-full h-full p-4">
                                    <Avatar
                                        src={user.avatar}
                                        size="xl"
                                        shape="rounded"
                                        role={user.role}
                                        className={`w-16 h-16 sm:w-24 sm:h-24 text-2xl sm:text-4xl shadow-none ring-0 ${isManaging ? 'opacity-80' : ''}`}
                                    />
                                </div>

                                {/* Lock Icon for Parent (only in selection mode) */}
                                {user.role === Role.PARENT && !isManaging && (
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/90">
                                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                    </div>
                                )}

                                {/* Edit Icon overlay on hover or always visible in manage mode */}
                                {isManaging && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                            <Pencil className="w-5 h-5 text-slate-900" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <span className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white font-bold transition-colors">
                                {user.displayName || user.name.split(' ')[0]}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col items-center gap-4 mt-12 md:mt-20">
                <button
                    onClick={() => setIsManaging(!isManaging)}
                    className={`
                        px-6 sm:px-8 py-2 sm:py-3 border-2 font-bold tracking-widest text-xs sm:text-sm transition-all uppercase rounded-lg
                        ${isManaging
                            ? 'bg-white text-slate-900 border-white hover:bg-slate-200'
                            : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }
                    `}
                >
                    {isManaging ? "Done" : "Manage Profiles"}
                </button>

                <button
                    onClick={() => logoutUser()}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    Switch Account (Sign Out)
                </button>
            </div>

            {/* Edit Modals */}
            <EditChildModal
                isOpen={!!editingChild}
                onClose={() => setEditingChild(null)}
                child={editingChild}
                onSave={handleUpdateChild}
            // Allow deleting child profiles if needed, but safe to omit if not requested yet
            // onDelete={handleDeleteChild} 
            />

            <ParentProfile
                isOpen={isParentProfileOpen}
                onClose={() => setIsParentProfileOpen(false)}
                user={parentUser}
                onSave={handleUpdateParent}
            />
        </div>
    );
};
