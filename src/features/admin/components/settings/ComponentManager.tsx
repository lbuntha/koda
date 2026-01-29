
import React, { useState, useEffect } from 'react';
import { QuestionTypeDef } from '@services/questionTypeRegistry';
import { getAllComponents, saveComponentDef, deleteComponentDef } from '@stores/componentStore';
import { Button, Card, Badge } from '@shared/components/ui';
import { Plus, Edit, Trash2, Box, RefreshCw } from 'lucide-react';
import { ComponentEditor } from './ComponentEditor';

export const ComponentManager: React.FC = () => {
    const [components, setComponents] = useState<QuestionTypeDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
    const [editingDef, setEditingDef] = useState<Partial<QuestionTypeDef> | undefined>(undefined);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllComponents();
            setComponents(data);
        } catch (e) {
            console.error("Failed to load components", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setEditingDef(undefined);
        setView('EDITOR');
    };

    const handleEdit = (def: QuestionTypeDef) => {
        setEditingDef(def);
        setView('EDITOR');
    };

    const handleSave = async (def: QuestionTypeDef) => {
        await saveComponentDef(def);
        await loadData();
        setView('LIST');
    };

    const handleDelete = async (id: string) => {
        if (confirm(`Are you sure you want to delete component "${id}"?`)) {
            try {
                await deleteComponentDef(id);
                await loadData();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    if (view === 'EDITOR') {
        return (
            <ComponentEditor
                initialData={editingDef}
                onSave={handleSave}
                onCancel={() => setView('LIST')}
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Box className="w-6 h-6 text-indigo-600" />
                        Question Types
                    </h2>
                    <p className="text-sm text-slate-500">Define the technical structure and logic for questions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" /> Create Type
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {components.map(comp => {
                    const isSystem = ['vertical-math', 'visual-counter', 'multiple-choice', 'fill-blank'].includes(comp.id); // Simple check, or use logic from store

                    return (
                        <Card key={comp.id} className="relative group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-2">
                                <Badge color="indigo" className="font-mono text-[10px]">{comp.id}</Badge>
                                {isSystem && <Badge color="slate" className="text-[10px]">System Default</Badge>}
                            </div>

                            <h3 className="font-bold text-slate-800 dark:text-white mb-1">{comp.label}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8 font-mono bg-slate-50 dark:bg-slate-800 p-1.5 rounded mb-3">
                                {comp.defaultAiPrompt}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400">
                                    {comp.attributes?.length || 0} Config Attributes
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(comp)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {!isSystem && (
                                        <button
                                            onClick={() => handleDelete(comp.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
