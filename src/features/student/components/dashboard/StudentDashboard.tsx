import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins, Target, Flame, Trophy, Star, BookOpen,
    TrendingUp, Award, Zap, ChevronRight, ChevronLeft,
    Search, X, Clock,
    type LucideIcon
} from 'lucide-react';
import { Skill, User, Role } from '@types';
import { ProfileMenu } from '@shared/components/layout';
import { Avatar } from '@shared/components/ui';
import { StudentProfile } from '../StudentProfile';
import { SkillGrid } from '../SkillGrid';
import { StudentHero } from './StudentHero';
import { DailyProgress } from './DailyProgress';
import { SubjectScroller } from './SubjectScroller';

interface StudentDashboardProps {
    currentUser: User | undefined;
    streak: number;
    totalXP: number;
    masteredCount: number;
    allApprovedSkills: Skill[];
    goalSkills: Skill[];
    inProgressSkills: Skill[];
    otherSkills: Skill[];
    recommendedSkills: Skill[];
    skills: Skill[];
    sortedDashboardSkills: Skill[];
    skillStatuses: Record<string, any>; // Using any as SkillStatus type is not exported
    userGoals: string[];
    toggleGoal: (skillId: string) => void;
    gameEngine: any;
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    mobileSubjectFilter: string | null;
    setMobileSubjectFilter: (subject: string | null) => void;
    activeSubjectFilter: string | null;
    setActiveSubjectFilter: (subject: string | null) => void;
    subjects: string[];
    getSubjectConfig: (subject: string) => any;
    getIconByName: (name: string) => any;
    getGreeting: () => string;
    isProfileOpen: boolean;
    setIsProfileOpen: (open: boolean) => void;
    handleSaveProfile: (updatedData: Partial<User>) => Promise<void>;
    logoutUser: () => void;
    systemConfig: any;
    setViewMode: (mode: 'dashboard' | 'goals' | 'activity') => void;
    mobileTab: 'learn' | 'ranks' | 'badges';
    skillsBySubject: Record<string, Skill[]>;
    isLoading: boolean;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
    currentUser,
    streak,
    totalXP,
    masteredCount,
    allApprovedSkills,
    goalSkills,
    inProgressSkills,
    otherSkills,
    recommendedSkills,
    skills,
    sortedDashboardSkills,
    skillStatuses,
    userGoals,
    toggleGoal,
    gameEngine,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    mobileSubjectFilter,
    setMobileSubjectFilter,
    activeSubjectFilter,
    setActiveSubjectFilter,
    subjects,
    getSubjectConfig,
    getIconByName,
    getGreeting,
    isProfileOpen,
    setIsProfileOpen,
    handleSaveProfile,
    logoutUser,
    systemConfig,
    setViewMode,
    mobileTab,
    skillsBySubject,
    isLoading
}) => {
    // Filter lists based on activeSubjectFilter
    const [showAllExplore, setShowAllExplore] = React.useState(false);

    const filteredGoalSkills = activeSubjectFilter
        ? goalSkills.filter(s => s.subject === activeSubjectFilter)
        : goalSkills;

    const filteredInProgressSkills = activeSubjectFilter
        ? inProgressSkills.filter(s => s.subject === activeSubjectFilter)
        : inProgressSkills;

    const filteredOtherSkills = activeSubjectFilter
        ? otherSkills.filter(s => s.subject === activeSubjectFilter)
        : otherSkills;

    return (
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-8">

            {/* ========== MOBILE LAYOUT ========== */}
            {mobileTab === 'learn' && (
                <div className="sm:hidden">
                    {/* Mobile Header */}
                    <div className="px-4 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{getGreeting()} 👋</p>
                                <h1 className="text-xl font-black text-slate-800 dark:text-white">
                                    Hello, {currentUser?.displayName || currentUser?.name || 'Learner'}!
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Search Icon - Only on Learn tab */}
                                {!isSearchOpen && (
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all"
                                    >
                                        <Search className="w-4 h-4 text-slate-500" />
                                    </button>
                                )}
                                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700/50">
                                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                                    <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">{streak}</span>
                                </div>
                                <div className="relative">
                                    <ProfileMenu
                                        user={currentUser}
                                        currentRole={Role.STUDENT}
                                        onExit={logoutUser}
                                        onProfileClick={() => setIsProfileOpen(true)}
                                        roleConfig={{
                                            label: currentUser?.displayName || currentUser?.name || 'Student',
                                            avatar: currentUser?.avatar || '👨‍🎓',
                                            gradient: 'from-emerald-500 to-teal-500'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Expandable Search Bar with Framer Motion */}
                        <AnimatePresence>
                            {isSearchOpen && (
                                <>
                                    {/* Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="fixed inset-0 bg-black/20 z-40"
                                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                    />
                                    {/* Search Input */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25,
                                            duration: 0.25
                                        }}
                                        className="relative z-50"
                                    >
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                        <input
                                            type="text"
                                            placeholder="Search skills..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-500 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none shadow-lg shadow-indigo-500/20"
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-3.5 h-3.5 text-slate-500" />
                                        </motion.button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Search Results Mode */}
                    {searchQuery ? (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2 px-4">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    Results for "{searchQuery}"
                                </h3>
                                <span className="text-xs text-slate-400">{sortedDashboardSkills.length} skills</span>
                            </div>
                            <SkillGrid
                                skills={sortedDashboardSkills}
                                userGoals={userGoals}
                                skillStatuses={skillStatuses}
                                onStartPractice={gameEngine.startPractice}
                                onToggleGoal={(e, id) => toggleGoal(id)}
                            />
                        </div>
                    ) : mobileSubjectFilter ? (
                        /* Filtered by Subject Mode */
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2 px-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setMobileSubjectFilter(null)}
                                        className="mr-1 -ml-2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                                    </button>
                                    {(() => {
                                        const FilterIcon = getIconByName(getSubjectConfig(mobileSubjectFilter).icon);
                                        return <FilterIcon className="w-5 h-5 text-indigo-500" />;
                                    })()}
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{mobileSubjectFilter}</h3>
                                </div>
                                <span className="text-xs text-slate-400">{skillsBySubject[mobileSubjectFilter]?.length || 0} skills</span>
                            </div>
                            <SkillGrid
                                skills={skillsBySubject[mobileSubjectFilter] || []}
                                userGoals={userGoals}
                                skillStatuses={skillStatuses}
                                onStartPractice={gameEngine.startPractice}
                                onToggleGoal={(e, id) => toggleGoal(id)}
                            />
                        </div>
                    ) : (
                        /* Smart Navigation Mode (Default) - REDESIGNED */
                        <div className="pb-24 animate-in fade-in slide-in-from-bottom duration-500">
                            {/* 1. Hero */}
                            <div className="px-4">
                                <StudentHero
                                    skill={inProgressSkills[0] || goalSkills[0] || recommendedSkills[0] || skills[0]}
                                    onPlay={(id) => gameEngine.startPractice(skills.find(s => s.id === id)!)}
                                    streak={streak}
                                    skillStatus={skillStatuses[(inProgressSkills[0] || goalSkills[0] || recommendedSkills[0] || skills[0])?.id]}
                                    isLoading={isLoading}
                                />
                            </div>

                            {/* 2. Daily Progress */}
                            <div className="px-4">
                                <DailyProgress
                                    completedCount={Object.values(skillStatuses).filter(s => s.mastered).length} // TODO: Filter by today
                                    totalGoal={currentUser?.dailyGoal || 5}
                                />
                            </div>

                            {/* 3. Subject Scroller */}
                            <div className="px-4">
                                <SubjectScroller
                                    subjects={subjects.map(sub => {
                                        const conf = getSubjectConfig(sub);
                                        return {
                                            name: sub,
                                            icon: getIconByName(conf.icon),
                                            bgClass: conf.bg,
                                            textClass: conf.color,
                                            count: skillsBySubject[sub]?.length || 0
                                        };
                                    })}
                                    onSelect={(s) => setMobileSubjectFilter(s)}
                                />
                            </div>

                            {/* 4. Recommendation */}
                            {recommendedSkills.length > 0 && (
                                <div className="px-4 mb-8">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Just For You</h3>
                                    </div>
                                    <SkillGrid
                                        skills={recommendedSkills.slice(0, 2)}
                                        userGoals={userGoals}
                                        skillStatuses={skillStatuses}
                                        onStartPractice={gameEngine.startPractice}
                                        onToggleGoal={(e, id) => toggleGoal(id)}
                                    />
                                </div>
                            )}

                            {/* 5. Explore Skills (Mobile) */}
                            <div className="px-4 mb-4">
                                {filteredOtherSkills.length > 0 && (
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                            All Skills
                                        </h3>
                                        {filteredOtherSkills.length > 10 && (
                                            <button
                                                onClick={() => setShowAllExplore(!showAllExplore)}
                                                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors"
                                            >
                                                {showAllExplore ? 'Show Less' : 'Show More'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <SkillGrid
                                    skills={showAllExplore ? filteredOtherSkills : filteredOtherSkills.slice(0, 10)}
                                    userGoals={userGoals}
                                    skillStatuses={skillStatuses}
                                    onStartPractice={gameEngine.startPractice}
                                    onToggleGoal={(e, id) => toggleGoal(id)}
                                />
                            </div>
                        </div>

                    )}
                </div>
            )}

            {/* ========== DESKTOP LAYOUT ========== */}
            <div className="hidden sm:block">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900 px-6 pt-8 pb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="animate-in fade-in slide-in-from-left duration-500">
                            <p className="text-indigo-200 text-sm font-medium mb-1">{getGreeting()} 👋</p>
                            <h1 className="text-3xl font-black text-white mb-1">
                                Welcome Back, {currentUser?.displayName || currentUser?.name || 'Learner'}!
                            </h1>
                            <p className="text-indigo-200/80 text-base">Let's continue your learning journey</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
                    <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                        <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl p-5 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200/50">
                                    <Flame className="w-6 h-6 text-white fill-white" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Streak</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{streak} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">days</span></p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl p-5 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                                    <Coins className="w-6 h-6 text-white" />
                                </div>
                                <Zap className="w-5 h-5 text-indigo-500" />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total XP</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{totalXP.toLocaleString()}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl p-5 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <Award className="w-5 h-5 text-emerald-500" />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Skills Mastered</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{masteredCount} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/ {allApprovedSkills.length}</span></p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl p-5 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200/50">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Goals</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{goalSkills.length}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto w-full px-6 pt-8 pb-6 space-y-8">
                    {/* Subject Categories for Desktop */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Browse by Subject</h2>
                        </div>
                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* All Subjects Option */}
                            <div
                                onClick={() => setActiveSubjectFilter(null)}
                                className={`
                    rounded-2xl p-4 border shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center
                    ${activeSubjectFilter === null
                                        ? 'bg-indigo-600 border-indigo-600 shadow-indigo-200/50 dark:shadow-none'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-indigo-100/20 dark:shadow-none hover:shadow-xl hover:-translate-y-1'}
                  `}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${activeSubjectFilter === null ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className={`font-bold ${activeSubjectFilter === null ? 'text-white' : 'text-slate-800 dark:text-white'}`}>All</h3>
                                <p className={`text-xs mt-1 ${activeSubjectFilter === null ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {allApprovedSkills.length} skills
                                </p>
                            </div>

                            {subjects.map((subject) => {
                                const config = getSubjectConfig(subject);
                                const skillCount = skillsBySubject[subject]?.length || 0;
                                const masteredInSubject = skillsBySubject[subject]?.filter(s => skillStatuses[s.id]?.mastered).length || 0;
                                const isActive = activeSubjectFilter === subject;

                                return (
                                    <div
                                        key={subject}
                                        onClick={() => setActiveSubjectFilter(isActive ? null : subject)}
                                        className={`
                        rounded-2xl p-4 border shadow-xl transition-all cursor-pointer
                        ${isActive
                                                ? 'bg-indigo-600 border-indigo-600 shadow-indigo-200/50 dark:shadow-none ring-2 ring-offset-2 ring-indigo-600 dark:ring-offset-slate-950'
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-indigo-100/20 dark:shadow-none hover:shadow-xl hover:-translate-y-1'}
                    `}
                                    >
                                        {config.imageUrl ? (
                                            <img
                                                src={config.imageUrl}
                                                alt={subject}
                                                className="w-14 h-14 rounded-xl object-cover mb-3 shadow-sm"
                                            />
                                        ) : (
                                            <div className={`w-14 h-14 ${isActive ? 'bg-white/20 text-white' : config.bg + ' ' + config.color} rounded-xl flex items-center justify-center mb-3`}>
                                                {(() => { const Icon = getIconByName(config.icon); return <Icon className="w-7 h-7" />; })()}
                                            </div>
                                        )}
                                        <h3 className={`font-bold ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{subject}</h3>
                                        <p className={`text-xs mt-1 ${isActive ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{skillCount} skills • {masteredInSubject} mastered</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {filteredGoalSkills.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-left duration-500 delay-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="w-6 h-6 text-amber-500" />
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Priority Goals</h2>
                                </div>
                                <button
                                    onClick={() => setViewMode('goals')}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                    See All <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <SkillGrid
                                skills={filteredGoalSkills}
                                userGoals={userGoals}
                                skillStatuses={skillStatuses}
                                onStartPractice={gameEngine.startPractice}
                                onToggleGoal={(e, id) => toggleGoal(id)}
                            />
                        </div>
                    )}

                    {/* Continue Learning Desktop */}
                    {filteredInProgressSkills.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-left duration-500 delay-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-none">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Continue Learning</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Pick up where you left off</p>
                                    </div>
                                </div>
                            </div>
                            <SkillGrid
                                skills={filteredInProgressSkills.slice(0, 4)}
                                userGoals={userGoals}
                                skillStatuses={skillStatuses}
                                onStartPractice={gameEngine.startPractice}
                                onToggleGoal={(e, id) => toggleGoal(id)}
                            />
                        </div>
                    )}

                    <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 dark:shadow-none">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        {filteredGoalSkills.length > 0 ? "All Available Skills" : "Explore Skills"}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{filteredOtherSkills.length} skills to explore</p>
                                </div>
                            </div>
                        </div>
                        <SkillGrid
                            skills={filteredOtherSkills}
                            userGoals={userGoals}
                            skillStatuses={skillStatuses}
                            onStartPractice={gameEngine.startPractice}
                            onToggleGoal={(e, id) => toggleGoal(id)}
                        />
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <StudentProfile
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={currentUser}
                onSave={handleSaveProfile}
                onLogout={() => {
                    setIsProfileOpen(false);
                    logoutUser();
                }}
                stats={{
                    totalXP,
                    masteredCount,
                    streak,
                    totalSkills: allApprovedSkills.length
                }}
                availableGrades={systemConfig.grades.map(g => g.id)}
            />
        </div >
    );
};
