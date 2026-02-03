// StudentProfile - Editable student profile modal with avatar selection
import React, { useState, useEffect } from 'react';
import {
    X, Camera, Check, User as UserIcon, Star, Trophy, Flame,
    BookOpen, Sparkles, Save, LogOut
} from 'lucide-react';
import { User } from '@types';
import { Button } from '@shared/components/ui';

interface StudentProfileProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (updates: Partial<User>) => Promise<void>;
    onLogout?: () => void;
    stats: {
        totalXP: number;
        masteredCount: number;
        streak: number;
        totalSkills: number;
    };
    availableGrades: string[];
}

// Preset avatars for students
const AVATAR_OPTIONS = [
    // Animals
    '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯',
    // Fun creatures
    '🦄', '🐲', '🦋', '🐢', '🦖', '🐙', '🦑', '🐠',
    // More animals
    '🐰', '🐸', '🦉', '🐧', '🦜', '🐬', '🦈', '🐝',
];

export const StudentProfile: React.FC<StudentProfileProps> = ({
    isOpen,
    onClose,
    user,
    onSave,
    onLogout,
    stats,
    availableGrades
}) => {
    const [avatar, setAvatar] = useState<string>('🐱');
    const [displayName, setDisplayName] = useState<string>('');
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [bio, setBio] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setAvatar(user.avatar || '🐱');
            setDisplayName(user.displayName || user.name || '');
            setSelectedGrades(user.grades || []);
            setBio(user.bio || '');
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                avatar,
                displayName,
                name: displayName,
                grades: selectedGrades,
                bio
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const toggleGrade = (grade: string) => {
        setSelectedGrades(prev =>
            prev.includes(grade)
                ? prev.filter(g => g !== grade)
                : [...prev, grade]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 px-6 pt-6 pb-16">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-white">My Profile</h2>
                    <p className="text-indigo-200 text-sm">Customize your learning experience</p>
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
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Avatar Style</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => {
                                                    const seed = Math.random().toString(36).substring(7);
                                                    setAvatar(`https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`);
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
                                            const currentUrl = avatar.startsWith('http') ? avatar : 'https://api.dicebear.com/9.x/adventurer/svg';
                                            const baseUrl = currentUrl.split('?')[0];
                                            const newSeed = Math.random().toString(36).substring(7);
                                            setAvatar(`${baseUrl}?seed=${newSeed}`);
                                        }}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Randomize
                                    </button>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Or Classic Emoji</p>
                                    <div className="grid grid-cols-8 gap-1.5">
                                        {AVATAR_OPTIONS.slice(0, 8).map((opt) => (
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

                {/* Stats row */}
                <div className="px-6 py-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
                            <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{stats.streak}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-medium">Streak</p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-center">
                            <Star className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{stats.totalXP >= 1000 ? `${(stats.totalXP / 1000).toFixed(1)}k` : stats.totalXP}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-medium">XP</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                            <Trophy className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                            <p className="text-lg font-black text-slate-800 dark:text-white">{stats.masteredCount}/{stats.totalSkills}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-medium">Mastered</p>
                        </div>
                    </div>
                </div>

                {/* Form fields */}
                <div className="px-6 pb-6 space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                    {/* Display Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Grades */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            My Grades
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableGrades.map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => toggleGrade(grade)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedGrades.includes(grade)
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {selectedGrades.includes(grade) && <Check className="w-3 h-3 inline mr-1" />}
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            About Me
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            maxLength={200}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                        <p className="text-[10px] text-slate-400 text-right mt-1">{bio.length}/200</p>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 pb-6 space-y-3">
                    <div className="flex gap-3">
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

                    {/* Logout button - visible on mobile */}
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-medium text-sm hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
