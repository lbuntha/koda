
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStoredSkills,
  getStudentGoals,
  addStudentGoal,
  removeStudentGoal,
  getSystemConfig, DEFAULT_SYSTEM_CONFIG, SystemConfig,
  getGlobalSettings, DEFAULT_SETTINGS, GlobalSettings,
  getSkillMasteryStatus, updateUser, getUserById,
  resetStudentSkillProgress,
  DEFAULT_SUBJECT_CONFIGS, SubjectConfig,
  getBadges,
  getLeaderboard, LeaderboardEntry
} from '@stores';
import { Skill, SkillRank, Difficulty, User, Role, Badge } from '@types';
import { ConfirmationModal, Avatar } from '@shared/components/ui';
import {
  Coins,
  Target,
  Flame,
  Trophy,
  Star,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  X,
  Bell,
  Play,
  Sparkles,
  // Subject Icons
  Calculator, Sigma, Ruler, Pi, Divide,
  FlaskConical, Microscope, Atom, TestTube2, Dna,
  BookText, Languages, PenLine, ScrollText,
  Landmark, Clock, Globe, Map, Compass,
  Palette, Brush, Paintbrush,
  Music, Music2,
  Code, Binary, Laptop, Terminal,
  Dumbbell, Heart, Activity,
  Leaf, Lightbulb, Brain, GraduationCap,
  type LucideIcon
} from 'lucide-react';

// Hooks
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGameEngine } from '../hooks/useGameEngine';

// Components
import { GameHeader } from './GameHeader';
import { SkillGrid } from './SkillGrid';
import { GameStage } from './GameStage';
import { MasteryModal } from './MasteryModal';
import { StudentProfile } from './StudentProfile';
import { StudentFullList } from './StudentFullList';

// Constants
import { useAuth } from '@auth';

// Color mapping for Tailwind classes
const colorClasses: Record<string, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
  sky: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
};

// Icon mapping for subjects (Lucide icons)
const iconMap: Record<string, LucideIcon> = {
  Calculator, Sigma, Ruler, Pi, Divide,
  FlaskConical, Microscope, Atom, TestTube2, Dna,
  BookOpen, BookText, Languages, PenLine, ScrollText,
  Landmark, Clock, Globe, Map, Compass,
  Palette, Brush, Paintbrush,
  Music, Music2,
  Code, Binary, Laptop, Terminal,
  Dumbbell, Trophy, Heart, Activity,
  Leaf, Star, Sparkles, Brain, Lightbulb, GraduationCap,
};

const getIconByName = (iconName: string): LucideIcon => {
  return iconMap[iconName] || BookOpen;
};

interface StudentViewProps {
  studentId?: string; // Optional override for parents viewing as child
}

