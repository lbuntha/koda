// AddChildModal - Enhanced modal for adding children with avatar selection
import React, { useState } from 'react';
import {
    X, Camera, Sparkles, UserPlus, Mail, User as UserIcon
} from 'lucide-react';
import { Button } from '@shared/components/ui';

interface AddChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, email: string, avatar: string, grades: string[], preferences: string) => Promise<void>;
}

// Fun avatars for kids
const KID_AVATARS = [
    '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯',
    '🦄', '🐲', '🦋', '🐢', '🦖', '🐙', '👾', '🤖',
];

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const AddChildModal: React.FC<AddChildModalProps> = ({
    isOpen,
    onClose,
    onAdd
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('🐱');
    const [grades, setGrades] = useState<string[]>(['K']);
    const [preferences, setPreferences] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const toggleGrade = (g: string) => {
        setGrades(prev =>
            prev.includes(g)
                ? prev.filter(item => item !== g)
                : [...prev, g]
        );
    };

    const handleSubmit = async () => {
        if (!name) return;
        setIsSubmitting(true);
        try {
            await onAdd(name, email || `child-${Date.now()}@koda.edu`, avatar, grades, preferences);
            // Reset form
            setName('');
            setEmail('');
            setAvatar('🐱');
            setGrades(['K']);
            setPreferences('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 px-6 pt-6 pb-16 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Add New Child</h2>
                    <p className="text-emerald-50 text-sm">Create a profile for your learner</p>
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
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors">
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
                                                className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-300 transition-colors capitalize"
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
                                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Email (Optional)
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Auto-generated if empty"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50'
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
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
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Sparkles className="w-4 h-4 animate-spin" />
                        ) : (
                            <UserPlus className="w-4 h-4" />
                        )}
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};
