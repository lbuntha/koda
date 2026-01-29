// LibraryManagement - Component library tab content with search and dark mode
import React, { useState, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, ShieldCheck, Search } from 'lucide-react';
import { Skill } from '@types';
import { Card, Button, Badge } from '@shared/components/ui';

interface LibraryManagementProps {
    components: Skill[];
    onCreateNew: () => void;
    onEdit: (component: Skill) => void;
    onDelete: (id: string) => void;
    onPreview: (component: Skill) => void;
    onTogglePublish: (component: Skill) => void;
}

export const LibraryManagement: React.FC<LibraryManagementProps> = ({
    components,
    onCreateNew,
    onEdit,
    onDelete,
    onPreview,
    onTogglePublish
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter components by search
    const filteredComponents = useMemo(() => {
        if (!searchQuery.trim()) return components;
        const query = searchQuery.toLowerCase();
        return components.filter(comp =>
            comp.skillName.toLowerCase().includes(query) ||
            comp.subject?.toLowerCase().includes(query) ||
            comp.grade?.toLowerCase().includes(query) ||
            comp.example?.toLowerCase().includes(query)
        );
    }, [components, searchQuery]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Skill Templates Management</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage reusable skill templates and curriculum blueprints.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search templates..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                    <Button onClick={onCreateNew}>
                        <Plus className="w-4 h-4 mr-2" /> Create Template
                    </Button>
                </div>
            </div>

            {filteredComponents.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-slate-400 dark:text-slate-500">
                        {searchQuery ? 'No templates match your search.' : 'No templates created yet.'}
                    </p>
                    {!searchQuery && (
                        <Button className="mt-4" onClick={onCreateNew}>
                            <Plus className="w-4 h-4 mr-2" /> Create Your First Template
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredComponents.map(comp => (
                        <Card key={comp.id} className="relative group flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Badge color={comp.moderationStatus === 'APPROVED' ? 'green' : 'slate'}>
                                    {comp.moderationStatus === 'APPROVED' ? 'Published' : 'Draft'}
                                </Badge>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h4 className="font-bold text-slate-800 dark:text-white mt-2 pr-24 line-clamp-1" title={comp.skillName}>
                                    {comp.skillName}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-8">{comp.example}</p>
                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 dark:text-slate-500">
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                                        {comp.grade}
                                    </span>
                                    <span>•</span>
                                    <span className="dark:text-slate-400">{comp.subject}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                                <Button size="sm" variant="outline" onClick={() => onPreview(comp)}>
                                    <Eye className="w-3 h-3 mr-1" /> Preview
                                </Button>

                                <Button
                                    size="sm"
                                    variant={comp.moderationStatus === 'APPROVED' ? 'ghost' : 'primary'}
                                    className={comp.moderationStatus === 'APPROVED'
                                        ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                                        : 'bg-indigo-600'}
                                    onClick={() => onTogglePublish(comp)}
                                >
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    {comp.moderationStatus === 'APPROVED' ? 'Unpublish' : 'Publish'}
                                </Button>
                            </div>

                            {/* Hover Action Buttons */}
                            <div className="absolute top-16 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(comp)}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => onDelete(comp.id)}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-700 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Results count */}
            {searchQuery && filteredComponents.length > 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                    Showing {filteredComponents.length} of {components.length} templates
                </p>
            )}
        </div>
    );
};
