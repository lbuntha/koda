
// SystemSettings - Platform configuration with tabbed interface
import React, { useState, useEffect } from 'react';
import { Settings, Zap, Award, CreditCard, Wand2, Box } from 'lucide-react';
import {
    getSystemConfig, addSystemOption, removeSystemOption, saveSystemConfig, SystemConfig,
    getGlobalSettings, saveGlobalSettings, GlobalSettings,
    getSkillRanks, saveSkillRanks,
    getRewardRules, addRewardRule, updateRewardRule, deleteRewardRule,
    DEFAULT_SYSTEM_CONFIG, DEFAULT_SETTINGS
} from '@stores';
import { RewardRule, SkillRank } from '@types';
import { ConfirmationModal } from '@shared/components/ui';
import {
    PlatformConfigTab,
    SubscriptionTab,
    GamificationTab,
    RankProgressionTab,
    ComponentManager
} from './settings';

// Tab configuration
const TABS = [
    { id: 'platform', label: 'Platform', icon: Settings, color: 'indigo' },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, color: 'emerald' },
    { id: 'gamification', label: 'Gamification', icon: Zap, color: 'amber' },
    { id: 'ranks', label: 'Ranks', icon: Award, color: 'purple' },
    { id: 'components', label: 'Question Types', icon: Box, color: 'indigo' },
] as const;

type TabId = typeof TABS[number]['id'];

export const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('platform');
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
    const [skillRanks, setSkillRanks] = useState<SkillRank[]>([]);
    const [rewards, setRewards] = useState<RewardRule[]>([]);

    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void> | void;
    }>({ isOpen: false, title: '', message: '', action: () => { } });

    const openConfirm = (title: string, message: string, action: () => Promise<void> | void) => {
        setConfirmState({ isOpen: true, title, message, action });
    };

    useEffect(() => {
        const loadAllSettings = async () => {
            setConfig(await getSystemConfig());
            setGlobalSettings(await getGlobalSettings());
            setSkillRanks(await getSkillRanks());
            setRewards(await getRewardRules());
        };
        loadAllSettings();
    }, []);

    const refreshConfig = async () => setConfig(await getSystemConfig());
    const refreshRewards = async () => setRewards(await getRewardRules());

    // Platform Config handlers
    const handleAddOption = async (type: 'grades' | 'subjects', value: string) => {
        await addSystemOption(type, value);
        await refreshConfig();
    };

    const handleRemoveOption = (type: 'grades' | 'subjects', value: string) => {
        openConfirm(
            `Remove ${type === 'grades' ? 'Grade' : 'Subject'}?`,
            `Are you sure you want to remove "${value}" from the system options?`,
            async () => {
                await removeSystemOption(type, value);
                await refreshConfig();
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        );
    };

    const handleConfigUpdate = (key: keyof SystemConfig, value: any) => {
        const updated = { ...config, [key]: value };
        setConfig(updated);
        saveSystemConfig(updated);
    };

    // Global Settings handlers
    const handleGlobalSettingsUpdate = (key: keyof GlobalSettings, value: number) => {
        const updated = { ...globalSettings, [key]: value };
        setGlobalSettings(updated);
        saveGlobalSettings(updated);
    };

    // Rank handlers
    const handleRankFieldUpdate = (index: number, field: keyof SkillRank, value: any) => {
        const updated = [...skillRanks];
        updated[index] = { ...updated[index], [field]: value };
        setSkillRanks(updated);
        saveSkillRanks(updated);
    };

    const handleAddRank = () => {
        const lastRank = skillRanks[skillRanks.length - 1];
        const newRank: SkillRank = {
            name: 'New Rank',
            threshold: (lastRank?.threshold || 0) + 500,
            icon: '🏆',
            color: 'text-slate-500 bg-slate-50 border-slate-200',
            description: 'New progression tier'
        };
        const updated = [...skillRanks, newRank];
        setSkillRanks(updated);
        saveSkillRanks(updated);
    };

    const handleDeleteRank = (index: number) => {
        if (skillRanks.length <= 1) {
            alert("At least one rank is required.");
            return;
        }
        openConfirm(
            "Delete Rank?",
            "Are you sure you want to delete this rank tier? This action cannot be undone.",
            () => {
                const updated = skillRanks.filter((_, i) => i !== index);
                setSkillRanks(updated);
                saveSkillRanks(updated);
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        );
    };

    // Reward handlers
    const handleAddReward = async (reward: Omit<RewardRule, 'id'>) => {
        const ruleToAdd = {
            ...reward,
            id: `rule-${Date.now()}`
        } as RewardRule;
        await addRewardRule(ruleToAdd);
        await refreshRewards();
    };

    const handleUpdateReward = async (rule: RewardRule) => {
        await updateRewardRule(rule);
        await refreshRewards();
    };

    const handleDeleteReward = (id: string) => {
        openConfirm(
            "Delete Reward Rule?",
            "Are you sure you want to delete this gamification rule?",
            async () => {
                await deleteRewardRule(id);
                await refreshRewards();
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        );
    };

    // Get tab colors
    const getTabClasses = (tab: typeof TABS[number], isActive: boolean) => {
        const colors: Record<string, { active: string; inactive: string }> = {
            indigo: {
                active: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-500',
                inactive: 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 border-transparent'
            },
            emerald: {
                active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-500',
                inactive: 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-transparent'
            },
            amber: {
                active: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-500',
                inactive: 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 border-transparent'
            },
            purple: {
                active: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-500',
                inactive: 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 border-transparent'
            },
            rose: {
                active: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-500',
                inactive: 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 border-transparent'
            },
            cyan: {
                active: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-500',
                inactive: 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 border-transparent'
            }
        };
        const colorSet = colors[tab.color] || colors.indigo;
        return isActive ? colorSet.active : colorSet.inactive;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-1">
                <div className="flex flex-wrap gap-1">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-b-2 ${getTabClasses(tab, isActive)}`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'platform' && (
                    <PlatformConfigTab
                        config={config}
                        onConfigUpdate={handleConfigUpdate}
                        onAddOption={handleAddOption}
                        onRemoveOption={handleRemoveOption}
                    />
                )}

                {activeTab === 'subscription' && (
                    <SubscriptionTab
                        config={config}
                        onConfigUpdate={handleConfigUpdate}
                    />
                )}

                {activeTab === 'gamification' && (
                    <GamificationTab
                        globalSettings={globalSettings}
                        config={config}
                        rewards={rewards}
                        onSettingsUpdate={handleGlobalSettingsUpdate}
                        onConfigUpdate={handleConfigUpdate}
                        onAddReward={handleAddReward}
                        onUpdateReward={handleUpdateReward}
                        onDeleteReward={handleDeleteReward}
                    />
                )}

                {activeTab === 'ranks' && (
                    <RankProgressionTab
                        skillRanks={skillRanks}
                        onRankUpdate={handleRankFieldUpdate}
                        onAddRank={handleAddRank}
                        onDeleteRank={handleDeleteRank}
                    />
                )}

                {activeTab === 'components' && (
                    <ComponentManager />
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.action}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                isDanger={true}
                confirmLabel="Delete"
            />
        </div>
    );
};
