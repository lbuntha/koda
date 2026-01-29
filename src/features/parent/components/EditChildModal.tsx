// EditChildModal - Modal for editing an existing child's profile
import React, { useState, useEffect } from 'react';
import {
    X, Camera, Sparkles, Save, Mail, User as UserIcon, Trash2
} from 'lucide-react';
import { Button } from '@shared/components/ui';
import { User } from '@types';

interface EditChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: User | null;
    onSave: (childId: string, updates: Partial<User>) => Promise<void>;
    onDelete?: (childId: string) => Promise<void>;
}

// Fun avatars for kids
const KID_AVATARS = [
    '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯',
    '🦄', '🐲', '🦋', '🐢', '🦖', '🐙', '👾', '🤖',
];

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const EditChildModal: React.FC<EditChildModalProps> = ({
    isOpen,
    onClose,
    child,
    onSave,
    onDelete
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('🐱');
    const [grades, setGrades] = useState<string[]>([]);
    const [preferences, setPreferences] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initialize with child data
    useEffect(() => {
        if (child) {
            setName(child.name || child.displayName || '');
            setEmail(child.email || '');
            setAvatar(child.avatar || '🐱');
            setGrades(child.grades || []);
            setPreferences(child.preferences?.join(', ') || '');
        }
    }, [child]);

    const toggleGrade = (g: string) => {
        setGrades(prev =>
            prev.includes(g)
                ? prev.filter(item => item !== g)
                : [...prev, g]
        );
    };

    const handleSubmit = async () => {
        if (!child || !name) return;
        setIsSubmitting(true);
        try {
            // Process preferences
            const preferencesArray = preferences
                ? preferences.split(',').map(p => p.trim()).filter(p => p.length > 0)
                : [];

            await onSave(child.id, {
                name,
                displayName: name,
                avatar,
                grades: grades,
                preferences: preferencesArray,
                // Email is technically editable but usually used for auth ID foundation
                // We'll update it in the record but auth email change is separate complex flow usually
                email
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!child || !onDelete) return;
        if (!confirm('Are you sure you want to remove this child profile? This cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await onDelete(child.id);
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-indigo-400 to-purple-500 px-6 pt-6 pb-16 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Edit Child Profile</h2>
                    <p className="text-indigo-100 text-sm">Update profile details</p>
                </div>

                {/* Avatar section - overlapping header */}
                <div className="relative px-6 -mt-12 mb-2 flex-shrink-0">
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
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-indigo-600 transition-colors">
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
                                            const currentUrl = avatar.startsWith('http') ? avatar : 'https://api.dicebear.com/9.x/fun-emoji/svg';
                                            const baseUrl = currentUrl.split('?')[0];
                                            const newSeed = Math.random().toString(36).substring(7);
                                            setAvatar(`${baseUrl}?seed=${newSeed}`);
                                        }}
                                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Randomize
                                    </button>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Or Classic Emoji</p>
                                    <div className="grid grid-cols-8 gap-1.5">
                                        {KID_AVATARS.slice(0, 8).map((opt) => (
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

                {/* Form fields - Scrollable container */}
                <div className="px-6 pb-6 space-y-4 overflow-y-auto flex-1">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Child's Name
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Alice"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Auto-generated if empty"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Grade */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Grade Level (Select Multiple)
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {GRADES.map(g => (
                                <button
                                    key={g}
                                    onClick={() => toggleGrade(g)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${grades.includes(g)
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200/50'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Interests & Preferences
                        </label>
                        <textarea
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                            placeholder="What does your child like? e.g. Dinosaurs, Space, Drawing..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 pb-6 flex gap-3">
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            title="Remove Child"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
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
