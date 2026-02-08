
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
import { Skill, SkillRank, Difficulty, User, Role, Badge, GeneratedQuestion } from '@types';
import { ConfirmationModal, Avatar } from '@shared/components/ui';
import { useToast } from '@shared/context';
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
import { StudentProfile } from './StudentProfile';
import { StudentFullList } from './StudentFullList';
import { StudentGameView } from './StudentGameView';
import { StudentSubjectView } from './StudentSubjectView';
import { StudentLeaderboard } from './StudentLeaderboard';
import { StudentBadges } from './StudentBadges';
import { StudentDashboard } from './dashboard/StudentDashboard';

// Tutorial imports
import { TutorialProvider, TutorialOverlay, useTutorial, studentTutorialSteps, STUDENT_TUTORIAL_ID } from './tutorial';


// Constants
import { useAuth, logoutUser } from '@auth';

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
  // Add more mappings as needed
};

const getIconByName = (iconName: string): LucideIcon => {
  return iconMap[iconName] || BookOpen;
};

interface StudentViewProps {
  initialViewMode?: 'dashboard' | 'goals' | 'activity';
  currentUser?: User;
  studentId?: string;
  skillsBySubject?: Record<string, Skill[]>; // Make optional to avoid strict issues if not passed securely
}

export const StudentView: React.FC<StudentViewProps> = ({
  initialViewMode = 'dashboard',
  currentUser: propUser,
  studentId,
  skillsBySubject: propSkillsBySubject
}) => {
  return (
    <TutorialProvider>
      <StudentViewContent
        initialViewMode={initialViewMode}
        currentUser={propUser}
        studentId={studentId}
        skillsBySubject={propSkillsBySubject}
      />
    </TutorialProvider>
  );
};

