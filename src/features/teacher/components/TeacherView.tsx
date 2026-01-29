import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Sparkles, List, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getStoredSkills, addSkills, updateSkill, getSystemConfig, SystemConfig, deleteSkill, publishSkill, DEFAULT_SYSTEM_CONFIG } from '@stores';
import { Skill, Role } from '@types';
import { ComponentBuilder } from '@shared/components/ComponentBuilder';
import { ComponentPreviewModal } from './ComponentPreviewModal';
import { QuizGenerationModal } from './QuizGenerationModal';
import { ConfirmationModal } from '@shared/components/ui';
import { AIGenerator } from './AIGenerator';
import { CurriculumTable } from './CurriculumTable';
import { TeacherProfile } from './TeacherProfile';
import { updateUser } from '@stores';
import { Avatar } from '@shared/components/ui';
import { GradeCatalogGrid } from './GradeCatalogGrid';

export const TeacherView: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

    // Navigation State
    const [catalogView, setCatalogView] = useState<'CATALOG' | 'DETAILS'>('CATALOG');
    const [activeFilter, setActiveFilter] = useState<{ grade?: string; subject?: string }>({});

    // Curriculum View State
    const [curriculumView, setCurriculumView] = useState<'LIVE' | 'PENDING'>('PENDING');

    // Profile State
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Modal States
    const [previewComponent, setPreviewComponent] = useState<Skill | null>(null);

    // Quiz Generator State
    const [quizGenState, setQuizGenState] = useState<{
        isOpen: boolean;
        template: Skill | null;
        mode: 'CREATE' | 'EDIT';
    }>({ isOpen: false, template: null, mode: 'CREATE' });

    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [deleteData, setDeleteData] = useState<{ isOpen: boolean, skillId: string | null }>({ isOpen: false, skillId: null });
    const { user } = useAuth();

    useEffect(() => {
        const handleOpenProfile = () => setIsProfileOpen(true);
        window.addEventListener('open-teacher-profile', handleOpenProfile);

        const load = async () => {
            setSkills(await getStoredSkills());
            setSystemConfig(await getSystemConfig());
        }
        load();

        return () => {
            window.removeEventListener('open-teacher-profile', handleOpenProfile);
        };
    }, []);

    const refreshSkills = async () => {
        setSkills(await getStoredSkills());
    };

    const handleGenerateSuccess = async (newSkills: Skill[]) => {
        await addSkills(newSkills);
        await refreshSkills();
        setCurriculumView('PENDING'); // Auto switch to pending to see new items
    };

    const handlePublishSkill = async (id: string) => {
        await publishSkill(id, user?.name);
        await refreshSkills();
    };

    // Navigation Handlers
    const handleSelectGradeSubject = (grade: string, subject?: string) => {
        setActiveFilter({ grade, subject });
        setCatalogView('DETAILS');
    };

    const handleBackToCatalog = () => {
        setCatalogView('CATALOG');
        setActiveFilter({});
    };

    // Filter Skills for Detail View
    const filteredSkills = skills.filter(s => {
        if (activeFilter.grade && s.grade !== activeFilter.grade) return false;
        if (activeFilter.subject && s.subject !== activeFilter.subject) return false;
        return true;
    });



    // Callback when QuizGenerator finishes
    const handleQuizGenComplete = async (resultSkill: Skill) => {
        if (quizGenState.mode === 'CREATE') {
            await addSkills([resultSkill]);

            // If we created a quiz from a template that IS in our skills list (e.g. "Gen Questions" on a draft),
            // we should remove the original placeholder to avoid duplicates.
            if (quizGenState.template && skills.some(s => s.id === quizGenState.template?.id)) {
                await deleteSkill(quizGenState.template.id);
            }

            setCurriculumView('LIVE'); // Auto switch to live view
        } else {
            await updateSkill(resultSkill);
        }
        await refreshSkills();
        setQuizGenState({ isOpen: false, template: null, mode: 'CREATE' });
    };

    const openQuizGenForSkill = (skill: Skill) => {
        // If no questions exist, treat as creation flow to allow full generation
        const hasQuestions = skill.questionBank && skill.questionBank.length > 0;
        setQuizGenState({
            isOpen: true,
            template: skill,
            mode: hasQuestions ? 'EDIT' : 'CREATE'
        });
    };

    const handleUpdateSkill = async (updated: Skill) => {
        await updateSkill(updated);
        await refreshSkills();
        setEditingSkill(null);
    };

    const requestDelete = (id: string) => {
        setDeleteData({ isOpen: true, skillId: id });
    };

    const confirmDelete = async () => {
        if (deleteData.skillId) {
            await deleteSkill(deleteData.skillId);
            await refreshSkills();
            setDeleteData({ isOpen: false, skillId: null });
        }
    };

    // Calculate Stats
    const stats = {
        total: skills.length,
        drafts: skills.filter(s => s.moderationStatus === 'PENDING').length,
        premium: skills.filter(s => s.accessLevel === 'premium').length
    };

    const handleSaveProfile = async (updates: Partial<typeof user>) => {
        if (!user) return;
        console.log('[TeacherView] Saving profile:', updates);
        const updatedUser = { ...user, ...updates };
        await updateUser(updatedUser as any); // Type assertion needed due to some type mismatch in store vs auth hook potentially
        window.dispatchEvent(new Event('user-profile-updated')); // Same pattern as StudentView
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 dark:bg-[#0B1120] min-h-screen p-6 md:p-8 transition-colors duration-300">
            <ComponentPreviewModal
                isOpen={!!previewComponent}
                component={previewComponent}
                onClose={() => setPreviewComponent(null)}
            />

            <QuizGenerationModal
                isOpen={quizGenState.isOpen}
                template={quizGenState.template}
                mode={quizGenState.mode}
                initialQuestions={quizGenState.template?.questionBank}
                onClose={() => setQuizGenState({ ...quizGenState, isOpen: false })}
                onPublish={handleQuizGenComplete}
                userId={user?.id || 'teacher-default'}
            />

            <TeacherProfile
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onSave={handleSaveProfile}
            />

            {editingSkill && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative">
                        <ComponentBuilder
                            initialData={editingSkill}
                            onSave={handleUpdateSkill}
                            onCancel={() => setEditingSkill(null)}
                            initialSection={editingSkill.section}
                            isLibraryTemplate={false}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={deleteData.isOpen}
                title="Remove Skill?"
                message="Are you sure you want to delete this curriculum item? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteData({ isOpen: false, skillId: null })}
                confirmLabel="Delete"
                isDanger={true}
            />

            {/* Header & Stats */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {catalogView === 'DETAILS' ? (
                            <button
                                onClick={handleBackToCatalog}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors group"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600" />
                            </button>
                        ) : (
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <LayoutDashboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        )}

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {catalogView === 'CATALOG' ? 'Curriculum Architect' : `${activeFilter.grade} Curriculum`}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {catalogView === 'CATALOG'
                                    ? 'Design, manage, and publish AI-powered learning paths.'
                                    : `Managing learning objectives for ${activeFilter.grade} ${activeFilter.subject ? `- ${activeFilter.subject}` : ''}`
                                }
                            </p>
                        </div>
                    </div>

                </div>

                {/* Always Show Stats in Catalog, Optional in Details */}
                {catalogView === 'CATALOG' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Modules</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.drafts}</h3>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                                <FileText className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Premium Content</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.premium}</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                )}
            </div >

            {/* MAIN CONTENT AREA */}
            {catalogView === 'CATALOG' ? (
                <GradeCatalogGrid
                    skills={skills}
                    onSelectGradeSubject={handleSelectGradeSubject}
                    gradeConfigs={systemConfig.grades}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
                    {/* Generator Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-8">
                            <AIGenerator
                                systemConfig={systemConfig}
                                onGenerateSuccess={handleGenerateSuccess}
                                onLoadingChange={setIsLoading}
                                userId={user?.id || 'teacher-default'}
                            // Optional: Pass active filters to pre-fill generator
                            // grade={activeFilter.grade}
                            />
                        </div>
                    </div>

                    {/* Curriculum View */}
                    <div className="lg:col-span-8">
                        <CurriculumTable
                            skills={filteredSkills}
                            viewMode={curriculumView}
                            onViewModeChange={setCurriculumView}
                            onPublish={handlePublishSkill}
                            onEdit={setEditingSkill}
                            onDelete={requestDelete}
                            onGenQuestions={openQuizGenForSkill}
                        />
                    </div>
                </div>
            )}
        </div >
    );
};
