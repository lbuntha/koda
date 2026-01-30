// SubscriptionTab - Subscription tiers and pricing management
import React from 'react';
import { CreditCard, Trash2, Plus } from 'lucide-react';
import { SystemConfig } from '@stores';
import { Card, Button } from '@shared/components/ui';

interface SubscriptionTabProps {
    config: SystemConfig;
    onConfigUpdate: (key: keyof SystemConfig, value: any) => void;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
    config,
    onConfigUpdate
}) => {
    const handleTierUpdate = (index: number, field: string, value: any) => {
        const updated = [...(config.subscriptionTiers || [])];
        updated[index] = { ...updated[index], [field]: value };
        onConfigUpdate('subscriptionTiers', updated);
    };

    const handleDeleteTier = (index: number) => {
        const updated = config.subscriptionTiers.filter((_, i) => i !== index);
        onConfigUpdate('subscriptionTiers', updated);
    };

    const handleAddTier = () => {
        const newTier = {
            id: `plan-${Date.now()}`,
            name: 'New Plan',
            price: 10,
            tokenQuota: 100000,
            maxRequestTokens: 2048,
            features: []
        };
        onConfigUpdate('subscriptionTiers', [...(config.subscriptionTiers || []), newTier]);
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-800">Subscription & Pricing</h3>
            </div>

            <div className="space-y-4">
                {(config.subscriptionTiers || []).map((tier, idx) => (
                    <div key={tier.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 border rounded-lg hover:border-emerald-200 transition-colors bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Plan Name</label>
                                <input
                                    className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none text-sm font-semibold bg-transparent dark:text-slate-200"
                                    value={tier.name}
                                    onChange={e => handleTierUpdate(idx, 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Price ($)</label>
                                <input
                                    type="number"
                                    className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-transparent"
                                    value={tier.price}
                                    onChange={e => handleTierUpdate(idx, 'price', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Token Quota</label>
                                <input
                                    type="number"
                                    className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none text-sm font-mono bg-transparent dark:text-slate-200"
                                    value={tier.tokenQuota}
                                    onChange={e => handleTierUpdate(idx, 'tokenQuota', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Max Request Tokens</label>
                                <input
                                    type="number"
                                    className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none text-sm font-mono bg-transparent dark:text-slate-200"
                                    value={tier.maxRequestTokens}
                                    onChange={e => handleTierUpdate(idx, 'maxRequestTokens', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Max Kids</label>
                                <input
                                    type="number"
                                    className="w-full border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none text-sm font-mono bg-transparent dark:text-slate-200"
                                    value={tier.maxChildren || 1}
                                    onChange={e => handleTierUpdate(idx, 'maxChildren', Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => handleDeleteTier(idx)}
                            className="text-slate-300 hover:text-rose-500 self-end md:self-center"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <p className="text-xs text-slate-400 mt-2 italic px-2">
                    * <strong>Monthly Token Quota:</strong> Total tokens a user receives per month (the "allowance"). <br />
                    * <strong>Max Tokens Per Request:</strong> The maximum size/length of a single AI response. <br />
                    * <strong>Max Kids:</strong> Number of child profiles allowed for this plan.
                </p>

                <Button
                    variant="outline"
                    onClick={handleAddTier}
                    className="w-full border-dashed text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Benefit Plan
                </Button>
            </div>
        </Card>
    );
};
