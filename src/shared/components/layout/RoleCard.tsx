import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Role } from '@types';
import { useTheme } from '@theme/index';

interface RoleCardProps {
    role: Role;
    icon: LucideIcon;
    title: string;
    description: string;
    onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
    role,
    icon: Icon,
    title,
    description,
    onClick,
}) => {
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    // Role-specific colors
    const roleColors: Record<Role, { border: string; text: string; bg: string }> = isDark ? {
        [Role.ADMIN]: { border: 'hover:border-slate-500', text: 'text-slate-300', bg: 'bg-slate-800/50' },
        [Role.TEACHER]: { border: 'hover:border-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-900/20' },
        [Role.STUDENT]: { border: 'hover:border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-900/20' },
        [Role.PARENT]: { border: 'hover:border-purple-500', text: 'text-purple-400', bg: 'bg-purple-900/20' },
        [Role.NONE]: { border: '', text: '', bg: '' },
    } : {
        [Role.ADMIN]: { border: 'hover:border-slate-800', text: 'text-slate-800', bg: 'bg-slate-50' },
        [Role.TEACHER]: { border: 'hover:border-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
        [Role.STUDENT]: { border: 'hover:border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
        [Role.PARENT]: { border: 'hover:border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
        [Role.NONE]: { border: '', text: '', bg: '' },
    };

    const colors = roleColors[role];
    const baseStyle = isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200';

    const titleStyle = isDark ? 'text-slate-100' : 'text-slate-800';
    const descStyle = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl text-left ${baseStyle} ${colors.border}`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            <Icon className={`w-12 h-12 mb-4 ${colors.text}`} />
            <h3 className={`text-xl font-bold mb-2 ${titleStyle}`}>{title}</h3>
            <p className={`text-sm leading-relaxed ${descStyle}`}>{description}</p>
        </button>
    );
};

export default RoleCard;
