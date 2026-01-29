
import React from 'react';
import { AttributeSchema } from '@services/questionTypeRegistry';

interface ComponentAttributeEditorProps {
    schema: AttributeSchema[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
}

export const ComponentAttributeEditor: React.FC<ComponentAttributeEditorProps> = ({
    schema,
    values,
    onChange
}) => {
    if (!schema || schema.length === 0) return null;

    return (
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-2">
                Component Configuration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schema.map((attr) => {
                    const value = values[attr.name] !== undefined ? values[attr.name] : attr.defaultValue;

                    return (
                        <div key={attr.name} className="space-y-1">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                                {attr.label}
                            </label>

                            {attr.type === 'select' && (
                                <select
                                    value={value}
                                    onChange={(e) => onChange(attr.name, e.target.value)}
                                    className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {attr.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            )}

                            {attr.type === 'number' && (
                                <input
                                    type="number"
                                    min={attr.min}
                                    max={attr.max}
                                    value={value}
                                    onChange={(e) => onChange(attr.name, Number(e.target.value))}
                                    className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            )}

                            {attr.type === 'boolean' && (
                                <div className="flex items-center space-x-2 pt-1.5">
                                    <input
                                        type="checkbox"
                                        checked={value === true}
                                        onChange={(e) => onChange(attr.name, e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {value ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            )}

                            {attr.type === 'text' && (
                                <input
                                    type="text"
                                    placeholder={attr.placeholder}
                                    value={value}
                                    onChange={(e) => onChange(attr.name, e.target.value)}
                                    className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
