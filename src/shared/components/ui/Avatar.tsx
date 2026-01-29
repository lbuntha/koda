import React from 'react';
import { Role } from '@types';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    role?: Role;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'rounded' | 'square' | 'none'; // New prop for shape control
    className?: string; // Allow custom overrides
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'Avatar',
    role = Role.STUDENT,
    size = 'md',
    shape = 'circle',
    className = ''
}) => {

    // Determine gradient based on role
    const getGradient = (r: Role) => {
        switch (r) {
            case Role.TEACHER: return 'from-indigo-500 to-purple-500';
            case Role.STUDENT: return 'from-emerald-500 to-teal-500';
            case Role.PARENT: return 'from-purple-500 to-pink-500';
            case Role.ADMIN: return 'from-slate-500 to-slate-600';
            default: return 'from-slate-400 to-slate-500';
        }
    };

    // Determine default emoji if no src
    const getDefaultEmoji = (r: Role) => {
        switch (r) {
            case Role.TEACHER: return '👨‍🏫';
            case Role.STUDENT: return '👨‍🎓';
            case Role.PARENT: return '👪';
            case Role.ADMIN: return '⚙️';
            default: return '👤';
        }
    };

    // Determine dimensions
    const getSizeClasses = (s: string) => {
        switch (s) {
            case 'sm': return 'w-6 h-6 text-xs';
            case 'md': return 'w-8 h-8 text-sm';
            case 'lg': return 'w-10 h-10 text-base';
            case 'xl': return 'w-16 h-16 text-2xl'; // For profile modal, etc if needed
            default: return 'w-8 h-8 text-sm';
        }
    };

    // Determine shape classes
    const getShapeClasses = (s: string) => {
        switch (s) {
            case 'circle': return 'rounded-full';
            case 'rounded': return 'rounded-xl';
            case 'square': return 'rounded-none';
            case 'none': return '';
            default: return 'rounded-full';
        }
    };

    const gradient = getGradient(role);
    const sizeClasses = getSizeClasses(size);
    const shapeClasses = getShapeClasses(shape);
    const displayContent = src || getDefaultEmoji(role);
    const isImage = src?.startsWith('http') || src?.startsWith('data:');

    return (
        <div className={`
            ${sizeClasses} ${shapeClasses} flex items-center justify-center 
            shadow-lg transition-transform overflow-hidden
            ${!isImage ? `bg-gradient-to-br ${gradient}` : ''}
            ${className}
        `}>
            {isImage ? (
                <img
                    src={src!}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="leading-none select-none">{displayContent}</span>
            )}
        </div>
    );
};
