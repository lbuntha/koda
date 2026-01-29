
import React, { useState } from 'react';
import { QuestionTypeDef } from '@services/questionTypeRegistry';
import { AttributeBuilder } from './AttributeBuilder';
import { Button, Card } from '@shared/components/ui';
import { Save, X, LayoutTemplate, MessageSquare, Tag } from 'lucide-react';

interface ComponentEditorProps {
    initialData?: Partial<QuestionTypeDef>;
    onSave: (data: QuestionTypeDef) => void;
    onCancel: () => void;
}

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
    initialData,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState<Partial<QuestionTypeDef>>(initialData || {
        id: '',
        label: '',
        defaultLayoutId: 'default',
        defaultAiPrompt: '',
        attributes: []
    });

    const isEdit = !!initialData?.id;

    const handleSave = () => {
        if (!formData.id || !formData.label) return;
        onSave(formData as QuestionTypeDef);
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                    {isEdit ? 'Edit Component Definition' : 'Create New Component'}
                </h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Basic Info & Prompt */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Basic Information
                        </h4>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Component Name (Label)</label>
                            <input
                                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                placeholder="e.g. Area & Perimeter"
                                value={formData.label}
                                onChange={e => setFormData({ ...formData, label: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Unique ID</label>
                            <input
                                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono"
                                placeholder="e.g. area-perimeter"
                                value={formData.id}
                                disabled={isEdit}
                                onChange={e => setFormData({ ...formData, id: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Cannot be changed after creation.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Layout Template ID</label>
                            <select
                                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                value={formData.defaultLayoutId}
                                onChange={e => setFormData({ ...formData, defaultLayoutId: e.target.value })}
                            >
                                <option value="default">Default</option>
                                <option value="vertical-math">Vertical Math</option>
                                <option value="visual-counter">Visual Counter</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Default AI Prompt
                        </h4>
                        <textarea
                            className="w-full h-40 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm leading-relaxed"
                            placeholder="Describe how the AI should generate questions for this component..."
                            value={formData.defaultAiPrompt}
                            onChange={e => setFormData({ ...formData, defaultAiPrompt: e.target.value })}
                        />
                        <p className="text-xs text-slate-500">
                            Tip: Use the attribute keys defined on the right in your prompt.
                        </p>
                    </div>
                </div>

                {/* Right Column: Attribute Builder */}
                <div className="border-l border-slate-100 dark:border-slate-800 pl-8">
                    <AttributeBuilder
                        attributes={formData.attributes || []}
                        onChange={attrs => setFormData({ ...formData, attributes: attrs })}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    disabled={!formData.id || !formData.label}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Save className="w-4 h-4 mr-2" /> Save Component
                </Button>
            </div>
        </Card>
    );
};
