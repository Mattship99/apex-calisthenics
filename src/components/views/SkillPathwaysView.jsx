import React from 'react';
import { 
  Trophy, Search, X, Lock as LockIcon, Target, Eye, Plus, 
  CheckCircle, ShieldAlert, ChevronDown, ChevronRight 
} from 'lucide-react';
import { MASTER_PATHWAYS } from '../../data/constants';
import TendonWarningPill from '../dashboard/TendonWarningPill';
import BalanceRadar from '../dashboard/BalanceRadar';
import VolumeSuggestion from '../dashboard/VolumeSuggestions.jsx';

export default function SkillPathwaysView({
  workoutHistory,
  userLevels,
  pathwaySearch,
  setPathwaySearch,
  selectedCategory,
  setSelectedCategory,
  filteredPathways,
  expandedPathway,
  setExpandedPathway,
  unlockedPhases,
  activePhaseTab,
  setActivePhaseTab,
  setPendingUnlockTrack,
  updateLevel,
  setSelectedExerciseDemo,
  setLoggingExercise
}) {
  return (
    <div className="space-y-6">
      <TendonWarningPill workoutHistory={workoutHistory} />
      <BalanceRadar userProgress={userLevels} />
      <VolumeSuggestion userProgress={userLevels} />
      
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Interactive Progression Framework
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Filter by category or search skills to quickly find what you're working on.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search skills or drills..."
              value={pathwaySearch}
              onChange={(e) => setPathwaySearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            />
            {pathwaySearch && (
              <button onClick={() => setPathwaySearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {['All', 'Beginner', 'Intermediate', 'Advanced', 'Elite', 'Unilateral', 'Legs', 'Pulling', 'Pushing', 'Balance', 'Core'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredPathways.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">No skill tracks matched your search.</p>
          <button
            onClick={() => { setPathwaySearch(''); setSelectedCategory('All'); }}
            className="mt-3 text-xs font-bold text-emerald-400 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        filteredPathways.map((track) => {
          const currentLevel = (userLevels || {})[track.id] || 1;
          const isExpanded = expandedPathway === track.id;
          
          const has10Levels = track.levels6to10 && track.levels6to10.length > 0;
          const isPhase2Unlocked = !has10Levels || (unlockedPhases || {})[track.id] || currentLevel > 5;
          const activeList = has10Levels && activePhaseTab === '6-10' ? track.levels6to10 : track.levels1to5;
          
          const activeLevelData = track.levels1to5?.find(l => l.level === currentLevel) || 
                                  track.levels6to10?.find(l => l.level === currentLevel) || 
                                  track.levels1to5?.[0];

          return (
            <div key={track.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              
              {/* Collapsible Header */}
              <div 
                onClick={() => setExpandedPathway(isExpanded ? null : track.id)}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 cursor-pointer hover:bg-slate-800/50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      {track.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Level {currentLevel} of {has10Levels ? 10 : 5}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mt-2">{track.title}</h3>
                  {!isExpanded && <p className="text-sm text-slate-400 mt-1 truncate max-w-lg">{track.description}</p>}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-semibold text-slate-400 px-2 hidden md:inline">Set Level:</span>
                    {activeList?.map((lvl) => {
                      const isLocked = has10Levels && lvl.level > 5 && !isPhase2Unlocked;
                      return (
                        <button
                          key={lvl.level}
                          onClick={() => {
                            if (!isLocked) updateLevel(track.id, lvl.level, has10Levels);
                            else setPendingUnlockTrack(track);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            (userLevels || {})[track.id] === lvl.level
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                              : isLocked 
                              ? 'bg-slate-950/50 text-slate-600 cursor-not-allowed'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {isLocked ? <LockIcon className="w-3 h-3" /> : lvl.level}
                        </button>
                      );
                    })}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Collapsible Content Body */}
              {isExpanded && activeLevelData && (
                <div className="p-6 bg-slate-900/40 border-t border-slate-800/50">
                  <p className="text-sm text-slate-400 mb-6">{track.description}</p>

                  {/* Phase Switcher for 10-Level Tracks */}
                  {has10Levels && (
                    <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4">
                      <button 
                        onClick={() => setActivePhaseTab('1-5')} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activePhaseTab === '1-5' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                      >
                        {track.levels1to5Title || 'Phase 1 (1-5)'}
                      </button>
                      <button 
                        onClick={() => {
                          if (!isPhase2Unlocked) {
                            setPendingUnlockTrack(track);
                          } else {
                            setActivePhaseTab('6-10');
                          }
                        }} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${activePhaseTab === '6-10' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                      >
                        {!isPhase2Unlocked && <LockIcon className="w-3.5 h-3.5 text-amber-400" />} {track.levels6to10Title || 'Phase 2 (6-10)'}
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Current Target Drill</div>
                      <h4 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                        {activeLevelData.name}
                      </h4>
                      <div className="inline-flex items-center gap-2 bg-slate-800/80 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold mt-2 border border-slate-700">
                        <Target className="w-3.5 h-3.5" />
                        Mastery Standard: {activeLevelData.target}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedExerciseDemo(activeLevelData)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-sm"
                      >
                        <Eye className="w-4 h-4 text-amber-400" />
                        View Animated Demo
                      </button>

                      <button
                        onClick={() => setLoggingExercise({ trackId: track.id, levelData: activeLevelData })}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        Log Set
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Non-Negotiable Form Cues
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {activeLevelData.cues?.map((cue, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{cue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Common Pitfalls to Avoid
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {activeLevelData.pitfalls?.map((pit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{pit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-400 mb-3">Progression Continuum (Phase {activePhaseTab}):</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {activeList?.map((lvl) => {
                        const isLocked = has10Levels && lvl.level > 5 && !isPhase2Unlocked;
                        const isCurrent = lvl.level === currentLevel;
                        const isPassed = lvl.level < currentLevel;

                        return (
                          <div
                            key={lvl.level}
                            onClick={() => {
                              if (!isLocked) updateLevel(track.id, lvl.level, has10Levels);
                              else setPendingUnlockTrack(track);
                            }}
                            className={`p-2.5 rounded-xl border cursor-pointer transition relative ${
                              isLocked 
                                ? 'opacity-50 bg-slate-950 border-slate-800'
                                : isCurrent
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                                : isPassed
                                ? 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                                : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider">Lvl {lvl.level}</span>
                              {isLocked ? (
                                <LockIcon className="w-3 h-3 text-amber-400" />
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExerciseDemo(lvl);
                                  }}
                                  className="text-slate-400 hover:text-amber-300"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="text-xs font-medium truncate mt-1">{lvl.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
