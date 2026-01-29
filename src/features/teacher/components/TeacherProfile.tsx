// TeacherProfile - Editable teacher profile modal with avatar selection
import React, { useState, useEffect } from 'react';
import {
    X, Camera, Check, Sparkles, Save, User as UserIcon, Mail, Phone, Briefcase
} from 'lucide-react';
import { User, Role } from '@types';
import { Button } from '@shared/components/ui';

interface TeacherProfileProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (updates: Partial<User>) => Promise<void>;
}

// Preset avatars for teachers (more professional/diverse options)
const AVATAR_OPTIONS = [
    '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬',
    '🧑‍🔬', '👨‍🎨', '👩‍🎨', '🧑‍🎨', '📚', '🎓', '📝', '💡',
];

export const TeacherProfile: React.FC<TeacherProfileProps> = ({
    isOpen,
    onClose,
    user,
    onSave,
}) => {
    const [avatar, setAvatar] = useState<string>('🧑‍🏫');
    const [displayName, setDisplayName] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setAvatar(user.avatar || '🧑‍🏫');
            setDisplayName(user.displayName || user.name || '');
            setBio(user.bio || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                avatar,
                displayName,
                name: displayName,
                bio,
                phone
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-6 pt-6 pb-16">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Teacher Profile</h2>
                    <p className="text-indigo-200 text-sm">Manage your professional identity</p>
                </div>

                {/* Avatar section - overlapping header */}
                <div className="relative px-6 -mt-12">
                    <div className="relative inline-block">
                        <button
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 hover:scale-105 transition-transform"
                        >
                            {avatar.startsWith('http') ? (
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl">{avatar}</span>
                            )}
                        </button>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                            <Camera className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Avatar picker dropdown */}
                    {showAvatarPicker && (
                        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Professional Avatars</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['avataaars', 'lorelei', 'notionists', 'micah'] as const).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => {
                                                    const seed = Math.random().toString(36).substring(7);
                                                    setAvatar(`https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`);
                                                }}
                                                className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 transition-colors capitalize"
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={() => {
                                            // Keep current style but change seed
                                            const currentUrl = avatar.startsWith('http') ? avatar : 'https://api.dicebear.com/9.x/avataaars/svg';
                                            const baseUrl = currentUrl.split('?')[0];
                                            const newSeed = Math.random().toString(36).substring(7);
                                            // Preserve background color if present
                                            const bgParam = currentUrl.includes('backgroundColor') ? '&backgroundColor=b6e3f4,c0aede,d1d4f9' : '';
                                            setAvatar(`${baseUrl}?seed=${newSeed}${bgParam}`);
                                        }}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Randomize
                                    </button>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Or Icons</p>
                                    <div className="grid grid-cols-8 gap-1.5">
                                        {AVATAR_OPTIONS.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => { setAvatar(opt); setShowAvatarPicker(false); }}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form fields */}
                <div className="px-6 py-6 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {/* Display Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Full Name
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Email (Read only) */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm focus:outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Contact number..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            About Me
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell students/parents about yourself..."
                                rows={3}
                                maxLength={300}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 text-right mt-1">{bio.length}/300</p>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Sparkles className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
