// RankProgressionTab - Skill rank tiers and progression settings
import React from 'react';
import { Award, Trash2, Plus } from 'lucide-react';
import { SkillRank } from '@types';
import { Card, Button } from '@shared/components/ui';

interface RankProgressionTabProps {
    skillRanks: SkillRank[];
    onRankUpdate: (index: number, field: keyof SkillRank, value: any) => void;
    onAddRank: () => void;
    onDeleteRank: (index: number) => void;
}

export const RankProgressionTab: React.FC<RankProgressionTabProps> = ({
    skillRanks,
    onRankUpdate,
    onAddRank,
    onDeleteRank
}) => {
    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800">Rank Progression System</h3>
            </div>

            <div className="space-y-4">
                {skillRanks.map((rank, idx) => (
                    <div key={idx} className="flex gap-4 items-center p-4 border rounded-lg hover:border-purple-200 transition-colors bg-white">
                        <div className="text-2xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-lg border border-slate-100 shrink-0">
                            {rank.icon}
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Rank Name</label>
                                <input
                                    className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none text-sm font-semibold"
                                    value={rank.name}
                                    onChange={e => onRankUpdate(idx, 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">XP Threshold</label>
                                <input
                                    type="number"
                                    className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none text-sm font-mono"
                                    value={rank.threshold}
                                    onChange={e => onRankUpdate(idx, 'threshold', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Icon (Emoji)</label>
                                <input
                                    className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none text-sm"
                                    value={rank.icon}
                                    onChange={e => onRankUpdate(idx, 'icon', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                                <input
                                    className="w-full border-b border-transparent hover:border-slate-300 focus:border-purple-500 outline-none text-sm text-slate-500"
                                    value={rank.description}
                                    onChange={e => onRankUpdate(idx, 'description', e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => onDeleteRank(idx)}
                            className="text-slate-300 hover:text-rose-500"
                            disabled={skillRanks.length <= 1}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <Button
                    variant="outline"
                    onClick={onAddRank}
                    className="w-full border-dashed text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New Rank Tier
                </Button>
            </div>

            <p className="text-xs text-slate-400 mt-4">
                Ranks are progression tiers that students achieve based on their XP. Higher thresholds unlock new ranks with corresponding badges and rewards.
            </p>
        </Card>
    );
};
