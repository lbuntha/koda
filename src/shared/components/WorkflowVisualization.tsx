
import React from 'react';
import { ShieldCheck, GraduationCap, Users, ArrowRight, Database, Sparkles, Trophy, FileText, Copy, PlayCircle } from 'lucide-react';

export const WorkflowVisualization: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Platform Architecture: The "Component" Lifecycle</h3>
        <span className="text-xs text-slate-500 font-mono">Data Flow Visualization</span>
      </div>
      
      <div className="p-6 md:p-8 overflow-x-auto">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-0 min-w-[800px]">
          
          {/* STEP 1: ADMIN */}
          <div className="flex-1 relative group">
            <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-slate-300 hidden md:block"></div>
            <div className="absolute top-1/2 -right-4 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>
            
            <div className="bg-slate-900 text-white p-5 rounded-xl border-2 border-slate-900 relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-700 pb-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">1. Admin (Architect)</h4>
                  <p className="text-[10px] text-slate-400">Content Governance</p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <Database className="w-3 h-3" />
                    Creates Template
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Defines the "Gold Standard". Sets grade, subject, and 3-5 reference questions to establish style.
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] px-2 py-1 bg-slate-700 rounded text-slate-300">Output: Library Template</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: TEACHER */}
          <div className="flex-1 relative px-4 group">
            <div className="absolute top-1/2 -right-0 w-8 h-0.5 bg-slate-300 hidden md:block"></div>
            <div className="absolute top-1/2 -right-0 -mt-1.5 text-slate-300 hidden md:block"><ArrowRight className="w-4 h-4" /></div>

            <div className="bg-white p-5 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-colors relative z-10 h-full flex flex-col shadow-sm">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">2. Teacher (Builder)</h4>
                  <p className="text-[10px] text-slate-500">Curriculum Generation</p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-2">
                  <Copy className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-600">Selects Admin Template.</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
                    <Sparkles className="w-3 h-3" />
                    AI Expansion
                  </div>
                  <p className="text-[10px] text-indigo-800/80 leading-relaxed">
                    "Generate 10 questions using this template." AI mimics the Admin's examples to create a full quiz.
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded border border-indigo-200">Output: Live Quiz</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: STUDENT */}
          <div className="flex-1 relative">
            <div className="bg-white p-5 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-colors relative z-10 h-full flex flex-col shadow-sm">
              <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">3. Student (Learner)</h4>
                  <p className="text-[10px] text-slate-500">Mastery & Analytics</p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
                    <PlayCircle className="w-3 h-3" />
                    Takes Quiz
                  </div>
                  <p className="text-[10px] text-emerald-800/80 leading-relaxed">
                    Student plays the specific quiz generated by the teacher. Result is deterministic and fair.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                   <div className="flex flex-col items-center">
                      <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-[9px] text-slate-400">Rewards</span>
                   </div>
                   <div className="w-px h-6 bg-slate-200"></div>
                   <div className="flex flex-col items-center">
                      <FileText className="w-4 h-4 text-blue-500 mb-1" />
                      <span className="text-[9px] text-slate-400">Report</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
