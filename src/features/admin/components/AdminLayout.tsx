// AdminLayout - Main admin panel layout with sidebar
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit, User as UserIcon } from 'lucide-react';
import {
    getUsers, addUser, updateUser, deleteUser, getStudentResults,
    bulkDeleteUsers
} from '@stores';
import { getComponentLibrary, addLibraryComponent, updateLibraryComponent, deleteLibraryComponent } from '@stores';
import { Skill, User, Role } from '@types';
import { Card, Button, ConfirmationModal, Badge, DataTable, Column } from '@shared/components/ui';
import { ComponentBuilder } from '@shared/components/ComponentBuilder';
import { LibraryPreviewModal } from './LibraryPreviewModal';
import { Dashboard } from './Dashboard';
import { TokenLogViewer } from './TokenLogViewer';
import { UserModal } from './UserModal';
import { SystemSettings } from './SystemSettings';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { LibraryManagement } from './LibraryManagement';

interface AdminLayoutProps {
    onExit: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExit }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Dashboard Stats
    const [stats, setStats] = useState({ totalUsers: 0, activeStudents: 0, totalQuizzes: 0 });

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // Library State
    const [libraryComponents, setLibraryComponents] = useState<Skill[]>([]);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<Skill | null>(null);
    const [previewComponent, setPreviewComponent] = useState<Skill | null>(null);

    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void> | void;
    }>({ isOpen: false, title: '', message: '', action: () => { } });

    const openConfirm = (title: string, message: string, action: () => Promise<void> | void) => {
        setConfirmState({ isOpen: true, title, message, action });
    };

    // Load Data Effects
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        const allUsers = await getUsers();
        setUsers(allUsers);

        const results = await getStudentResults();
        setStats({
            totalUsers: allUsers.length,
            activeStudents: allUsers.filter(u => u.role === Role.STUDENT && u.status === 'Active').length,
            totalQuizzes: results.length
        });

        setLibraryComponents(getComponentLibrary());
    };

    // User Handlers
    const handleSaveUser = async (user: User) => {
        setIsSavingUser(true);
        try {
            if (users.find(u => u.id === user.id)) {
                await updateUser(user);
            } else {
                await addUser(user);
            }
            await loadData();
            setIsUserModalOpen(false);
            setEditingUser(null);
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        openConfirm(
            "Delete User?",
            "Are you sure you want to delete this user? This action cannot be undone.",
            async () => {
                setIsDeletingUser(true);
                try {
                    await deleteUser(id);
                    await loadData();
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                } finally {
                    setIsDeletingUser(false);
                }
            }
        );
    };

    const handleToggleUser = (id: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedUserIds(newSet);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedUserIds(new Set(users.map(u => u.id)));
        else setSelectedUserIds(new Set());
    };

    const handleBulkDelete = async () => {
        openConfirm(
            "Delete Users?",
            `Are you sure you want to delete ${selectedUserIds.size} users? This cannot be undone.`,
            async () => {
                setIsDeletingUser(true);
                try {
                    await bulkDeleteUsers(Array.from(selectedUserIds));
                    await loadData();
                    setSelectedUserIds(new Set());
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                } finally {
                    setIsDeletingUser(false);
                }
            }
        );
    };

    // User table column definitions
    const userColumns: Column<User>[] = useMemo(() => [
        {
            key: 'name',
            header: 'User',
            searchable: true,
            render: (_, user) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {user.name?.[0] || <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                    </div>
                </div>
            ),
            getValue: (user) => `${user.name} ${user.email}`,
        },
        {
            key: 'role',
            header: 'Role',
            width: 'w-28',
            render: (_, user) => (
                <Badge color={user.role === Role.TEACHER ? 'blue' : user.role === Role.STUDENT ? 'green' : user.role === Role.ADMIN ? 'red' : 'purple'}>
                    {user.role}
                </Badge>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            width: 'w-28',
            render: (_, user) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${user.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        user.status === 'Inactive' ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700' :
                            'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Inactive' ? 'bg-slate-400' : 'bg-rose-500'}`}></span>
                    {user.status}
                </span>
            ),
        },
        {
            key: 'tokenUsage',
            header: 'Tokens',
            width: 'w-28',
            render: (_, user) => (
                <div className="text-xs">
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                        {(user.tokenUsage || 0).toLocaleString()}
                    </div>
                </div>
            ),
            getValue: (user) => user.tokenUsage || 0,
        },
        {
            key: 'lastLogin',
            header: 'Last Login',
            width: 'w-32',
            render: (value) => (
                <span className="text-slate-500 dark:text-slate-400 text-xs">{formatLastLogin(value)}</span>
            ),
        },
    ], []);

    // Format last login helper
    const formatLastLogin = (dateString: string | undefined): string => {
        if (!dateString) return 'Never';
        if (dateString === 'Just now' || dateString === 'Never') return dateString;
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    // Library Handlers
    const handleSaveComponent = (component: Skill) => {
        if (libraryComponents.find(c => c.id === component.id)) {
            updateLibraryComponent(component);
        } else {
            addLibraryComponent(component);
        }
        setLibraryComponents(getComponentLibrary());
        setIsBuilderOpen(false);
        setEditingComponent(null);
    };

    const handleDeleteComponent = (id: string) => {
        openConfirm(
            "Delete Template?",
            "Are you sure you want to remove this component template from the library?",
            () => {
                deleteLibraryComponent(id);
                setLibraryComponents(getComponentLibrary());
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        );
    };

    const handleTogglePublish = (component: Skill) => {
        const newStatus = component.moderationStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
        const updated = { ...component, moderationStatus: newStatus as any };
        updateLibraryComponent(updated);
        setLibraryComponents(getComponentLibrary());
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
                onExit={onExit}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
                <AdminHeader
                    activeTab={activeTab}
                    onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
                    {activeTab === 'DASHBOARD' && (
                        <Dashboard
                            totalUsers={stats.totalUsers}
                            activeStudents={stats.activeStudents}
                            totalQuizzes={stats.totalQuizzes}
                        />
                    )}

                    {activeTab === 'USERS' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex justify-end">
                                <Button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}>
                                    <Plus className="w-4 h-4 mr-2" /> Add User
                                </Button>
                            </div>
                            <DataTable
                                data={users}
                                columns={userColumns}
                                searchable={true}
                                searchPlaceholder="Search users by name or email..."
                                selectable={true}
                                selectedIds={selectedUserIds}
                                onSelectionChange={setSelectedUserIds}
                                paginated={true}
                                pageSize={10}
                                emptyMessage="No users found."
                                bulkActionsSlot={
                                    <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/30" onClick={handleBulkDelete}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                }
                                rowActions={(user) => (
                                    <>
                                        <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            />
                        </div>
                    )}

                    {activeTab === 'LIBRARY' && (
                        <LibraryManagement
                            components={libraryComponents}
                            onCreateNew={() => { setEditingComponent(null); setIsBuilderOpen(true); }}
                            onEdit={(comp) => { setEditingComponent(comp); setIsBuilderOpen(true); }}
                            onDelete={handleDeleteComponent}
                            onPreview={setPreviewComponent}
                            onTogglePublish={handleTogglePublish}
                        />
                    )}

                    {activeTab === 'SETTINGS' && <SystemSettings />}

                    {activeTab === 'LOGS' && <TokenLogViewer />}
                </div>
            </div>

            {/* Modals */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
                user={editingUser}
                onSave={handleSaveUser}
                isLoading={isSavingUser}
            />

            {isBuilderOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
                        <ComponentBuilder
                            initialData={editingComponent || undefined}
                            onSave={handleSaveComponent}
                            onCancel={() => { setIsBuilderOpen(false); setEditingComponent(null); }}
                            isLibraryTemplate={true}
                        />
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <LibraryPreviewModal
                isOpen={!!previewComponent}
                onClose={() => setPreviewComponent(null)}
                component={previewComponent}
            />

            <ConfirmationModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.action}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                isDanger={true}
                confirmLabel="Delete"
                isLoading={isDeletingUser}
            />
        </div>
    );
};


// Re-export as AdminView for backward compatibility
export const AdminView = AdminLayout;
