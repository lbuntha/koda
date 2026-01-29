import React from 'react';
import { Library, Eye, PlayCircle } from 'lucide-react';
import { Button, Badge } from '@shared/components/ui';
import { Skill } from '@types';

interface LibraryPanelProps {
    libraryComponents: Skill[];
    onPreview: (component: Skill) => void;
    onCreateQuiz: (component: Skill) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ libraryComponents, onPreview, onCreateQuiz }) => {
    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-emerald-700">
                    <Library className="w-5 h-5" />
                    <h2 className="font-semibold">Standard Components</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Select a validated component to generate a new quiz for your students.
                </p>
                <div className="space-y-3">
                    {libraryComponents.map(component => (
                        <div key={component.id} className="p-3 border border-slate-100 rounded-lg hover:border-emerald-300 transition-colors bg-slate-50 group">
                            <div className="flex justify-between items-start mb-2">
                                <Badge color="green">Component</Badge>
                                <Badge color="blue">{component.subject}</Badge>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{component.skillName}</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-3 line-clamp-2">{component.example}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs h-8"
                                    onClick={() => onPreview(component)}
                                >
                                    <Eye className="w-3 h-3" /> Preview
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full text-xs h-8"
                                    onClick={() => onCreateQuiz(component)}
                                >
                                    <PlayCircle className="w-3 h-3" /> Create Quiz
                                </Button>
                            </div>
                        </div>
                    ))}
                    {libraryComponents.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-xs italic">
                            No library components available. Ask your administrator to publish some.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