const StudentViewContent: React.FC<StudentViewProps> = ({
  initialViewMode = 'dashboard',
  currentUser: propUser,
  studentId,
  skillsBySubject: propSkillsBySubject
}) => {
  // --- State ---
  const [viewMode, setViewMode] = useState<'dashboard' | 'goals' | 'activity' | 'mastered'>(initialViewMode);
  const [mobileTab, setMobileTab] = useState<'learn' | 'ranks' | 'badges'>('learn');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [mobileSubjectFilter, setMobileSubjectFilter] = useState<string | null>(null);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(null);

  // User State
  const [fetchedUser, setFetchedUser] = useState<User | undefined>(undefined);

  const currentUser = fetchedUser || propUser;
  const CURRENT_STUDENT_ID = currentUser?.id || studentId || 'student-1';

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local State for Goals & Skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [skillStatuses, setSkillStatuses] = useState<Record<string, any>>({});
  const [streak, setStreak] = useState(0);

  // Reset Confirmation
  const [resetConfirmation, setResetConfirmation] = useState<{ isOpen: boolean; step: 'idle' | 'confirm' | 'resetting' }>({
    isOpen: false,
    step: 'idle'
  });

  // Sound
  const { playSound } = useSoundEffects();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Toast
  const { success, error } = useToast();

  // Leaderboard
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardSkillFilter, setLeaderboardSkillFilter] = useState('all');

  // Badges
  const [configuredBadges, setConfiguredBadges] = useState<Badge[]>([]);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // --- Effects ---

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('open-student-profile', handleOpenProfile);
    return () => window.removeEventListener('open-student-profile', handleOpenProfile);
  }, []);

  // --- Tutorial Logic ---
  const { startTutorial } = useTutorial();

  useEffect(() => {
    // Check if user has seen tutorial or if specifically requested (e.g. valid new user)
    const hasSeen = localStorage.getItem(`tutorial_completed_${STUDENT_TUTORIAL_ID}`);
    // Also potentially check if user just signed up (createdAt is recent?)
    // For now, just check local storage.
    if (!hasSeen && !isLoading) { // Wait for loading to finish so DOM is likely ready
      // Small delay to ensure rendering
      setTimeout(() => {
        startTutorial(studentTutorialSteps);
      }, 1500);
    }
  }, [isLoading, startTutorial]);

  // Fetch User if studentId is provided but no currentUser
  useEffect(() => {
    const loadUser = async () => {
      if (!propUser && studentId) {
        const u = await getUserById(studentId);
        if (u) setFetchedUser(u);
      }
    };
    loadUser();
  }, [propUser, studentId]);

  useEffect(() => {
    refreshData();
  }, [CURRENT_STUDENT_ID, JSON.stringify(currentUser?.grades)]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Configs & Settings
      const config = await getSystemConfig();
      setSystemConfig(config);
      const settings = await getGlobalSettings();
      setGlobalSettings(settings);

      // 2. Fetch Skills (Approved only)
      const allSkills = await getStoredSkills();
      const approvedSkills = allSkills.filter(s => s.moderationStatus === 'APPROVED');

      // Filter by User Grade (if set)
      // Supports multiple grades: Show skill if its grade is in the user's grade list
      let filteredSkills = approvedSkills;
      console.log('DEBUG: Filtering skills. User grades:', currentUser?.grades);

      if (currentUser?.grades && currentUser.grades.length > 0) {
        filteredSkills = approvedSkills.filter(s => currentUser.grades!.includes(s.grade));
        console.log('DEBUG: Filter applied. Result count:', filteredSkills.length);
      } else {
        console.log('DEBUG: No grades set or empty. showing all.');
      }
      setSkills(filteredSkills);

      // 3. Fetch User Goals
      const goals = await getStudentGoals(); // getStudentGoals returns StudentGoal[]
      // Filter by student ID
      const myGoals = goals.filter(g => g.studentId === CURRENT_STUDENT_ID);
      setUserGoals(myGoals.map(g => g.skillId));

      // 4. Fetch Mastery Status for ALL skills to show progress
      const statuses: Record<string, any> = {};
      for (const skill of filteredSkills) {
        statuses[skill.id] = await getSkillMasteryStatus(skill, CURRENT_STUDENT_ID);
      }
      setSkillStatuses(statuses);

      // 5. Fetch User Profile for Streak (and other stats)
      if (currentUser) {
        setStreak(currentUser.stats?.streak || 0);
      }

      // 6. Fetch Badges
      const badges = await getBadges();
      setConfiguredBadges(badges);

      // 7. Fetch Leaderboard
      const lb = await getLeaderboard();
      setLeaderboardData(lb);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Game Engine Hook ---
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
    handleStopPractice,
    showMasteryModal,
    setShowMasteryModal
  } = gameEngine;

  // --- Handlers ---
  const toggleGoal = async (skillId: string) => {
    if (userGoals.includes(skillId)) {
      await removeStudentGoal(CURRENT_STUDENT_ID, skillId);
      setUserGoals(prev => prev.filter(id => id !== skillId));
      playSound('correct');
    } else {
      await addStudentGoal({
        studentId: CURRENT_STUDENT_ID,
        skillId,
        createdAt: Date.now()
      });
      setUserGoals(prev => [...prev, skillId]);
      playSound('correct');
    }
  };

  // Profile Update Handler
  const handleSaveProfile = async (updatedData: Partial<User>) => {
    if (!currentUser?.id) return;
    try {
      await updateUser({ ...currentUser, ...updatedData } as User);

      // Update local state immediately to reflect changes
      if (currentUser) {
        setFetchedUser({ ...currentUser, ...updatedData } as User);
      }

      success("Profile Updated", "Your changes have been saved successfully.");
      setIsProfileOpen(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      error("Update Failed", "There was an error updating your profile. Please try again.");
    }
  };

  // Progress Reset
  const requestResetProgress = () => {
    setResetConfirmation({ isOpen: true, step: 'confirm' });
  };

  const confirmResetProgress = async () => {
    if (!activeSkill) return;
    await resetStudentSkillProgress(CURRENT_STUDENT_ID, activeSkill.id);
    setResetConfirmation({ isOpen: false, step: 'idle' });
    handleStopPractice(); // Exit game
    refreshData(); // Refresh UI
    playSound('correct'); // Using 'correct' as success sound
  };


  // --- Data Filtering & Processing ---

  // 1. Group Skills by Subject
  const skillsBySubject = useMemo(() => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.subject]) grouped[skill.subject] = [];
      grouped[skill.subject].push(skill);
    });
    return grouped;
  }, [skills]);

  const subjects = Object.keys(skillsBySubject).sort();

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Categorize Skills for Dashboard
  const allApprovedSkills = skills; // Already filtered in refreshData

  // 1. Goals: Manually selected by user
  const goalSkills = allApprovedSkills.filter(s => userGoals.includes(s.id));

  // 2. Mastered: Score is 100% or marked as mastered
  const masteredSkills = allApprovedSkills.filter(s => skillStatuses[s.id]?.mastered);

  // 3. In Progress: Started (>0 score) but NOT mastered and NOT in goals (to avoid dupe)
  const inProgressSkills = allApprovedSkills.filter(s => {
    const status = skillStatuses[s.id];
    return status && status.totalScore > 0 && !status.mastered && !userGoals.includes(s.id);
  });

  // 4. Explore/New: Not started, not mastered, not in goals
  const otherSkills = allApprovedSkills.filter(s =>
    !userGoals.includes(s.id) &&
    (!skillStatuses[s.id] || skillStatuses[s.id].totalScore === 0) &&
    !skillStatuses[s.id]?.mastered
  );

  // Recommendation Logic (Simple: First unmastered skill in first subject, or random)
  const recommendedSkills = otherSkills.slice(0, 3); // Todo: Better logic

  // Helpers for Stats
  const masteredCount = masteredSkills.length;
  // Calculate Total XP from all skills
  const totalXP = Object.values(skillStatuses).reduce((acc: number, curr: any) => acc + (curr.totalPointsEarned || 0), 0);


  // Search Filtering
  const sortedDashboardSkills = useMemo(() => {
    if (!searchQuery) return [];
    const lower = searchQuery.toLowerCase();
    return skills.filter(s =>
      s.skillName.toLowerCase().includes(lower) ||
      s.subject.toLowerCase().includes(lower)
    );
  }, [searchQuery, skills]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* --- Game View --- */}
      {activeSkill ? (
        <StudentGameView
          activeSkill={activeSkill}
          showMasteryModal={showMasteryModal}
          setShowMasteryModal={setShowMasteryModal}
          handleStopPractice={handleStopPractice}
          gameEngine={gameEngine}
          skillStatuses={skillStatuses}
          sessionPoints={sessionPoints}
          resetConfirmation={resetConfirmation}
          setResetConfirmation={setResetConfirmation}
          confirmResetProgress={confirmResetProgress}
          requestResetProgress={requestResetProgress}
          streak={streak}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
      ) : selectedSubject ? (
        /* --- Subject Detail View (Mobile) --- */
        <StudentSubjectView
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          getSubjectConfig={getSubjectConfig}
          getIconByName={getIconByName}
          skillsBySubject={skillsBySubject}
          skillStatuses={skillStatuses}
          userGoals={userGoals}
          toggleGoal={toggleGoal}
          onStartPractice={gameEngine.startPractice}
        />
      ) : viewMode === 'goals' ? (
        <StudentFullList
          title="My Goals"
          description="Skills you have marked as priority"
          skills={goalSkills}
          onBack={() => setViewMode('dashboard')}
          userGoals={userGoals}
          skillStatuses={skillStatuses}
          onStartPractice={gameEngine.startPractice}
          onToggleGoal={(e, id) => toggleGoal(id)}
          icon={Target}
          colorClass="text-amber-500"
        />
      ) : viewMode === 'activity' ? (
        <StudentFullList
          title="New Skills"
          description="Explore all available skills you haven't started yet"
          skills={otherSkills}
          onBack={() => setViewMode('dashboard')}
          userGoals={userGoals}
          skillStatuses={skillStatuses}
          onStartPractice={gameEngine.startPractice}
          onToggleGoal={(e, id) => toggleGoal(id)}
          icon={BookOpen}
          colorClass="text-indigo-500"
        />
      ) : viewMode === 'mastered' ? (
        <StudentFullList
          title="Mastered Skills"
          description="Skills you have successfully completed"
          skills={masteredSkills}
          onBack={() => setViewMode('dashboard')}
          userGoals={userGoals}
          skillStatuses={skillStatuses}
          onStartPractice={gameEngine.startPractice}
          onToggleGoal={(e, id) => toggleGoal(id)}
          icon={Trophy}
          colorClass="text-emerald-500"
        />
      ) : (
        /* --- Dashboard View --- */
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-8">
          <div className="sm:hidden">
            {mobileTab === 'ranks' && (
              <StudentLeaderboard
                currentUser={currentUser}
                leaderboardData={leaderboardData}
                skills={skills}
                leaderboardSkillFilter={leaderboardSkillFilter}
                setLeaderboardSkillFilter={setLeaderboardSkillFilter}
                currentStudentId={CURRENT_STUDENT_ID}
              />
            )}

            {mobileTab === 'badges' && (
              <StudentBadges
                configuredBadges={configuredBadges}
                masteredCount={masteredCount}
                streak={streak}
                totalXP={totalXP}
              />
            )}
          </div>

          {/* StudentDashboard handles Mobile Learn Tab AND Desktop View */}
          <StudentDashboard
            currentUser={currentUser}
            streak={streak}
            totalXP={totalXP}
            masteredCount={masteredCount}
            allApprovedSkills={allApprovedSkills}
            goalSkills={goalSkills}
            inProgressSkills={inProgressSkills}
            otherSkills={otherSkills}
            recommendedSkills={recommendedSkills}
            skills={skills}
            sortedDashboardSkills={sortedDashboardSkills}
            skillStatuses={skillStatuses}
            userGoals={userGoals}
            toggleGoal={toggleGoal}
            gameEngine={gameEngine}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            mobileSubjectFilter={mobileSubjectFilter}
            setMobileSubjectFilter={setMobileSubjectFilter}
            activeSubjectFilter={activeSubjectFilter}
            setActiveSubjectFilter={setActiveSubjectFilter}
            subjects={subjects}
            getSubjectConfig={getSubjectConfig}
            getIconByName={getIconByName}
            getGreeting={getGreeting}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            handleSaveProfile={handleSaveProfile}
            logoutUser={logoutUser}
            systemConfig={systemConfig}
            setViewMode={setViewMode}
            mobileTab={mobileTab}
            skillsBySubject={skillsBySubject}
            isLoading={isLoading}
          />

          {/* Mobile Bottom Navigation */}
          {
            !activeSkill && !selectedSubject && (
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
            )
          }
        </div>
      )}
      <TutorialOverlay />
    </div>
  );
};
