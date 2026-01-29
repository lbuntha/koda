// RoleSelectionCard - Component for users to select their role after registration
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { User, Role } from '@types';
import { updateUser } from '@stores';
import { logoutUser } from '@auth';

interface RoleSelectionCardProps {
    user: User | null;
}

export const RoleSelectionCard: React.FC<RoleSelectionCardProps> = ({ user }) => {
    const handleRoleSelect = async (role: Role) => {
        if (!user) return;
        const updated = { ...user, role };
        await updateUser(updated);
        window.location.reload();
    };

    return (
        <div className="text-center pt-20 max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Your Setup</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
                    Account created for <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong>. <br />
                    Please verify your role to access the dashboard.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => handleRoleSelect(Role.ADMIN)}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        I am an Administrator
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleRoleSelect(Role.TEACHER)}
                            className="py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                        >
                            Teacher
                        </button>
                        <button
                            onClick={() => handleRoleSelect(Role.STUDENT)}
                            className="py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                        >
                            Student
                        </button>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={logoutUser} className="text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                        Sign Out & Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};
