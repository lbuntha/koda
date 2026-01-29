
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@shared/components/ui';
import { User } from '@types';
import { getSystemConfig, SystemConfig, DEFAULT_SYSTEM_CONFIG, SubscriptionTier } from '@stores';
import { Zap, Crown, Check, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

interface SubscriptionPanelProps {
    user: User;
    onUpgradeClick?: (tierId: string) => void;
}

export const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ user, onUpgradeClick }) => {
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

    useEffect(() => {
        getSystemConfig().then(setConfig);
    }, []);

    const userTier = config.subscriptionTiers.find(t => t.id === (user.subscriptionTier || 'free')) || config.subscriptionTiers[0];
    const usage = user.tokenUsage || 0;
    const limit = userTier?.tokenQuota || 10000;
    const percent = Math.min(100, (usage / limit) * 100);
    const resetDate = user.quotaResetDate ? new Date(user.quotaResetDate).toLocaleDateString() : 'Next Month';

    // Helper to determine color based on usage
    let progressColor = 'bg-emerald-500';
    if (percent > 75) progressColor = 'bg-amber-500';
    if (percent > 90) progressColor = 'bg-rose-500';

    return (
        <div className="space-y-6">
            {/* Current Status Card */}
            <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-800">Current Plan</h3>
                            <Badge color={userTier.id === 'pro' ? 'blue' : userTier.id === 'basic' ? 'cyan' : 'slate'}>
                                {userTier.name}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            You are currently on the <span className="font-semibold text-indigo-700">{userTier.name}</span> plan.
                        </p>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase text-slate-400">
                                <span>Monthly AI Token Usage</span>
                                <span className={percent > 90 ? 'text-rose-500' : 'text-slate-600'}>
                                    {usage.toLocaleString()} / {limit.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                    className={`h-full ${progressColor} transition-all duration-500`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {percent.toFixed(1)}% Used
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Resets: {resetDate}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-px md:bg-indigo-100 mx-2"></div>

                    <div className="md:w-1/3 flex flex-col justify-center gap-3">
                        {percent > 90 && (
                            <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg text-xs text-rose-700 flex gap-2 items-start">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>You are running low on tokens! Upgrade to avoid interruption.</span>
                            </div>
                        )}
                        <div className="text-xs text-slate-500">
                            <strong>Plan Features:</strong>
                            <ul className="mt-1 space-y-1">
                                {userTier.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> {f}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Upgrade Options */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {config.subscriptionTiers.map(tier => {
                        const isCurrent = tier.id === userTier.id;
                        return (
                            <div
                                key={tier.id}
                                className={`
                                    relative p-6 rounded-xl border-2 transition-all duration-200
                                    ${isCurrent
                                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg'
                                    }
                                `}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                        CURRENT
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-800">{tier.name}</h4>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-black text-indigo-600">${tier.price}</span>
                                        <span className="text-xs text-slate-400">/month</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100 pb-1 mb-2">Includes</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <span className="font-semibold">{tier.tokenQuota.toLocaleString()} Tokens</span>
                                    </div>
                                    {tier.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                            <Check className="w-3 h-3 text-emerald-500" /> {f}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className={`w-full ${isCurrent ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                    disabled={isCurrent}
                                    onClick={() => onUpgradeClick && onUpgradeClick(tier.id)}
                                >
                                    {isCurrent ? 'Active Plan' : tier.price > userTier.price ? 'Upgrade' : 'Downgrade'}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
