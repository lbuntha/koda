// UserTable - User listing table for Admin
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { User, Role } from '@types';
import { Badge } from '@shared/components/ui';

// Helper function to format ISO date strings to readable format
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';

    // Handle legacy "Just now" strings
    if (dateString === 'Just now' || dateString === 'Never') {
        return dateString;
    }

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Show relative time for recent dates
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        // Format as date for older entries
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    } catch {
        return dateString;
    }
};

interface UserTableProps {
    users: User[];
    selectedIds: Set<string>;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    onSelectAll: (checked: boolean) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
    users, selectedIds, onEdit, onDelete, onToggle, onSelectAll
}) => {
    const allSelected = users.length > 0 && users.every(u => selectedIds.has(u.id));
    const someSelected = users.some(u => selectedIds.has(u.id)) && !allSelected;

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-3 w-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={input => { if (input) input.indeterminate = someSelected; }}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                            </div>
                        </th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role & Plan</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Token Usage</th>
                        <th className="px-6 py-3">Permissions</th>
                        <th className="px-6 py-3">Last Login</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-8 text-slate-400">No users found.</td></tr>
                    ) : (
                        users.map(user => {
                            const isSelected = selectedIds.has(user.id);
                            return (
                                <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggle(user.id)}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                                                {user.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <Badge color={user.role === Role.TEACHER ? 'blue' : user.role === Role.STUDENT ? 'green' : user.role === Role.ADMIN ? 'red' : 'purple'}>
                                                {user.role}
                                            </Badge>

                                            {/* Subscription Badge */}
                                            {(user.role === Role.STUDENT || user.role === Role.TEACHER) && (
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border leading-none self-start
                                                    ${(user.subscriptionTier || 'free') === 'pro' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                                        (user.subscriptionTier || 'free') === 'basic' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                            'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {(user.subscriptionTier || 'free')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Status */}
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                user.status === 'Inactive' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                                    'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Inactive' ? 'bg-slate-400' : 'bg-rose-500'}`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Token Usage - New Column Content */}
                                        <div className="text-xs">
                                            <div className="font-medium text-slate-700 dark:text-slate-300">
                                                {(user.tokenUsage || 0).toLocaleString()} <span className="text-slate-400 dark:text-slate-500 font-normal">tokens</span>
                                            </div>
                                            {user.quotaResetDate && (
                                                <div className="text-[10px] text-slate-400" title={user.quotaResetDate}>
                                                    Resets: {new Date(user.quotaResetDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === Role.TEACHER && user.permissions && user.permissions.length > 0 ? (
                                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 cursor-help" title={user.permissions.join(', ')}>
                                                {user.permissions.length} Permissions
                                            </span>
                                        ) : user.role === Role.TEACHER ? (
                                            <span className="text-xs text-slate-400 italic">None</span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500" title={user.lastLogin}>
                                        {formatDate(user.lastLogin)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(user)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDelete(user.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};