export const StudentView: React.FC<StudentViewProps> = ({ studentId }) => {
  const { user: authUser } = useAuth();
  const CURRENT_STUDENT_ID = studentId || authUser?.id || 'u2'; // Use override, then auth user, then fallback

  // --- Data & Settings State ---
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [skillStatuses, setSkillStatuses] = useState<Record<string, any>>({});
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [totalXP, setTotalXP] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(authUser || null);
  const [configuredBadges, setConfiguredBadges] = useState<Badge[]>([]);

  // --- UI State ---
  const [resetConfirmation, setResetConfirmation] = useState<{ isOpen: boolean, step: 'confirm' | 'idle' }>({ isOpen: false, step: 'idle' });
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(null); // For Desktop Dashboard filtering
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'goals' | 'activity'>('dashboard');
  const [mobileTab, setMobileTab] = useState<'learn' | 'ranks' | 'badges'>('learn');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSubjectFilter, setMobileSubjectFilter] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardSkillFilter, setLeaderboardSkillFilter] = useState<string>('all');

  // --- Hooks ---
  const { soundEnabled, setSoundEnabled, playSound } = useSoundEffects();

  const refreshData = async () => {
    const loadedSkills = await getStoredSkills();
    setSkills(loadedSkills);

    const allGoals = await getStudentGoals();
    const myGoals = allGoals.filter(g => g.studentId === CURRENT_STUDENT_ID).map(g => g.skillId);
    setUserGoals(myGoals);

    const config = await getSystemConfig();
    const settings = await getGlobalSettings();
    setSystemConfig(config);
    setGlobalSettings(settings);

    // Load current user
    const user = await getUserById(CURRENT_STUDENT_ID);
    setCurrentUser(user);

    // Initial subject filter based on user preference or default to 'All'
    // For now we default to null (All)


    const statuses: Record<string, any> = {};
    let total = 0;
    let mastered = 0;
    loadedSkills.forEach((skill) => {
      const status = getSkillMasteryStatus(skill, CURRENT_STUDENT_ID, config);
      statuses[skill.id] = {
        mastered: status.isMastered,
        progress: status.progress,
        currentPoints: status.totalScore,
        progressLabel: status.progressLabel,
        rank: status.rank,
        completedQuestionIds: status.completedQuestionIds || []
      };
      total += status.totalScore || 0;
      if (status.isMastered) mastered++;
    });
    setSkillStatuses(statuses);
    setTotalXP(total);
    setMasteredCount(mastered);

    // Load configured badges
    const loadedBadges = await getBadges();
    setConfiguredBadges(loadedBadges.filter(b => b.isActive));
  };

  useEffect(() => {
    if (authUser || studentId) {
      refreshData();
    }

    // Listen for profile open request from Navbar
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('open-student-profile', handleOpenProfile);

    return () => {
      window.removeEventListener('open-student-profile', handleOpenProfile);
    };
  }, [authUser, studentId]);

  // Load leaderboard when tab or skill filter changes
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (mobileTab !== 'ranks') return;

      // Get user's grade
      const userGrade = currentUser?.grades?.[0] || (currentUser as any)?.grade || 'Grade 1';
      const skillId = leaderboardSkillFilter === 'all' ? undefined : leaderboardSkillFilter;

      const data = await getLeaderboard(userGrade, skillId);
      setLeaderboardData(data);
    };

    loadLeaderboard();
  }, [mobileTab, leaderboardSkillFilter, currentUser]);

  // Handle profile save
  const handleSaveProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      console.error('[StudentView] Cannot save profile: currentUser is missing');
      return;
    }
    console.log('[StudentView] Saving profile for user:', currentUser.id, 'Updates:', updates);
    const updatedUser = { ...currentUser, ...updates };
    await updateUser(updatedUser);
    setCurrentUser(updatedUser);

    // Dispatch event to update global user state (Navbar, etc)
    window.dispatchEvent(new Event('user-profile-updated'));
  };

  const gameEngine = useGameEngine({
    studentId: CURRENT_STUDENT_ID,
    systemConfig,
    globalSettings,
    skillStatuses,
    playSound,
    onRefreshData: refreshData
  });

  const {
    activeSkill,
    sessionPoints,
    streak,
    showMasteryModal,
    setShowMasteryModal,
    handleStopPractice
  } = gameEngine;

  const toggleGoal = async (e: React.MouseEvent, skillId: string) => {
    e.stopPropagation();
    if (userGoals.includes(skillId)) {
      await removeStudentGoal(CURRENT_STUDENT_ID, skillId);
      setUserGoals(prev => prev.filter(id => id !== skillId));
    } else {
      await addStudentGoal({ studentId: CURRENT_STUDENT_ID, skillId, createdAt: Date.now() });
      setUserGoals(prev => [...prev, skillId]);
    }
  };

  const requestResetProgress = () => {
    setResetConfirmation({ isOpen: true, step: 'confirm' });
  };

  const confirmResetProgress = async () => {
    if (!activeSkill) return;
    await resetStudentSkillProgress(CURRENT_STUDENT_ID, activeSkill.id);
    await refreshData();
    setResetConfirmation({ isOpen: false, step: 'idle' });
    handleStopPractice();
  };


  // 1. Filter by Moderation & Type
  const allApprovedSkills = useMemo(() => {
    return skills.filter(s => s.moderationStatus === 'APPROVED' && s.questionType !== 'Custom');
  }, [skills]);

  // 2. Filter by Active Subject and Search Query
  const dashboardSkills = useMemo(() => {
    let filtered = allApprovedSkills;
    if (activeSubjectFilter && activeSubjectFilter !== 'All') {
      filtered = filtered.filter(s => s.subject === activeSubjectFilter);
    }
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.skillName.toLowerCase().includes(query) ||
        s.subject?.toLowerCase().includes(query) ||
        s.grade?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [allApprovedSkills, activeSubjectFilter, searchQuery]);

  // 3. Sort by Grade Priority (Student Grade Match -> First)
  const sortedDashboardSkills = useMemo(() => {
    if (!currentUser?.grade) return dashboardSkills;

    return [...dashboardSkills].sort((a, b) => {
      // Primary Sort: Grade Match
      const aMatch = a.grade === currentUser.grade;
      const bMatch = b.grade === currentUser.grade;

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;

      // Secondary Sort: PublishedAt (Newest First) if available, else CreatedAt
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [dashboardSkills, currentUser]);

  const goalSkills = sortedDashboardSkills.filter(s => userGoals.includes(s.id));
  const otherSkills = sortedDashboardSkills.filter(s => !userGoals.includes(s.id));

  // Group skills by subject (using ALL approved skills to show counts correctly in Browse section)
  const skillsBySubject = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    allApprovedSkills.forEach(skill => {
      const subject = skill.subject || 'Other';
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(skill);
    });
    return grouped;
  }, [allApprovedSkills]);

  // --- New Categories Logic ---
  const inProgressSkills = useMemo(() => {
    return sortedDashboardSkills.filter(s => {
      const status = skillStatuses[s.id];
      return status && status.progress > 0 && !status.mastered;
    }).sort((a, b) => {
      // Keep progress sort, but maybe prioritize grade within that? 
      // User asked to prioritize grade.
      // Let's stick to the sortedDashboardSkills order (Grade -> Date) 
      // BUT specifically for in-progress, we probably want "most recently played" or "most progress".
      // Let's keep the existing progress sort for this specific section as it makes more sense for "Continue".
      return (skillStatuses[b.id]?.currentPoints || 0) - (skillStatuses[a.id]?.currentPoints || 0);
    });
  }, [sortedDashboardSkills, skillStatuses]);

  const subjects = Object.keys(skillsBySubject);

  // Recommended skills based on user's grade/progress - not mastered, no progress yet
  const recommendedSkills = useMemo(() => {
    return sortedDashboardSkills.filter(s => {
      const status = skillStatuses[s.id];
      return !status?.mastered && (!status?.progress || status.progress === 0);
    }).slice(0, 6);
  }, [sortedDashboardSkills, skillStatuses]);

  // Toggle expanded state for a subject group
  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  // Get skill status badge
  const getSkillBadge = (skillId: string) => {
    const status = skillStatuses[skillId];
    if (status?.mastered) return { icon: <Star className="w-3 h-3" />, label: 'Mastered', color: 'text-amber-500' };
    if (status?.progress > 0) return { icon: <TrendingUp className="w-3 h-3" />, label: 'In Progress', color: 'text-emerald-500' };
    return { icon: <Target className="w-3 h-3" />, label: 'Not Started', color: 'text-slate-400' };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubjectConfig = (subject: string): { bg: string; color: string; icon: string; imageUrl?: string } => {
    // First check systemConfig.subjectConfigs from store
    const configs = systemConfig.subjectConfigs || DEFAULT_SUBJECT_CONFIGS;
    const found = configs.find(c => c.name === subject);

    if (found) {
      const colors = colorClasses[found.color] || colorClasses.slate;
      return {
        bg: colors.bg,
        color: colors.text,
        icon: found.icon,
        imageUrl: found.imageUrl
      };
    }

    // Fallback
    return {
      bg: colorClasses.slate.bg,
      color: colorClasses.slate.text,
      icon: 'BookOpen',
      imageUrl: undefined
    };
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* --- Game View --- */}
      {activeSkill ? (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[50] flex flex-col h-full">
          <MasteryModal
            isOpen={showMasteryModal}
            onClose={() => { setShowMasteryModal(false); handleStopPractice(); }}
            onContinue={() => { setShowMasteryModal(false); gameEngine.handleNext(); }}
            skillName={activeSkill.skillName}
            score={(skillStatuses[activeSkill.id]?.currentPoints || 0) + sessionPoints}
          />

          <ConfirmationModal
            isOpen={resetConfirmation.isOpen}
            title="Reset Progress?"
            message="Are you sure you want to reset your progress for this skill? All points, rank status, and history will be permanently lost."
            confirmLabel="Yes, Reset"
            isDanger={true}
            onConfirm={confirmResetProgress}
            onCancel={() => setResetConfirmation({ isOpen: false, step: 'idle' })}
          />

          <GameHeader
            skillName={activeSkill.skillName}
            subject={activeSkill.subject}
            streak={streak}
            sessionPoints={sessionPoints}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onStopPractice={handleStopPractice}
            onRequestReset={requestResetProgress}
          />

          <div className="flex-1 overflow-y-auto relative w-full bg-white dark:bg-slate-950">
            <GameStage
              loadingQuestion={gameEngine.loadingQuestion}
              question={gameEngine.question}
              activeSkill={gameEngine.activeSkill}
              selectedAnswer={gameEngine.selectedAnswer}
              isSubmitted={gameEngine.isSubmitted}
              isCorrect={gameEngine.isCorrect}
              autoAdvancePaused={gameEngine.autoAdvancePaused}
              onSetSelectedAnswer={gameEngine.setSelectedAnswer}
              onSubmit={gameEngine.handleSubmit}
              onNext={gameEngine.handleNext}
              onTogglePause={gameEngine.togglePauseAutoAdvance}
            />
          </div>
        </div>
      ) : selectedSubject ? (
        /* --- Subject Detail View (Mobile) --- */
        <div className="sm:hidden flex flex-col min-h-[100dvh]">
          {/* Subject Header */}
          <div className={`${getSubjectConfig(selectedSubject).bg} px-4 pt-5 pb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedSubject(null)}
                className="w-9 h-9 bg-white/80 dark:bg-slate-800/80 rounded-full flex items-center justify-center shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              {getSubjectConfig(selectedSubject).imageUrl ? (
                <img
                  src={getSubjectConfig(selectedSubject).imageUrl}
                  alt={selectedSubject}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm"
                />
              ) : (
                (() => { const Icon = getIconByName(getSubjectConfig(selectedSubject).icon); return <Icon className="w-6 h-6" />; })()
              )}
              <h1 className={`text-xl font-black ${getSubjectConfig(selectedSubject).color}`}>
                {selectedSubject}
              </h1>
            </div>

            {/* Subject Stats */}
            <div className="flex gap-3">
              <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">{skillsBySubject[selectedSubject]?.length || 0}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase">Skills</p>
              </div>
              <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">
                  {skillsBySubject[selectedSubject]?.filter(s => skillStatuses[s.id]?.mastered).length || 0}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase">Mastered</p>
              </div>
              <div className="flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">
                  {skillsBySubject[selectedSubject]?.reduce((acc, s) => acc + (skillStatuses[s.id]?.currentPoints || 0), 0) || 0}
                </p>
                <p className="text-[10px] text-slate-500 font-medium uppercase">XP</p>
              </div>
            </div>
          </div>

          {/* Skills List */}
          <div className="flex-1 overflow-y-auto pb-24 pt-4">
            <SkillGrid
              skills={skillsBySubject[selectedSubject] || []}
              userGoals={userGoals}
              skillStatuses={skillStatuses}
              onStartPractice={gameEngine.startPractice}
              onToggleGoal={toggleGoal}
            />
          </div>
        </div>
      ) : viewMode === 'goals' ? (
        <StudentFullList
          title="My Goals"
          description="Skills you have marked as priority"
          skills={goalSkills}
          onBack={() => setViewMode('dashboard')}
          userGoals={userGoals}
          skillStatuses={skillStatuses}
          onStartPractice={gameEngine.startPractice}
          onToggleGoal={toggleGoal}
          icon={Target}
          colorClass="text-amber-500"
        />
      ) : viewMode === 'activity' ? (
        <StudentFullList
          title="Recent Activity"
          description="Explore all available skills"
          skills={otherSkills}
          onBack={() => setViewMode('dashboard')}
          userGoals={userGoals}
          skillStatuses={skillStatuses}
          onStartPractice={gameEngine.startPractice}
          onToggleGoal={toggleGoal}
          icon={BookOpen}
          colorClass="text-indigo-500"
        />
      ) : (
        /* --- Dashboard View --- */
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-8">

          {/* ========== MOBILE LAYOUT ========== */}
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
                  {mobileTab === 'learn' && !isSearchOpen && (
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
                  <button
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <Avatar
                      src={currentUser?.avatar}
                      role={Role.STUDENT}
                      size="md"
                      className="hover:scale-105"
                    />
                  </button>
                </div>
              </div>

              {/* Expandable Search Bar with Framer Motion */}
              <AnimatePresence>
                {mobileTab === 'learn' && isSearchOpen && (
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

            {/* ========== RANKS TAB ========== */}
            {mobileTab === 'ranks' && (
              <div className="px-4 pb-4 animate-in fade-in duration-200">
                {/* Header with Skill Filter */}
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Leaderboard</h3>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {currentUser?.grades?.[0] || (currentUser as any)?.grade || 'All Grades'}
                  </span>
                </div>

                {/* Skill Filter Dropdown */}
                <div className="mb-4">
                  <select
                    value={leaderboardSkillFilter}
                    onChange={(e) => setLeaderboardSkillFilter(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">All Skills (Total XP)</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.skillName}</option>
                    ))}
                  </select>
                </div>

                {/* Your Position */}
                {(() => {
                  const myEntry = leaderboardData.find(e => e.userId === CURRENT_STUDENT_ID);
                  return myEntry ? (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Your Position</p>
                      <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 border-2 border-indigo-200 dark:border-indigo-700">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${myEntry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                          myEntry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                            myEntry.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                              'bg-indigo-100 text-indigo-600'
                          }`}>
                          #{myEntry.rank}
                        </div>
                        <Avatar src={currentUser?.avatar} role={Role.STUDENT} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{currentUser?.displayName || currentUser?.name || 'You'}</p>
                        </div>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {leaderboardSkillFilter === 'all'
                            ? `${myEntry.masteredCount} mastered`
                            : `${myEntry.progressPercent || 0}%`
                          }
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Top Students */}
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Top Students</p>
                <div className="space-y-2">
                  {leaderboardData.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No students found in this grade.</p>
                  ) : (
                    leaderboardData.slice(0, 10).map((entry) => {
                      const isMe = entry.userId === CURRENT_STUDENT_ID;
                      return (
                        <div
                          key={entry.userId}
                          className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${isMe
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                            }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${entry.rank === 1 ? 'bg-amber-100 text-amber-600' :
                            entry.rank === 2 ? 'bg-slate-100 text-slate-600' :
                              entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                                'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                            {entry.rank}
                          </div>
                          <Avatar src={entry.avatar} role={Role.STUDENT} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${isMe ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                              {entry.displayName || entry.name}
                              {isMe && <span className="text-[10px] ml-1 text-indigo-500">(You)</span>}
                            </p>
                          </div>
                          <p className={`font-bold text-sm ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {leaderboardSkillFilter === 'all'
                              ? `${entry.masteredCount} ⭐`
                              : `${entry.progressPercent || 0}%`
                            }
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ========== BADGES TAB ========== */}
            {mobileTab === 'badges' && (
              <div className="px-4 pb-4 animate-in fade-in duration-200">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Achievements</h3>
                  <span className="ml-auto text-xs text-slate-400">
                    {configuredBadges.filter(badge => {
                      const { type, value } = badge.unlockCriteria;
                      switch (type) {
                        case 'MASTERY_COUNT': return masteredCount >= value;
                        case 'STREAK_DAYS': return streak >= value;
                        case 'XP_THRESHOLD': return totalXP >= value;
                        default: return false;
                      }
                    }).length} / {configuredBadges.length} earned
                  </span>
                </div>

                {/* All Badges in One Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {configuredBadges.map((badge) => {
                    const { type, value } = badge.unlockCriteria;
                    let earned = false;
                    switch (type) {
                      case 'MASTERY_COUNT': earned = masteredCount >= value; break;
                      case 'STREAK_DAYS': earned = streak >= value; break;
                      case 'XP_THRESHOLD': earned = totalXP >= value; break;
                      default: earned = false;
                    }
                    return (
                      <div key={badge.id} className={`rounded-xl p-2.5 text-center border transition-all ${earned
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-40 grayscale'
                        }`}>
                        <div className="text-2xl mb-0.5">{badge.icon}</div>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{badge.name}</p>
                        <p className="text-[8px] text-slate-400 truncate">{badge.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========== LEARN TAB (Smart Navigation) ========== */}
            {mobileTab === 'learn' && (
              <>
                {/* Subject Filter Chips - Horizontal Scrollable */}
                {!searchQuery && (
                  <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 pb-1">
                      <button
                        onClick={() => setMobileSubjectFilter(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${mobileSubjectFilter === null
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        All ({allApprovedSkills.length})
                      </button>
                      {subjects.map((subject) => {
                        const config = getSubjectConfig(subject);
                        const SubjectIcon = getIconByName(config.icon);
                        const count = skillsBySubject[subject]?.length || 0;
                        return (
                          <button
                            key={subject}
                            onClick={() => setMobileSubjectFilter(subject)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${mobileSubjectFilter === subject
                              ? 'bg-indigo-500 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                          >
                            <SubjectIcon className="w-3 h-3" />
                            {subject} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                      onToggleGoal={toggleGoal}
                    />
                  </div>
                ) : mobileSubjectFilter ? (
                  /* Filtered by Subject Mode */
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 px-4">
                      <div className="flex items-center gap-2">
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
                      onToggleGoal={toggleGoal}
                    />
                  </div>
                ) : (
                  /* Smart Navigation Mode (Default) */
                  <>
                    {/* Continue Learning (In Progress) */}
                    {inProgressSkills.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2 px-4">
                          <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Continue Learning</h3>
                          <span className="text-xs text-slate-400 ml-auto">{inProgressSkills.length} in progress</span>
                        </div>
                        <SkillGrid
                          skills={inProgressSkills.slice(0, 3)}
                          userGoals={userGoals}
                          skillStatuses={skillStatuses}
                          onStartPractice={gameEngine.startPractice}
                          onToggleGoal={toggleGoal}
                        />
                      </div>
                    )}

                    {/* Recommended For You */}
                    {recommendedSkills.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2 px-4">
                          <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Recommended For You</h3>
                        </div>
                        <SkillGrid
                          skills={recommendedSkills.slice(0, 3)}
                          userGoals={userGoals}
                          skillStatuses={skillStatuses}
                          onStartPractice={gameEngine.startPractice}
                          onToggleGoal={toggleGoal}
                        />
                      </div>
                    )}

                    {/* Browse by Subject - Collapsible Accordion */}
                    <div className="px-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                          <BookOpen className="w-3 h-3 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Browse by Subject</h3>
                      </div>

                      <div className="space-y-2">
                        {subjects.map((subject) => {
                          const config = getSubjectConfig(subject);
                          const SubjectIcon = getIconByName(config.icon);
                          const subjectSkills = skillsBySubject[subject] || [];
                          const masteredInSubject = subjectSkills.filter(s => skillStatuses[s.id]?.mastered).length;
                          const inProgressInSubject = subjectSkills.filter(s => {
                            const status = skillStatuses[s.id];
                            return status?.progress > 0 && !status?.mastered;
                          }).length;
                          const isExpanded = expandedSubjects.has(subject);

                          return (
                            <div key={subject} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                              {/* Subject Header - Clickable */}
                              <button
                                onClick={() => toggleSubject(subject)}
                                className="w-full flex items-center gap-3 p-3 active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors"
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
                                  <SubjectIcon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{subject}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span>{subjectSkills.length} skills</span>
                                    {masteredInSubject > 0 && (
                                      <span className="text-amber-500 flex items-center gap-0.5"><Star className="w-2.5 h-2.5" /> {masteredInSubject}</span>
                                    )}
                                    {inProgressInSubject > 0 && (
                                      <span className="text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> {inProgressInSubject}</span>
                                    )}
                                  </div>
                                </div>
                                <ChevronDown
                                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>

                              {/* Expanded Skills List */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="border-t border-slate-100 dark:border-slate-700 p-2 space-y-1">
                                      {subjectSkills.slice(0, 10).map((skill) => {
                                        const badge = getSkillBadge(skill.id);
                                        return (
                                          <button
                                            key={skill.id}
                                            onClick={() => gameEngine.startPractice(skill)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-[0.98] transition-all text-left"
                                          >
                                            <span className="text-sm">{badge.icon}</span>
                                            <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                              {skill.skillName}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                          </button>
                                        );
                                      })}
                                      {subjectSkills.length > 10 && (
                                        <button
                                          onClick={() => setMobileSubjectFilter(subject)}
                                          className="w-full py-2 text-center text-xs font-semibold text-indigo-500 hover:text-indigo-600"
                                        >
                                          See all {subjectSkills.length} skills →
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

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

              {goalSkills.length > 0 && (
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
                    skills={goalSkills}
                    userGoals={userGoals}
                    skillStatuses={skillStatuses}
                    onStartPractice={gameEngine.startPractice}
                    onToggleGoal={toggleGoal}
                  />
                </div>
              )}

              {/* Continue Learning Desktop */}
              {inProgressSkills.length > 0 && (
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
                    skills={inProgressSkills.slice(0, 4)}
                    userGoals={userGoals}
                    skillStatuses={skillStatuses}
                    onStartPractice={gameEngine.startPractice}
                    onToggleGoal={toggleGoal}
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
                        {goalSkills.length > 0 ? "All Available Skills" : "Explore Skills"}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{otherSkills.length} skills to explore</p>
                    </div>
                  </div>
                </div>
                <SkillGrid
                  skills={otherSkills}
                  userGoals={userGoals}
                  skillStatuses={skillStatuses}
                  onStartPractice={gameEngine.startPractice}
                  onToggleGoal={toggleGoal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!activeSkill && !selectedSubject && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 sm:hidden z-30 pb-safe">
          <div className="flex justify-around items-center max-w-md mx-auto">
            <button
              onClick={() => setMobileTab('learn')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${mobileTab === 'learn' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className={`text-[9px] ${mobileTab === 'learn' ? 'font-bold' : 'font-medium'}`}>Learn</span>
            </button>
            <button
              onClick={() => setMobileTab('ranks')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${mobileTab === 'ranks' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              <Trophy className="w-5 h-5" />
              <span className={`text-[9px] ${mobileTab === 'ranks' ? 'font-bold' : 'font-medium'}`}>Ranks</span>
            </button>
            <button
              onClick={() => goalSkills.length > 0 ? gameEngine.startPractice(goalSkills[0]) : otherSkills.length > 0 && gameEngine.startPractice(otherSkills[0])}
              className="flex flex-col items-center relative"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center -mt-5 shadow-xl shadow-indigo-300/50 border-4 border-white dark:border-slate-900 active:scale-95 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Play</span>
            </button>
            <button
              onClick={() => setMobileTab('badges')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${mobileTab === 'badges' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              <Award className="w-5 h-5" />
              <span className={`text-[9px] ${mobileTab === 'badges' ? 'font-bold' : 'font-medium'}`}>Badges</span>
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <Star className="w-5 h-5" />
              <span className="text-[9px] font-medium">Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <StudentProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onSave={handleSaveProfile}
        stats={{
          totalXP,
          masteredCount,
          streak,
          totalSkills: allApprovedSkills.length
        }}
        availableGrades={systemConfig.grades.map(g => g.id)}
      />
    </div>
  );
};
