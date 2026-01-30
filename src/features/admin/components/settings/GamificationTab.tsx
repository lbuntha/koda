// GamificationTab - Points, rewards, and gamification rules with documentation
import React, { useState } from 'react';
import { Zap, Trash2, BookOpen, ChevronDown, ChevronUp, Trophy, Flame, Target, Clock, Star, TrendingUp, Edit2, Check, X, Plus } from 'lucide-react';
import { GlobalSettings, SystemConfig } from '@stores';
import { RewardRule, Difficulty } from '@types';
import { Card, Button } from '@shared/components/ui';

interface GamificationTabProps {
    globalSettings: GlobalSettings;
    config: SystemConfig;
    rewards: RewardRule[];
    onSettingsUpdate: (key: keyof GlobalSettings, value: number) => void;
    onConfigUpdate: (key: keyof SystemConfig, value: any) => void;
    onAddReward: (reward: Omit<RewardRule, 'id'>) => Promise<void>;
    onUpdateReward: (rule: RewardRule) => Promise<void>;
    onDeleteReward: (id: string) => void;
}

// Gamification Specs Component
const GamificationSpecs: React.FC<{ globalSettings: GlobalSettings }> = ({ globalSettings }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-6 border rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-900/50">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-amber-100/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">How Gamification Works</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Overview */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Overview
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            The gamification system rewards students with <strong>XP (Experience Points)</strong> for completing quizzes,
                            drawing tasks, and achieving learning milestones. Points accumulate to unlock ranks, badges, and rewards.
                        </p>
                    </div>

                    {/* Point Calculation */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            Point Calculation Formula
                        </h4>

                        <div className="bg-slate-800 text-green-400 rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto">
                            <div className="text-slate-400">// 1. Standard Quiz Question (Correct):</div>
                            <div className="mt-1 mb-2">
                                points = <span className="text-amber-400">basePoints</span>
                                + <span className="text-cyan-400">speedBonus</span>
                                + <span className="text-orange-400">streakBonus</span>
                            </div>

                            <div className="text-slate-400">// 2. Accuracy Task (e.g. Drawing):</div>
                            <div className="mt-1">
                                points = (<span className="text-purple-400">accuracy%</span> / 100) * <span className="text-pink-400">accuracyMaxPoints</span>
                            </div>
                            <div className="text-slate-500 text-xs italic mt-1">
                                * Only awarded if accuracy &gt; {globalSettings.minAccuracyThreshold}%
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Target className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">Base Points</div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                        <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded dark:text-amber-200">{globalSettings.baseMasteryPoints} pts</span> awarded
                                        for each correct answer
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                                <Clock className="w-5 h-5 text-cyan-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">Speed Bonus</div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                        <span className="font-mono bg-cyan-100 dark:bg-cyan-900/40 px-1 rounded dark:text-cyan-200">+{globalSettings.speedBonusFast} pts</span> for
                                        answering quickly (under 10 seconds)
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">Accuracy Score</div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                        Up to <span className="font-mono bg-purple-100 dark:bg-purple-900/40 px-1 rounded dark:text-purple-200">{globalSettings.accuracyMaxPoints} pts</span> based
                                        on percentage accuracy (e.g. drawing similarity)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Example Scenarios */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">📊 Example Scenarios</h4>

                        <div className="space-y-4">
                            {/* Example 1: Quiz Mode */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                                <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase mb-2">Example 1: The Quiz Whiz (Standard Mode)</h5>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                    A student answers <strong>3 questions correctly in a row</strong>, all within 10 seconds (Speed Bonus).
                                </p>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-1 text-slate-500">Q#</th>
                                            <th className="text-right py-1 text-slate-500">Base</th>
                                            <th className="text-right py-1 text-slate-500">Speed</th>
                                            <th className="text-right py-1 text-slate-500">Streak</th>
                                            <th className="text-right py-1 text-slate-500 font-bold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-mono">
                                        {[1, 2, 3].map(q => (
                                            <tr key={q} className="border-b border-slate-100">
                                                <td className="py-1">Q{q}</td>
                                                <td className="text-right text-amber-600">+{globalSettings.baseMasteryPoints}</td>
                                                <td className="text-right text-cyan-600">+{globalSettings.speedBonusFast}</td>
                                                <td className="text-right text-orange-600">+{globalSettings.streakBonus * q}</td>
                                                <td className="text-right font-bold text-emerald-600">
                                                    {globalSettings.baseMasteryPoints + globalSettings.speedBonusFast + (globalSettings.streakBonus * q)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-bold">
                                            <td colSpan={4} className="py-2 text-right text-slate-600">Session Total:</td>
                                            <td className="py-2 text-right text-emerald-600 text-sm">
                                                {[1, 2, 3].reduce((sum, q) =>
                                                    sum + globalSettings.baseMasteryPoints + globalSettings.speedBonusFast + (globalSettings.streakBonus * q), 0
                                                )} pts
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Example 2: Accuracy Mode */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30">
                                <h5 className="font-bold text-indigo-800 dark:text-indigo-300 text-xs uppercase mb-2">Example 2: The Digital Artist (Accuracy Mode)</h5>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                    Student draws a shape with <strong>95% accuracy</strong> (Threshold: {globalSettings.minAccuracyThreshold}%).
                                </p>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center py-1 border-b border-indigo-100">
                                        <span className="text-slate-600">Accuracy Score</span>
                                        <span className="font-mono font-bold text-slate-800">95%</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-indigo-100">
                                        <span className="text-slate-600">Calculation</span>
                                        <span className="font-mono text-slate-500">(0.95 × {globalSettings.accuracyMaxPoints} max pts)</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-indigo-100 bg-white/50 px-2 rounded">
                                        <span className="font-bold text-indigo-700">Points Awarded</span>
                                        <div className="text-right">
                                            <span className="font-bold text-emerald-600 text-sm">{Math.round(0.95 * globalSettings.accuracyMaxPoints)} pts</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100 flex items-start gap-2">
                                        <Zap className="w-3 h-3 text-amber-500 mt-0.5" />
                                        <div className="text-slate-600 italic">
                                            <strong>Bonus:</strong> If you have a reward rule "Accuracy &gt; 90%", they would get extra points on top of this!
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export const GamificationTab: React.FC<GamificationTabProps> = ({
    globalSettings,
    config,
    rewards,
    onSettingsUpdate,
    onConfigUpdate,
    onAddReward,
    onUpdateReward,
    onDeleteReward
}) => {
    // New Reward State
    const [newReward, setNewReward] = useState<Partial<RewardRule>>({
        name: '',
        triggerType: 'SCORE',
        conditionOperator: 'GREATER_THAN',
        conditionValue: 80,
        effectType: 'REWARD',
        points: 10,
        message: ''
    });

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<RewardRule>>({});

    const handleTriggerChange = (type: string, isNew: boolean) => {
        const target = isNew ? newReward : editForm;
        const updated = {
            ...target,
            triggerType: type as any,
            // Reset reasonable defaults when type changes
            conditionOperator: type === 'DIFFICULTY' ? 'EQUALS' : 'GREATER_THAN',
            conditionValue: type === 'DIFFICULTY' ? Difficulty.HARD : (type === 'ACCURACY' || type === 'SCORE' ? 80 : 5)
        };

        if (isNew) setNewReward(updated);
        else setEditForm(updated);
    };

    const handleAddReward = async () => {
        if (newReward.name && newReward.message) {
            const ruleToAdd = {
                ...newReward,
                conditionOperator: newReward.triggerType === 'DIFFICULTY' ? 'EQUALS' : newReward.conditionOperator
            } as Omit<RewardRule, 'id'>;
            await onAddReward(ruleToAdd);
            setNewReward({
                name: '',
                triggerType: 'SCORE',
                conditionOperator: 'GREATER_THAN',
                conditionValue: 80,
                effectType: 'REWARD',
                points: 10,
                message: ''
            });
        }
    };

    const startEditing = (rule: RewardRule) => {
        setEditingId(rule.id);
        setEditForm({ ...rule });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEditing = async () => {
        if (editingId && editForm.name && editForm.message) {
            await onUpdateReward(editForm as RewardRule);
            setEditingId(null);
            setEditForm({});
        }
    };

    return (
        <div className="space-y-6">
            {/* Gamification Specs Documentation */}
            <GamificationSpecs globalSettings={globalSettings} />

            {/* Progression Configuration */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-800">Progression Rules</h3>
                </div>

                <div>
                    <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-slate-700 block">Default Mastery Requirements</label>
                        {config.defaultMasteryRequirements?.type === 'QUESTIONS' && (
                            <div className="px-2 py-1 rounded text-[10px] font-medium border bg-emerald-50 border-emerald-200 text-emerald-700">
                                Active: Question Count Strategy
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Type Selector */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Criteria Type</label>
                            <select
                                className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 outline-none py-1 text-sm font-semibold bg-transparent dark:text-slate-200 transition-colors cursor-pointer"
                                value={config.defaultMasteryRequirements?.type || 'QUESTIONS'}
                                onChange={e => onConfigUpdate('defaultMasteryRequirements', {
                                    ...config.defaultMasteryRequirements,
                                    type: e.target.value as any
                                })}
                            >
                                <option value="QUESTIONS" className="dark:bg-slate-800">Questions Answered</option>
                                <option value="SCORE" className="dark:bg-slate-800">Total Score (XP)</option>
                            </select>
                        </div>

                        {/* Target Value */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                                {config.defaultMasteryRequirements?.type === 'QUESTIONS' ? 'Target # Questions' : 'Target XP'}
                            </label>
                            <input
                                type="number"
                                className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 outline-none py-1 text-sm font-bold bg-transparent dark:text-slate-200 transition-colors"
                                value={config.defaultMasteryRequirements?.value || 10}
                                onChange={e => onConfigUpdate('defaultMasteryRequirements', {
                                    ...config.defaultMasteryRequirements,
                                    value: Number(e.target.value)
                                })}
                            />
                        </div>

                        {/* Accuracy Gate */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Min Accuracy (%)</label>
                            <input
                                type="number"
                                className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 outline-none py-1 text-sm font-bold bg-transparent dark:text-slate-200 transition-colors"
                                value={config.defaultMasteryRequirements?.minAccuracy || 80}
                                onChange={e => onConfigUpdate('defaultMasteryRequirements', {
                                    ...config.defaultMasteryRequirements,
                                    minAccuracy: Number(e.target.value)
                                })}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Required to reach Master Rank</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        <div className="font-bold mb-1">Progression Logic:</div>
                        <ul className="list-disc pl-4 space-y-1">
                            {config.defaultMasteryRequirements?.type === 'QUESTIONS' ? (
                                <>
                                    <li>Student must answer <span className="font-bold">{config.defaultMasteryRequirements?.value}</span> questions correctly to master a skill.</li>
                                    <li>Intermediate ranks are awarded at 10%, 30%, and 60% of the target.</li>
                                    <li>If accuracy is below <span className="font-bold">{config.defaultMasteryRequirements?.minAccuracy}%</span>, they cannot pass the "Scholar" rank.</li>
                                </>
                            ) : (
                                <>
                                    <li>Student accumulates XP from correct answers, speed bonuses, and streaks.</li>
                                    <li>Mastery is achieved at <span className="font-bold">{config.defaultMasteryRequirements?.value} XP</span>.</li>
                                    <li>This is the classic gamification mode.</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Configuration Card */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-slate-800">Point Configuration</h3>
                </div>

                <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Quiz Mode Configuration</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Base Points</label>
                        <input
                            type="number"
                            className="w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none py-1 text-sm font-bold bg-transparent transition-colors"
                            value={globalSettings.baseMasteryPoints}
                            onChange={e => onSettingsUpdate('baseMasteryPoints', Number(e.target.value))}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Per correct answer</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Speed Bonus</label>
                        <input
                            type="number"
                            className="w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none py-1 text-sm font-bold bg-transparent transition-colors"
                            value={globalSettings.speedBonusFast}
                            onChange={e => onSettingsUpdate('speedBonusFast', Number(e.target.value))}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Quick answer bonus</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Streak Bonus</label>
                        <input
                            type="number"
                            className="w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none py-1 text-sm font-bold bg-transparent transition-colors"
                            value={globalSettings.streakBonus}
                            onChange={e => onSettingsUpdate('streakBonus', Number(e.target.value))}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Per streak step</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Penalty</label>
                        <input
                            type="number"
                            className="w-full border-b border-transparent hover:border-slate-300 focus:border-rose-500 outline-none py-1 text-sm font-bold text-rose-600 bg-transparent transition-colors"
                            value={globalSettings.standardPenaltyPoints}
                            onChange={e => onSettingsUpdate('standardPenaltyPoints', Number(e.target.value))}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Wrong answer deduction</p>
                    </div>
                </div>

                <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Accuracy Mode Configuration (Drawing/Tracing)</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Max Accuracy Points</label>
                        <input
                            type="number"
                            className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none py-1 text-sm font-bold text-purple-600 bg-transparent transition-colors"
                            value={globalSettings.accuracyMaxPoints || 100}
                            onChange={e => onSettingsUpdate('accuracyMaxPoints', Number(e.target.value))}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Points awarded for 100% accuracy</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Min Threshold (%)</label>
                        <input
                            type="number"
                            className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none py-1 text-sm font-bold bg-transparent transition-colors"
                            value={globalSettings.minAccuracyThreshold || 50}
                            onChange={e => onSettingsUpdate('minAccuracyThreshold', Number(e.target.value))}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Minimum accuracy to get points</p>
                    </div>
                </div>

                {/* Reward Rules List */}
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 border-t pt-4">Reward Rules</h4>
                <div className="space-y-3 mb-4">
                    {rewards.map(rule => (
                        <div key={rule.id}>
                            {editingId === rule.id ? (
                                // Editing Mode
                                <div className="p-3 border-2 border-indigo-200 rounded-lg bg-indigo-50/30">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input
                                            className="border rounded p-1.5 text-xs font-semibold"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            placeholder="Rule Name"
                                        />
                                        <input
                                            className="border rounded p-1.5 text-xs"
                                            value={editForm.message}
                                            onChange={e => setEditForm({ ...editForm, message: e.target.value })}
                                            placeholder="Message"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        <select
                                            className="border rounded p-1.5 text-xs"
                                            value={editForm.triggerType}
                                            onChange={e => handleTriggerChange(e.target.value, false)}
                                        >
                                            <option value="SCORE">Score</option>
                                            <option value="STREAK">Streak</option>
                                            <option value="DIFFICULTY">Difficulty</option>
                                            <option value="ACCURACY">Accuracy</option>
                                        </select>
                                        <select
                                            className="border rounded p-1.5 text-xs"
                                            value={editForm.conditionOperator}
                                            onChange={e => setEditForm({ ...editForm, conditionOperator: e.target.value as any })}
                                        >
                                            <option value="GREATER_THAN">&gt; Greater Than</option>
                                            <option value="LESS_THAN">&lt; Less Than</option>
                                            <option value="EQUALS">= Equals</option>
                                        </select>
                                        <input
                                            className="border rounded p-1.5 text-xs"
                                            value={editForm.conditionValue}
                                            onChange={e => setEditForm({ ...editForm, conditionValue: e.target.value })}
                                            placeholder="Value"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                className="border rounded p-1.5 text-xs w-full"
                                                value={editForm.effectType}
                                                onChange={e => setEditForm({ ...editForm, effectType: e.target.value as any })}
                                            >
                                                <option value="REWARD">Reward (+)</option>
                                                <option value="PENALTY">Penalty (-)</option>
                                            </select>
                                            <input
                                                className="border rounded p-1.5 text-xs w-20"
                                                type="number"
                                                value={editForm.points}
                                                onChange={e => setEditForm({ ...editForm, points: Number(e.target.value) })}
                                                placeholder="Pts"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" variant="outline" onClick={cancelEditing} className="h-8 text-xs">
                                            <X className="w-3 h-3 mr-1" />
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={saveEditing} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">
                                            <Check className="w-3 h-3 mr-1" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode - Updated to match SubscriptionTab style
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition-all group">
                                    <div>
                                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            {rule.name}
                                            {rule.triggerType === 'ACCURACY' && (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">Accuracy</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            If <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-700 dark:text-slate-300">{rule.triggerType}</span> {rule.conditionOperator} <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-700 dark:text-slate-300">{rule.conditionValue}</span> → <span className={`font-bold ${rule.effectType === 'REWARD' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{rule.effectType === 'REWARD' ? '+' : '-'}{rule.points} pts</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditing(rule)} className="text-slate-300 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDeleteReward(rule.id)} className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-full transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {rewards.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">No reward rules configured yet.</p>
                    )}
                </div>

                {/* Add New Rule Form */}
                {!editingId && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 mt-4">
                        <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Plus className="w-3 h-3" />
                            Add New Reward Rule
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input
                                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Rule Name (e.g. Master Streak)"
                                value={newReward.name}
                                onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                            />
                            <input
                                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Message to student (e.g. 'Incredible Streak!')"
                                value={newReward.message}
                                onChange={e => setNewReward({ ...newReward, message: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <select
                                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newReward.triggerType}
                                onChange={e => handleTriggerChange(e.target.value, true)}
                            >
                                <option value="SCORE">Trigger: Score</option>
                                <option value="STREAK">Trigger: Streak</option>
                                <option value="DIFFICULTY">Trigger: Difficulty</option>
                                <option value="ACCURACY">Trigger: Accuracy</option>
                            </select>
                            <select
                                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newReward.effectType}
                                onChange={e => setNewReward({ ...newReward, effectType: e.target.value as any })}
                            >
                                <option value="REWARD">Effect: Give Reward (+)</option>
                                <option value="PENALTY">Effect: Penalty (-)</option>
                            </select>
                            <input
                                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                type="number"
                                placeholder="Points Amount"
                                value={newReward.points}
                                onChange={e => setNewReward({ ...newReward, points: Number(e.target.value) })}
                            />
                        </div>
                        <Button
                            size="sm"
                            onClick={handleAddReward}
                            disabled={!newReward.name || !newReward.message}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Rule
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};
