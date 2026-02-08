import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStoredSkills, getStudentResults, getUsers, addChildToParent, updateUser, getUserById, getSystemConfig, getSkillMasteryStatus, getStudentStats } from '@stores';
import { User, Role } from '@types';
import { Card, Button, Avatar } from '@shared/components/ui';
import { TrendingUp, Clock, Target, AlertCircle, UserPlus, Users, Check, Settings, Flame } from 'lucide-react';
import { AddChildModal } from './AddChildModal';
import { ParentProfile } from './ParentProfile';
import { EditChildModal } from './EditChildModal';
import { LimitReachedModal } from './LimitReachedModal';

import { useAuth } from '@auth';
import { useToast } from '@shared/context';

export const ParentView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [children, setChildren] = useState<User[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);

  // Modals state
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<User | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const [data, setData] = useState<{ name: string, score: number, subject: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ skill: string, score: number, time: string }[]>([]);
  const [stats, setStats] = useState({ skillsMastered: 0, avgAccuracy: 0, streak: 0 });

  const [maxChildren, setMaxChildren] = useState<number>(1);

  // ... (useEffect and loadFamilyData remain same) ...
  // Listen for profile open request from Navbar
  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('open-parent-profile', handleOpenProfile);
    return () => window.removeEventListener('open-parent-profile', handleOpenProfile);
  }, []); // Empty dependency array to ensure stable listener

  useEffect(() => {
    // Refresh data when user changes
    if (user) loadFamilyData();
  }, [user]);

  useEffect(() => {
    if (selectedChildId) {
      loadAnalytics(selectedChildId);
    } else {
      setData([]);
      setRecentActivity([]);
      setStats({ skillsMastered: 0, avgAccuracy: 0, streak: 0 });
    }
  }, [selectedChildId]);

  const loadFamilyData = async () => {
    if (!user) return;

    // Load config for limits
    const config = await getSystemConfig();
    const userTierId = user.subscriptionTier || 'free';
    const tier = config.subscriptionTiers.find(t => t.id === userTierId);
    setMaxChildren(tier?.maxChildren || 1);

    // Process grades for modals ensuring backward compatibility if they are objects
    const grades = config.grades.map(g => (typeof g === 'string' ? g : g.id));
    setAvailableGrades(grades);

    const allUsers = await getUsers();
    const parent = allUsers.find(u => u.id === user.id);

    if (parent) {
      setCurrentUser(parent);
    }

    if (parent && parent.children) {
      const childUsers = allUsers.filter(u => parent.children?.includes(u.id));
      setChildren(childUsers);
      if (childUsers.length > 0 && !selectedChildId) {
        setSelectedChildId(childUsers[0].id);
      }
    }
  };

  const handleAddChildClick = () => {
    if (children.length >= maxChildren) {
      setIsLimitModalOpen(true);
    } else {
      setIsAddChildOpen(true);
    }
  };

  const handleAddChild = async (name: string, email: string, avatar: string, grades: string[], preferences: string) => {
    if (!user) return;

    // Strict limit check
    if (children.length >= maxChildren) {
      toast.error('Plan Limit Reached', `You can only have ${maxChildren} child profiles on your current plan.`);
      return;
    }

    // Convert comma-separated preferences string to array
    const preferencesArray = preferences
      ? preferences.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : [];

    const newChild: User = {
      id: `child-${Date.now()}`,
      name,
      displayName: name, // Ensure display name is set
      email,
      avatar, // Save the selected avatar
      role: Role.STUDENT,
      status: 'Active',
      lastLogin: 'Never',
      grades: grades, // Save grades array
      preferences: preferencesArray, // Save preferences
    };

    await addChildToParent(user.id, newChild);
    await loadFamilyData(); // Refresh list
    // Select the new child
    setSelectedChildId(newChild.id);
  };

  const handleUpdateChild = async (childId: string, updates: Partial<User>) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const updatedChild = { ...child, ...updates };
    await updateUser(updatedChild);

    // Refresh local list
    setChildren(prev => prev.map(c => c.id === childId ? updatedChild : c));

    // Update stats and analytics if needed (re-fetch not strictly necessary if only profile changed)
    await loadFamilyData();
  };

  const handleSaveProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    await updateUser(updatedUser);
    setCurrentUser(updatedUser);
    // Dispatch event to update global user state if needed
    window.dispatchEvent(new Event('user-profile-updated'));
  };

  const loadAnalytics = async (childId: string) => {
    const { getStudentResultsByStudentId } = await import('@stores');
    // Fetch ONLY this child's results to avoid permission errors
    const childResults = await getStudentResultsByStudentId(childId);

    // Also need to get skills
    const skills = await getStoredSkills();

    // Pass results explicitly to avoid relying on sync store which might be empty
    const resultStats = getStudentStats(childId, childResults);

    // Process for charts (Use the fetched childResults directly)
    const chartData = childResults.slice(-7).map(r => {
      const skill = skills.find(s => s.id === r.skillId);
      return {
        name: skill ? skill.skillName.substring(0, 15) + '...' : 'Unknown',
        score: r.score,
        subject: skill?.subject || 'General'
      };
    });
    setData(chartData);

    // Process recent activity
    const activity = childResults.slice(-5).reverse().map(r => {
      const skill = skills.find(s => s.id === r.skillId);
      return {
        skill: skill?.skillName || 'Unknown Skill',
        score: r.score,
        time: new Date(r.timestamp).toLocaleDateString()
      };
    });
    setRecentActivity(activity);

    // Stats Calculations (Optimized with fallback)
    const childUser = (await getUsers()).find(u => u.id === childId);

    if (childUser?.stats) {
      // Use pre-calculated stats (O(1))
      const { skillsMastered, correctQuestions, totalQuestions, streak } = childUser.stats;
      const avgAccuracy = totalQuestions > 0
        ? Math.round((correctQuestions / totalQuestions) * 100)
        : 0;

      setStats({
        skillsMastered,
        avgAccuracy,
        streak
      });
    } else {
      // Fallback: Calculate on the fly (O(N)) - Legacy support
      // 1. Skills Mastered
      let masteredCount = 0;
      // We need to re-fetch config if we want to be safe, but defaults are usually fine
      // We pass childResults to avoid reading empty local storage
      skills.forEach(skill => {
        const status = getSkillMasteryStatus(skill, childId, undefined, undefined, childResults);
        if (status.isMastered) masteredCount++;
      });

      // 2. Average Accuracy
      const totalAttempts = childResults.length;
      const correctAttempts = childResults.filter(r => r.score > 0).length;
      const avgAccuracy = totalAttempts > 0
        ? Math.round((correctAttempts / totalAttempts) * 100)
        : 0;

      setStats({
        skillsMastered: masteredCount,
        avgAccuracy,
        streak: resultStats.streak
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      {/* ... Modals ... */}
      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        onAdd={handleAddChild}
        availableGrades={availableGrades}
      />

      <EditChildModal
        isOpen={!!editingChild}
        onClose={() => setEditingChild(null)}
        child={editingChild}
        onSave={handleUpdateChild}
        availableGrades={availableGrades}
      />

      <LimitReachedModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        currentCount={children.length}
        maxCount={maxChildren}
        planName={user?.subscriptionTier === 'pro' ? 'Pro' : user?.subscriptionTier === 'basic' ? 'Basic' : 'Free'}
      />

      <ParentProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onSave={handleSaveProfile}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 dark:from-purple-900 dark:via-purple-800 dark:to-pink-900 px-6 pt-8 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10 w-full animate-in fade-in slide-in-from-left duration-500">
          <h1 className="text-3xl font-black text-white mb-2">Parent Dashboard</h1>
          <p className="text-purple-100 text-lg">Monitor your child's learning journey and mastery.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-16 relative z-20 space-y-6 pb-12">

        {/* Child Selector Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl shadow-purple-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Your Children</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a profile to view status</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {children.length > 0 ? (
              <div className="flex items-center gap-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border ${selectedChildId === child.id
                      ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300 shadow-sm'
                      : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <Avatar src={child.avatar} size="sm" role={Role.STUDENT} />
                    <span className="hidden sm:inline">{child.name.split(' ')[0]}</span>
                    {selectedChildId === child.id && <Check className="w-3 h-3 ml-1" />}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-500 italic">No children linked</span>
            )}

            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-1">
              {selectedChildId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const child = children.find(c => c.id === selectedChildId);
                    if (child) setEditingChild(child);
                  }}
                  title="Edit Child Profile"
                  className="text-slate-400 hover:text-purple-600"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                className={`${children.length >= maxChildren ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} border-transparent`}
                onClick={handleAddChildClick}
                title={children.length >= maxChildren ? "Plan Limit Reached" : "Add Child"}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {children.length === 0 ? (
          <Card className="py-12 text-center border-dashed border-2 border-slate-200 bg-slate-50">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Add your first child</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Connect a student account to view their progress, grades, and learning habits.</p>
            <Button
              onClick={handleAddChildClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Add Child Account
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
              <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-purple-100/20 dark:shadow-none hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills Mastered</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.skillsMastered}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-purple-100/20 dark:shadow-none hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Accuracy</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.avgAccuracy}%</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stats.avgAccuracy >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-purple-100/20 dark:shadow-none hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Day Streak</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.streak}<span className="text-sm font-bold text-slate-400 ml-1">days</span></h3>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                    <Flame className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
              <Card className="lg:col-span-2 shadow-xl shadow-slate-100/50 dark:shadow-none border-slate-100">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                  XP History
                </h3>
                {data.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400 italic">
                    No activity data yet.
                  </div>
                )}
              </Card>

              <Card className="lg:col-span-1 shadow-xl shadow-slate-100/50 dark:shadow-none border-slate-100">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-200 line-clamp-1">{activity.skill}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </div>
                        </div>
                        <div className={`font-black text-sm ${activity.score >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                          {activity.score > 0 ? '+' : ''}{activity.score} XP
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No recent quizzes taken.
                    </div>
                  )}

                  {recentActivity.length > 0 && stats.avgAccuracy < 50 && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex gap-3 items-start mt-4">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <div className="text-xs text-rose-700">
                        <strong>Needs Attention:</strong> Average score is below 50%. Consider reviewing "Counting & Number Sense" together.
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};