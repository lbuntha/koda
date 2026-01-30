
import React, { useState, useEffect, useMemo } from 'react';
import {
  getStoredSkills,
  getStudentGoals,
  addStudentGoal,
  removeStudentGoal,
  getSystemConfig,
  getGlobalSettings,
  getSkillMasteryStatus,
  getStudentStats,
  resetStudentSkillProgress,
  DEFAULT_SYSTEM_CONFIG,
  DEFAULT_SETTINGS,
  DEFAULT_SUBJECT_CONFIGS,
  GlobalSettings,
  SystemConfig,
  SubjectConfig,
  getUserById,
  updateUser
} from '@stores';
import { Skill, SkillRank, Difficulty, User, Role } from '@types';
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
  Search,
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

  // --- UI State ---
  const [resetConfirmation, setResetConfirmation] = useState<{ isOpen: boolean, step: 'confirm' | 'idle' }>({ isOpen: false, step: 'idle' });
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(null); // For Desktop Dashboard filtering
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'goals' | 'activity'>('dashboard');

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

  // 2. Filter by Active Subject (if any)
  const dashboardSkills = useMemo(() => {
    let filtered = allApprovedSkills;
    if (activeSubjectFilter && activeSubjectFilter !== 'All') {
      filtered = filtered.filter(s => s.subject === activeSubjectFilter);
    }
    return filtered;
  }, [allApprovedSkills, activeSubjectFilter]);

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
                      size="md" // translates to w-8 h-8 which is close to w-9 h-9. We can override if needed.
                      className="hover:scale-105"
                    />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>

            {/* Hero Card */}
            <div className="px-4 mb-4">
              <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-4 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="text-indigo-100 text-xs font-medium">Let's play together</span>
                    </div>
                    <button
                      onClick={() => goalSkills.length > 0 ? gameEngine.startPractice(goalSkills[0]) : otherSkills.length > 0 && gameEngine.startPractice(otherSkills[0])}
                      className="inline-flex items-center gap-1.5 bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all mt-2"
                    >
                      <Play className="w-4 h-4 fill-indigo-600" />
                      Play Now
                    </button>
                  </div>
                  <div className="text-5xl">🏆</div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="px-4 mb-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 text-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{streak}</p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Streak</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 text-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Coins className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{totalXP >= 1000 ? `${(totalXP / 1000).toFixed(1)}k` : totalXP}</p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">XP</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 text-center shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{masteredCount}</p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Mastered</p>
                </div>
              </div>
            </div>

            {/* Continue Learning (In Progress) */}
            {inProgressSkills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 px-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Continue Learning</h3>
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

            {/* My Goals */}
            {goalSkills.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 px-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">My Goals</h3>
                  </div>
                  <button
                    onClick={() => setViewMode('goals')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5"
                  >
                    See all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <SkillGrid
                  skills={goalSkills.slice(0, 5)}
                  userGoals={userGoals}
                  skillStatuses={skillStatuses}
                  onStartPractice={gameEngine.startPractice}
                  onToggleGoal={toggleGoal}
                />
              </div>
            )}



            {/* Featured Categories (Subjects) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Featured Categories</h3>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                  See all <ChevronRight className="w-3 h-3" />
                </button>
              </div>


              {/* Active Filter Indicator (Mobile) */}
              {activeSubjectFilter && (
                <div className="px-4 mb-4 animate-in fade-in slide-in-from-top">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">Filtering by: <b>{activeSubjectFilter}</b></span>
                    <button onClick={() => setActiveSubjectFilter(null)} className="p-1 hover:bg-black/10 rounded-full">
                      <div className="text-xs font-bold">Clear</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Category Grid (Mobile) - Updates Filter */}
              <div className="grid grid-cols-4 gap-2 px-4">
                {/* All Option */}
                <button
                  onClick={() => setActiveSubjectFilter(null)}
                  className={`
                        flex flex-col items-center p-3 rounded-2xl border shadow-sm active:scale-95 transition-all
                        ${activeSubjectFilter === null
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}
                      `}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 ${activeSubjectFilter === null ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight ${activeSubjectFilter === null ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    All
                  </span>
                </button>

                {subjects.slice(0, 7).map((subject) => {
                  const config = getSubjectConfig(subject);
                  const skillCount = skillsBySubject[subject]?.length || 0;
                  const isActive = activeSubjectFilter === subject;

                  return (
                    <button
                      key={subject}
                      onClick={() => setActiveSubjectFilter(isActive ? null : subject)}
                      className={`
                        flex flex-col items-center p-3 rounded-2xl border shadow-sm active:scale-95 transition-all
                        ${isActive
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}
                      `}
                    >
                      {config.imageUrl ? (
                        <img
                          src={config.imageUrl}
                          alt={subject}
                          className="w-12 h-12 rounded-xl object-cover mb-1.5 shadow-sm"
                        />
                      ) : (
                        <div className={`w-12 h-12 ${isActive ? 'bg-white/20 text-white' : config.bg + ' ' + config.color} rounded-xl flex items-center justify-center mb-1.5`}>
                          {(() => { const Icon = getIconByName(config.icon); return <Icon className="w-6 h-6" />; })()}
                        </div>
                      )}
                      <span className={`text-[10px] font-semibold text-center leading-tight ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                        {subject}
                      </span>
                      <span className={`text-[9px] mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{skillCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent / Priority Skills */}
            {goalSkills.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 px-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">My Goals</h3>
                  <button
                    onClick={() => setViewMode('goals')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5"
                  >
                    See all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <SkillGrid
                  skills={goalSkills.slice(0, 5)}
                  userGoals={userGoals}
                  skillStatuses={skillStatuses}
                  onStartPractice={gameEngine.startPractice}
                  onToggleGoal={toggleGoal}
                />
              </div>
            )}

            {/* Recent Results / All Skills */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 px-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Recent Activity</h3>
                <button
                  onClick={() => setViewMode('activity')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5"
                >
                  See all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <SkillGrid
                skills={otherSkills.slice(0, 10)}
                userGoals={userGoals}
                skillStatuses={skillStatuses}
                onStartPractice={gameEngine.startPractice}
                onToggleGoal={toggleGoal}
              />
            </div>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 sm:hidden z-30">
          <div className="flex justify-around items-center max-w-md mx-auto">
            <button className="flex flex-col items-center gap-0.5 py-1 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
              <span className="text-[9px] font-bold">Learn</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 py-1 text-slate-400">
              <Trophy className="w-5 h-5" />
              <span className="text-[9px] font-medium">Ranks</span>
            </button>
            <button
              onClick={() => goalSkills.length > 0 ? gameEngine.startPractice(goalSkills[0]) : otherSkills.length > 0 && gameEngine.startPractice(otherSkills[0])}
              className="flex flex-col items-center relative"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center -mt-5 shadow-xl shadow-indigo-300/50 border-4 border-white dark:border-slate-900">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Play</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 py-1 text-slate-400">
              <Award className="w-5 h-5" />
              <span className="text-[9px] font-medium">Badges</span>
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
