
import React, { useState } from 'react';
import { AttributeSchema } from '@services/questionTypeRegistry';
import { Button, Card } from '@shared/components/ui';
import { Plus, Trash2, GripVertical, Settings2 } from 'lucide-react';

interface AttributeBuilderProps {
    attributes: AttributeSchema[];
    onChange: (attributes: AttributeSchema[]) => void;
}

export const AttributeBuilder: React.FC<AttributeBuilderProps> = ({
    attributes,
    onChange
}) => {
    // New attribute form state
    const [isAdding, setIsAdding] = useState(false);
    const [newAttr, setNewAttr] = useState<Partial<AttributeSchema>>({
        type: 'text',
        defaultValue: ''
    });

    const handleAdd = () => {
        if (!newAttr.name || !newAttr.label) return;

        const attr: AttributeSchema = {
            name: newAttr.name,
            label: newAttr.label,
            type: newAttr.type as any,
            defaultValue: newAttr.defaultValue,
            min: newAttr.min,
            max: newAttr.max,
            options: newAttr.options,
            placeholder: newAttr.placeholder
        };

        onChange([...attributes, attr]);
        setNewAttr({ type: 'text', defaultValue: '' });
        setIsAdding(false);
    };

    const removeAttribute = (index: number) => {
        const updated = attributes.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> Configurable Attributes
                </h4>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} disabled={isAdding}>
                    <Plus className="w-3 h-3 mr-1" /> Add Attribute
                </Button>
            </div>

            {attributes.length === 0 && !isAdding && (
                <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-400">No configuration attributes defined.</p>
                </div>
            )}

            <div className="space-y-2">
                {attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group">
                        <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-800 dark:text-white">{attr.label}</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 font-mono capitalize">
                                    {attr.type}
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono">key: {attr.name}</div>
                        </div>
                        <div className="text-xs text-slate-500">
                            Def: {String(attr.defaultValue)}
                        </div>
                        <button
                            onClick={() => removeAttribute(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {isAdding && (
                <Card className="p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Display Label</label>
                            <input
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                placeholder="e.g. Number of Digits"
                                value={newAttr.label || ''}
                                onChange={e => setNewAttr({ ...newAttr, label: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Variable Name (Key)</label>
                            <input
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                placeholder="e.g. digits"
                                value={newAttr.name || ''}
                                onChange={e => setNewAttr({ ...newAttr, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Data Type</label>
                            <select
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                value={newAttr.type}
                                onChange={e => setNewAttr({ ...newAttr, type: e.target.value as any })}
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean (Switch)</option>
                                <option value="select">Select Dropdown</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Default Value</label>
                            <input
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                placeholder="Default value..."
                                value={newAttr.defaultValue}
                                onChange={e => setNewAttr({ ...newAttr, defaultValue: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Type specific config */}
                    {newAttr.type === 'select' && (
                        <div className="mb-3">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Options (comma separated)</label>
                            <input
                                className="w-full text-sm p-2 rounded border border-slate-300"
                                placeholder="Option 1, Option 2, Option 3"
                                onChange={e => setNewAttr({ ...newAttr, options: e.target.value.split(',').map(s => s.trim()) })}
                            />
                        </div>
                    )}

                    {newAttr.type === 'number' && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Min Value</label>
                                <input type="number" className="w-full text-sm p-2 rounded border border-slate-300"
                                    onChange={e => setNewAttr({ ...newAttr, min: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Max Value</label>
                                <input type="number" className="w-full text-sm p-2 rounded border border-slate-300"
                                    onChange={e => setNewAttr({ ...newAttr, max: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAdd} disabled={!newAttr.name || !newAttr.label}>Add Attribute</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};
