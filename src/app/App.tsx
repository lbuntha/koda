import React, { useState } from 'react';
import { Role } from '@types';
import { ThemeProvider, useTheme } from '@theme/index';
import { Navbar, SafeAreaHeader } from '@shared/components/layout';
import { useAuth, LoginPage, SignUpPage, logoutUser, RoleSelectionCard } from '@auth';

import { AdminView } from '@features/admin';
import { TeacherView } from '@features/teacher';
import { StudentView } from '@features/student';
import { ParentView } from '@features/parent';

import { ProfileSelector } from '@features/parent/components/ProfileSelector';
import { ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
    const { user, loading, isAuthenticated } = useAuth();
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const { resolvedMode } = useTheme();
    const isDark = resolvedMode === 'dark';

    const bgStyle = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50/50 text-slate-900';

    // Reset profile selection on logout
    React.useEffect(() => {
        if (!isAuthenticated) setActiveProfileId(null);
    }, [isAuthenticated]);

    // Loading State
    if (loading) {
        return (
            <div className={`min-h-screen ${bgStyle} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Unauthenticated State
    if (!isAuthenticated) {
        return authMode === 'login'
            ? <LoginPage onNavigateToRegister={() => setAuthMode('register')} />
            : <SignUpPage onNavigateToLogin={() => setAuthMode('login')} />;
    }

    // Authenticated State
    const currentRole = user?.role || Role.NONE;

    // --- PARENT FLOW: Profile Selection ---
    if (currentRole === Role.PARENT && !activeProfileId) {
        return <ProfileSelector parentUser={user!} onSelectProfile={setActiveProfileId} />;
    }

    // Determine what to render based on profile selection
    // If Parent selected themselves -> render ParentView
    // If Parent selected child -> render StudentView for that child
    // If Admin/Teacher/Student logged in directly -> render their standard views

    const isImpersonatingChild = currentRole === Role.PARENT && activeProfileId && activeProfileId !== user?.id;

    return (
        <div className={`min-h-screen ${bgStyle}`}>
            {/* Navigation Bar */}
            {/* Hide standard navbar if we are in "impersonation" mode to give focused view, OR show a special "Return" bar */}
            {currentRole !== Role.NONE && currentRole !== Role.ADMIN && (
                <>
                    {/* Special bar for Parent-viewing-as-Child */}
                    {isImpersonatingChild ? (
                        <SafeAreaHeader dark withBorder={false} className="px-4 py-3 flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-500 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-slate-900 uppercase whitespace-nowrap">Child View</span>
                                <span className="text-xs md:text-sm text-slate-300 truncate max-w-[120px] md:max-w-none">Viewing as child</span>
                            </div>
                            <button
                                onClick={() => setActiveProfileId(null)}
                                className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold hover:text-indigo-400 transition-colors whitespace-nowrap"
                            >
                                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden xs:inline">Switch Profile</span><span className="xs:hidden">Exit</span>
                            </button>
                        </SafeAreaHeader>
                    ) : (
                        <Navbar
                            currentRole={currentRole}
                            onExit={() => {
                                if (currentRole === Role.PARENT) setActiveProfileId(null);
                                else logoutUser();
                            }}
                            user={user}
                            onProfileClick={() => {
                                if (currentRole === Role.STUDENT) {
                                    window.dispatchEvent(new Event('open-student-profile'));
                                } else if (currentRole === Role.PARENT) {
                                    window.dispatchEvent(new Event('open-parent-profile'));
                                } else if (currentRole === Role.TEACHER) {
                                    window.dispatchEvent(new Event('open-teacher-profile'));
                                }
                            }}
                        // If Parent, "Logout" really means "Switch Profile" or actuall logout? 
                        // Usually "Exit" on Navbar logs out. We might want a "Switch Profile" option in the menu.
                        // For now, let's keep it simple: Logout logs out completely.
                        />
                    )}
                </>
            )}

            {/* Main Container */}
            <main className={currentRole === Role.ADMIN || isImpersonatingChild ? "w-full h-full min-h-screen" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
                <div className={currentRole === Role.ADMIN ? "h-full" : "min-h-[80vh]"}>
                    {currentRole === Role.TEACHER && <TeacherView />}
                    {currentRole === Role.STUDENT && <StudentView currentUser={user!} />}

                    {currentRole === Role.PARENT && (
                        <>
                            {activeProfileId === user?.id ? (
                                <ParentView />
                            ) : (
                                <StudentView studentId={activeProfileId!} />
                            )}
                        </>
                    )}

                    {currentRole === Role.ADMIN && <AdminView onExit={logoutUser} />}
                    {currentRole === Role.NONE && <RoleSelectionCard user={user} />}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider defaultMode="system">
            <AppContent />
        </ThemeProvider>
    );
};

export default App;
