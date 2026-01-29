
import React, { useState, useEffect } from 'react';
import { Zap, Clock, Trophy, ArrowRight, Calculator, CheckCircle, Flame, Star, Target, Equal, Dumbbell, Award, Crown, XCircle, ShoppingBag, Gift, Shield, HelpCircle, Sigma } from 'lucide-react';
import { Button } from './ui';
import { getGlobalSettings, GlobalSettings } from '@stores';

export const GamificationVisualization: React.FC = () => {
  const [scenario, setScenario] = useState<'BASIC' | 'SPEED' | 'HARD' | 'COMPLEX' | 'PENALTY'>('COMPLEX');
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    // Load settings from store to make visualization accurate to current config
    setSettings(getGlobalSettings());
  }, []);

  if (!settings) return null;

  const scenarios = {
    BASIC: {
      title: "Standard Practice",
      desc: "A correct answer on Easy difficulty with normal timing.",
      base: settings.baseMasteryPoints,
      time: 15,
      difficulty: 'Easy',
      multiplier: 1.0,
      streak: 2,
      speedBonus: 0,
      ruleBonus: 0,
      ruleName: null,
      isCorrect: true,
      // Rank Data
      currentRank: "Novice",
      nextRank: "Apprentice",
      currentXP: 150,
      nextRankXP: 300,
      rankIcon: "🥉",
      rankColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    SPEED: {
      title: "Speed Run",
      desc: "Answering quickly (<5s) triggers a Speed Bonus.",
      base: settings.baseMasteryPoints,
      time: 3,
      difficulty: 'Medium',
      multiplier: settings.mediumMultiplier,
      streak: 3,
      speedBonus: settings.speedBonusFast,
      ruleBonus: 0,
      ruleName: null,
      isCorrect: true,
      // Rank Data
      currentRank: "Apprentice",
      nextRank: "Scholar",
      currentXP: 450,
      nextRankXP: 600,
      rankIcon: "🥈",
      rankColor: "bg-slate-100 text-slate-700 border-slate-200"
    },
    HARD: {
      title: "Challenge Mode",
      desc: "Hard difficulty applies a significant multiplier to the base score.",
      base: settings.baseMasteryPoints,
      time: 12,
      difficulty: 'Hard',
      multiplier: settings.hardMultiplier,
      streak: 4,
      speedBonus: 0,
      ruleBonus: 0,
      ruleName: null,
      isCorrect: true,
      // Rank Data
      currentRank: "Scholar",
      nextRank: "Master",
      currentXP: 820,
      nextRankXP: 1000,
      rankIcon: "🥇",
      rankColor: "bg-yellow-50 text-yellow-700 border-yellow-200"
    },
    COMPLEX: {
      title: "The 'Perfect' Storm",
      desc: "Fast answer + Hard difficulty + High streak rule trigger.",
      base: settings.baseMasteryPoints,
      time: 4,
      difficulty: 'Hard',
      multiplier: settings.hardMultiplier,
      streak: 5,
      speedBonus: settings.speedBonusFast,
      ruleBonus: 50,
      ruleName: "5x Streak Bonus",
      isCorrect: true,
      // Rank Data (Level Up Scenario)
      currentRank: "Scholar",
      nextRank: "Master",
      currentXP: 950, // Close to level up
      nextRankXP: 1000,
      rankIcon: "🥇",
      rankColor: "bg-yellow-50 text-yellow-700 border-yellow-200"
    },
    PENALTY: {
      title: "Penalty / Mistake",
      desc: "Incorrect answer resets streak and applies a penalty rule.",
      base: 0,
      time: 8,
      difficulty: 'Medium',
      multiplier: 1.0,
      streak: 0,
      speedBonus: 0,
      ruleBonus: -settings.standardPenaltyPoints,
      ruleName: "Wrong Answer Penalty",
      isCorrect: false,
      // Rank Data
      currentRank: "Novice",
      nextRank: "Apprentice",
      currentXP: 250,
      nextRankXP: 300,
      rankIcon: "🥉",
      rankColor: "bg-amber-100 text-amber-800 border-amber-200"
    }
  };

  const current = scenarios[scenario];
  const preTotal = (current.base + current.speedBonus) * current.multiplier;
  // Calculate Streak Bonus
  const streakBonus = (current.streak > 1 && settings.streakBonus > 0) ? (settings.streakBonus * current.streak) : 0;

  const total = Math.floor(preTotal + streakBonus + current.ruleBonus);

  // Rank Calc
  const newXP = Math.max(0, current.currentXP + total); // Prevent negative XP total
  const progressPercent = Math.min(100, (current.currentXP / current.nextRankXP) * 100);
  const newProgressPercent = Math.min(100, (newXP / current.nextRankXP) * 100);
  const isLevelUp = newXP >= current.nextRankXP;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Gamification Engine Logic
          </h3>
          <p className="text-xs text-slate-400 mt-1">Interactive simulation using your actual system configuration.</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full custom-scrollbar">
          {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${scenario === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              {scenarios[key].title}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <p className="text-sm text-slate-500 mb-6 italic text-center max-w-2xl mx-auto">
          Scenario: "{current.desc}"
        </p>

        {/* --- FORMULA VISUALIZATION START --- */}
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sigma className="w-4 h-4" /> Scoring Formula
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 font-mono text-sm md:text-lg">
            <span className="text-slate-400 font-bold">(</span>

            <div className="flex flex-col items-center group relative">
              <span className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 w-max">Base</span>
              <span className={`font-bold p-1 md:p-2 rounded-lg bg-white border ${current.base === 0 ? 'border-red-200 text-red-500' : 'border-slate-200 text-slate-700'}`}>{current.base}</span>
            </div>

            <span className="text-slate-400 font-bold">+</span>

            <div className="flex flex-col items-center group relative">
              <span className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 w-max">Speed</span>
              <span className={`font-bold p-1 md:p-2 rounded-lg bg-white border ${current.speedBonus > 0 ? 'border-amber-200 text-amber-600' : 'border-slate-200 text-slate-400'}`}>{current.speedBonus}</span>
            </div>

            <span className="text-slate-400 font-bold">) ×</span>

            <div className="flex flex-col items-center group relative">
              <span className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 w-max">Diff Multiplier</span>
              <span className={`font-bold p-1 md:p-2 rounded-lg bg-white border ${current.multiplier > 1 ? 'border-purple-200 text-purple-600' : 'border-slate-200 text-slate-700'}`}>{current.multiplier.toFixed(1)}</span>
            </div>

            <span className="text-slate-400 font-bold">+</span>

            {/* Streak Bonus */}
            <div className="flex flex-col items-center group relative">
              <span className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 w-max">Streak Bonus</span>
              <span className={`font-bold p-1 md:p-2 rounded-lg bg-white border ${streakBonus > 0 ? 'border-orange-200 text-orange-600' : 'border-slate-200 text-slate-400'}`}>
                {streakBonus}
              </span>
            </div>

            <span className="text-slate-400 font-bold">+</span>

            <div className="flex flex-col items-center group relative">
              <span className="text-[9px] md:text-[10px] text-slate-400 uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 w-max">Rules Bonus</span>
              <span className={`font-bold p-1 md:p-2 rounded-lg bg-white border ${current.ruleBonus !== 0 ? (current.ruleBonus > 0 ? 'border-emerald-200 text-emerald-600' : 'border-red-200 text-red-600') : 'border-slate-200 text-slate-400'}`}>
                {current.ruleBonus > 0 ? `+${current.ruleBonus}` : current.ruleBonus}
              </span>
            </div>

            <span className="text-slate-400 font-bold">=</span>

            <div className="flex flex-col items-center shadow-lg transform scale-110">
              <span className="text-[10px] text-indigo-500 uppercase mb-1 font-bold">Total XP</span>
              <span className="font-black p-1 md:p-2 px-3 md:px-4 rounded-lg bg-indigo-600 text-white border border-indigo-700">{total}</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
            (Base + Speed) × Multiplier + Streak + Bonus Rules
          </div>
        </div>
        {/* --- FORMULA VISUALIZATION END --- */}

        <div className="overflow-x-auto custom-scrollbar pb-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 min-w-[1000px]">

            {/* STEP 1: INPUT */}
            <div className="flex-1 relative group">
              <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200 hidden md:block"></div>
              <div className="absolute top-1/2 -right-3 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>

              <div className={`p-4 rounded-xl border-2 transition-colors h-full flex flex-col items-center text-center shadow-sm ${current.isCorrect ? 'bg-white border-slate-100 group-hover:border-blue-300' : 'bg-red-50 border-red-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${current.isCorrect ? 'bg-blue-50 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                  {current.isCorrect ? <Target className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-1">1. Student Action</h4>
                <div className="text-xs space-y-1 w-full bg-white/50 p-2 rounded-lg border border-slate-200/50">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Result:</span>
                    <span className={`font-bold flex items-center gap-1 ${current.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                      {current.isCorrect ? <><CheckCircle className="w-3 h-3" /> Correct</> : "Incorrect"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span className={`font-bold ${current.time < 5 ? 'text-amber-600' : 'text-slate-700'}`}>{current.time}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Difficulty:</span>
                    <span className={`font-bold ${current.difficulty === 'Hard' ? 'text-rose-600' : current.difficulty === 'Medium' ? 'text-amber-600' : 'text-slate-700'}`}>{current.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: CALCULATOR */}
            <div className="flex-1 relative group px-2">
              <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200 hidden md:block"></div>
              <div className="absolute top-1/2 -right-3 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>

              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 group-hover:border-indigo-300 transition-colors h-full flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Calculator className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-1">2. Core Scoring</h4>
                <div className="text-xs w-full font-mono bg-slate-900 text-slate-300 p-3 rounded-lg text-left space-y-1">
                  <div className="flex justify-between">
                    <span>Base XP:</span>
                    <span className={current.base === 0 ? 'text-red-400 font-bold' : 'text-white'}>{current.base}</span>
                  </div>
                  <div className={`flex justify-between ${current.speedBonus > 0 ? 'text-amber-400 font-bold' : 'opacity-50'}`}>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Speed Bonus:</span>
                    <span>+{current.speedBonus}</span>
                  </div>
                  <div className="border-t border-slate-700 my-1 pt-1 flex justify-between">
                    <span>Subtotal:</span>
                    <span>{current.base + current.speedBonus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: MULTIPLIER */}
            <div className="flex-1 relative group px-2">
              <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200 hidden md:block"></div>
              <div className="absolute top-1/2 -right-3 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>

              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 group-hover:border-rose-300 transition-colors h-full flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-1">3. Difficulty Scale</h4>
                <div className="text-xs w-full bg-rose-50 p-3 rounded-lg border border-rose-100 text-rose-900 font-medium">
                  <div className="flex justify-between mb-2">
                    <span>Level:</span>
                    <span className="uppercase font-bold">{current.difficulty}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">x{current.multiplier.toFixed(1)}</div>
                  <div className="text-[10px] opacity-70">Multiplier Applied</div>
                </div>
              </div>
            </div>

            {/* STEP 4: RULES ENGINE */}
            <div className="flex-1 relative group px-2">
              <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200 hidden md:block"></div>
              <div className="absolute top-1/2 -right-3 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>

              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 group-hover:border-amber-300 transition-colors h-full flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-1">4. Rules & Streak</h4>

                <div className="text-xs w-full space-y-2">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 relative group/streak">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 flex items-center gap-1 cursor-help">
                        Streak x{current.streak}
                      </span>
                      <div className="flex gap-0.5">
                        {current.streak > 0 ? [...Array(Math.min(5, current.streak))].map((_, i) => (
                          <div key={i} className="w-1.5 h-4 bg-orange-400 rounded-sm"></div>
                        )) : <span className="text-red-400 font-bold text-[10px]">BROKEN</span>}
                      </div>
                    </div>
                    {streakBonus > 0 && (
                      <div className="text-orange-600 font-bold text-right">+{streakBonus} XP</div>
                    )}
                  </div>

                  {current.ruleBonus !== 0 ? (
                    <div className={`border p-2 rounded font-bold animate-pulse ${current.ruleBonus > 0 ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      {current.ruleName}
                      <div className="text-lg">{current.ruleBonus > 0 ? '+' : ''}{current.ruleBonus} XP</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[10px] p-2">
                      No custom rules triggered.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 5: OUTPUT */}
            <div className="flex-1 relative group px-2">
              <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200 hidden md:block"></div>
              <div className="absolute top-1/2 -right-3 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>

              <div className={`p-4 rounded-xl border-2 border-transparent shadow-lg h-full flex flex-col items-center text-center text-white relative overflow-hidden ${total >= 0 ? 'bg-gradient-to-br from-indigo-600 to-purple-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-bl-full -mr-6 -mt-6"></div>

                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
                  {total >= 0 ? <Trophy className="w-5 h-5 text-yellow-300" /> : <XCircle className="w-5 h-5 text-white" />}
                </div>
                <h4 className="font-bold text-sm uppercase tracking-wide mb-2 opacity-80">5. Total Earned</h4>

                <div className="text-3xl font-black tracking-tight mb-1 text-white drop-shadow-md">
                  {total}
                </div>
                <div className="text-[10px] font-medium bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                  XP Points
                </div>
              </div>
            </div>

            {/* STEP 6: PROGRESSION */}
            <div className="flex-1 relative group">
              <div className={`p-4 rounded-xl border-2 transition-all h-full flex flex-col items-center text-center shadow-sm relative overflow-hidden ${isLevelUp ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200' : 'bg-white border-slate-100'}`}>

                {isLevelUp && (
                  <div className="absolute top-0 left-0 w-full h-full bg-yellow-100/50 animate-pulse pointer-events-none"></div>
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 ${isLevelUp ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>
                  {isLevelUp ? <Crown className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-2 z-10">6. Rank Update</h4>

                <div className="w-full space-y-2 z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-700">{current.currentRank}</span>
                    {isLevelUp ? (
                      <span className="text-[10px] font-bold text-green-600 animate-bounce">LEVEL UP!</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">{current.nextRank}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                    {/* Previous Progress */}
                    <div
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${total < 0 ? 'bg-red-400' : 'bg-slate-400'}`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                    {/* New Progress (Gained) */}
                    {total > 0 && (
                      <div
                        className={`absolute top-0 h-full transition-all duration-1000 delay-300 ${isLevelUp ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ left: `${progressPercent}%`, width: `${Math.max(0, newProgressPercent - progressPercent)}%` }}
                      ></div>
                    )}
                    {/* Negative Progress (Lost - Visualization trick, usually we just don't grow) */}
                  </div>

                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>{newXP} XP</span>
                    <span>{current.nextRankXP} XP</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- PART 2: THE END RESULT (PROFILE / REDEEM) --- */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-purple-600" />
            The End Result: Student Profile & Rewards
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-white/20 bg-indigo-500 flex items-center justify-center text-2xl shadow-lg">
                  👦
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student</div>
                  <div className="text-xl font-bold">Alex Explorer</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${current.rankColor.replace('text-', 'bg-').replace('bg-', 'text-').split(' ')[0]} bg-white text-slate-900`}>
                    {current.rankIcon} {current.currentRank}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 opacity-80">
                    <span>Total XP</span>
                    <span className="font-mono">{newXP}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${newProgressPercent}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">Streak</div>
                    <div className="text-xl font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-amber-400" /> {current.streak}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 uppercase">Badges</div>
                    <div className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <Shield className="w-4 h-4" /> 12
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Collection */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4 flex items-center justify-between">
                Recent Badges
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">View All</span>
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-100 text-center">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">⚡</div>
                  <span className="text-[10px] font-bold text-amber-800 leading-tight">Speed Demon</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">📚</div>
                  <span className="text-[10px] font-bold text-indigo-800 leading-tight">Book Worm</span>
                </div>
                <div className={`flex flex-col items-center gap-2 p-2 rounded-xl border text-center transition-all ${isLevelUp ? 'bg-emerald-50 border-emerald-200 scale-105 shadow-md' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'}`}>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">🚀</div>
                  <span className="text-[10px] font-bold text-emerald-800 leading-tight">Level Up!</span>
                </div>
              </div>
            </div>

            {/* Redeem / Store */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4 flex items-center justify-between">
                Rewards Shop
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">¢</div>
                  {newXP * 2} Coins
                </div>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800">Avatar Frame</div>
                    <div className="text-[10px] text-slate-500">Cosmetic</div>
                  </div>
                  <Button size="sm" variant="secondary" className="h-7 text-[10px] px-2">Buy 500</Button>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800">Skip Homework</div>
                    <div className="text-[10px] text-slate-500">One-time use</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 opacity-50" disabled>Locked</Button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
