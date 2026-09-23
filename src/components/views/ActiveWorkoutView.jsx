import React, { useState } from 'react';
import { 
  Dumbbell, Trophy, Timer as TimerIcon, CheckCircle, ChevronRight, 
  Play, Pause, RotateCcw, Plus, Trash2, Target, Award, 
  Zap, BarChart3, Activity, Check, Cloud, Eye, X, MessageSquare, 
  Layers, CheckSquare, ChevronUp, ChevronDown, Edit3, LogIn, LogOut, 
  User as UserIcon, Search, HeartPulse, Send, Lock as LockIcon, ShieldAlert, Calendar
} from 'lucide-react';
import { LADDER_RUNGS, MASTER_PATHWAYS } from '../../data/constants';

export default function ActiveWorkoutView({
  activeWorkout,
  finishWorkout,
  timerSeconds,
  formatTime,
  startTimer,
  toggleTimer,
  resetTimer,
  timerActive,
  activeCircuit,
  roundTally,
  handleCompleteRoundFastForward,
  handleToggleCircuitItem,
  setActiveCircuit,
  clearRoutineChecklist,
  adjustPlannedItemLevel,
  setLoggingExercise,
  groupedSets,
  expandedActiveLogs,
  toggleActiveLogGroup,
  sessionNotes,
  setSessionNotes,
  setEditingSet,
  removeSet,
  setActiveTab
}) {
  // Helper to format current date for date input (YYYY-MM-DD) in local time
  const getCurrentLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [workoutDate, setWorkoutDate] = useState(getCurrentLocalDate());

  // Helper to format date into friendly "mmm dd, yyyy" string without timezone shifts
  const formatFriendlyDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateString;
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleFinish = () => {
    // Parse the YYYY-MM-DD string into local date components to prevent UTC shift
    if (workoutDate) {
      const [year, month, day] = workoutDate.split('-').map(Number);
      const localNow = new Date();
      const targetDate = new Date(
        year, 
        month - 1, 
        day, 
        localNow.getHours(), 
        localNow.getMinutes(), 
        localNow.getSeconds()
      );
      finishWorkout(targetDate);
    } else {
      finishWorkout(new Date());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{activeWorkout.title}</h2>
          <p className="text-xs text-slate-400 mt-1">Logged sets auto-save instantly to your personal Firebase cloud account.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Friendly Date Picker */}
          <div className="relative group">
            <div className="flex items-center bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus-within:border-emerald-500 transition shadow-inner">
              <Calendar className="w-4 h-4 text-emerald-400 mr-2.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Session Date</span>
                <span className="font-semibold text-slate-100">{formatFriendlyDate(workoutDate)}</span>
              </div>
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Change workout date"
              />
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={(activeWorkout.sets || []).length === 0 && roundTally === 0}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              (activeWorkout.sets || []).length > 0 || roundTally > 0
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4" />
            Save & Finish Session
          </button>
        </div>
      </div>

      {/* Rest Timer Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <TimerIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Inter-Set Rest Timer</div>
            <div className="text-3xl font-mono font-bold text-slate-100">{formatTime(timerSeconds)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => startTimer(60)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 60 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
          >
            60s
          </button>
          <button
            onClick={() => startTimer(90)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 90 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
          >
            90s
          </button>
          <button
            onClick={() => startTimer(180)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 180 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
          >
            3 min
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          <button
            onClick={toggleTimer}
            className={`p-2.5 rounded-xl font-bold transition ${
              timerActive ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}
          >
            {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Circuit Tracker & Fractional Round Calculator */}
      {activeCircuit && activeCircuit.items && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Circuit Protocol</span>
              <h3 className="text-base font-bold text-slate-100">{activeCircuit.name}</h3>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span>Completed Rounds:</span>
              <span className="text-base font-black text-emerald-300">
                {(roundTally + ((activeCircuit.items || []).filter(i => i.completed).length / Math.max(1, (activeCircuit.items || []).length))).toFixed(2)}
              </span>
            </div>
          </div>

          {activeCircuit.type === 'ladder' && roundTally >= LADDER_RUNGS.length ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-100">Ladder Complete!</h3>
              <p className="text-sm text-slate-400">You survived the Spider-Man Ladder.</p>
            </div>
          ) : (
            <>
              <button
                onClick={handleCompleteRoundFastForward}
                className="w-full py-3 mb-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                Complete Full Round Fast-Forward
              </button>
              
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">Tap stations as you complete them. Completing all automatically logs a full round:</span>
                {activeCircuit.items.map((item, idx) => {
                  const isLadder = activeCircuit.type === 'ladder';
                  const currentRungReps = isLadder ? LADDER_RUNGS[Math.min(roundTally, LADDER_RUNGS.length - 1)] : null;
                  const displayTarget = isLadder ? `${currentRungReps} Reps` : item.target;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleCircuitItem(idx)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                        item.completed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-amber-400">{displayTarget}</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'}`}>
                          {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActiveCircuit(null)}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Close Circuit Without Saving
            </button>
          </div>
        </div>
      )}

      {/* Planned Routine Checklist (for standard workouts) */}
      {activeWorkout.plannedItems && activeWorkout.plannedItems.length > 0 && !activeCircuit && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckSquare className="w-4 h-4" />
              Routine Checklist (Tap to Log Sets)
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Use ▲/▼ to adjust difficulty</span>
              <button
                onClick={clearRoutineChecklist}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-lg border border-slate-700 transition"
                title="Clear remaining routine checklist without affecting logged sets"
              >
                Clear Checklist
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            {activeWorkout.plannedItems.map((item, idx) => {
              const track = MASTER_PATHWAYS.find(t => t.id === item.trackId);
              const levelData = track?.levels1to5?.find(l => l.level === item.level) || track?.levels6to10?.find(l => l.level === item.level);
              
              return (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => adjustPlannedItemLevel(idx, 1)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => adjustPlannedItemLevel(idx, -1)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Lvl {item.level}</span>
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-amber-400 block mt-0.5">Target: {item.target}</span>
                    </div>
                  </div>

                  {levelData && track && (
                    <button
                      onClick={() => setLoggingExercise({ trackId: track.id, levelData })}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/10 self-end sm:self-auto"
                    >
                      + Log Set
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grouped Exercise Set Log (Accordion UI) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm">Session Set Log</h3>
          <span className="text-xs text-slate-400 font-medium">{(activeWorkout.sets || []).length} total sets recorded</span>
        </div>

        {(activeWorkout.sets || []).length === 0 ? (
          <div className="p-12 text-center">
            <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No sets logged yet today.</p>
            <p className="text-xs text-slate-500 mt-1">Head to Skill Pathways or Routines to start logging!</p>
            <button
              onClick={() => setActiveTab('roadmap')}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl border border-slate-700 transition"
            >
              View Skill Pathways
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {Object.values(groupedSets).map((group, groupIdx) => {
              const track = MASTER_PATHWAYS.find(t => t.id === group.trackId);
              const trackTitle = track ? track.title : 'Circuit Station';
              const levelData = track ? (track.levels1to5?.find(l => l.name === group.exerciseName) || track.levels6to10?.find(l => l.name === group.exerciseName)) : null;
              const isExpanded = expandedActiveLogs[group.exerciseName];

              return (
                <div key={groupIdx} className="bg-slate-900/40 transition">
                  <div 
                    onClick={() => toggleActiveLogGroup(group.exerciseName)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{trackTitle}</span>
                      <h4 className="font-bold text-slate-100 text-base">{group.exerciseName}</h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                        {group.sets.length} Sets Logged
                      </span>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3 pt-2 border-t border-slate-800/50">
                      {levelData && track && (
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => setLoggingExercise({ trackId: track.id, levelData })}
                            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Manual Set
                          </button>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {group.sets.map((set, sIdx) => (
                          <div key={set.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-800">
                                #{sIdx + 1}
                              </span>
                              <div>
                                <span className="text-xs text-slate-400">Logged at {set.timestamp}</span>
                                {set.notes && (
                                  <p className="text-xs text-amber-300/90 mt-0.5 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {set.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-5">
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Reps/Hold</span>
                                <span className="text-xs font-bold text-emerald-400">{set.repsOrHold}</span>
                              </div>

                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">RPE</span>
                                <span className="text-xs font-bold text-amber-400">{set.rpe}/10</span>
                              </div>

                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Form</span>
                                <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {set.formRating}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingSet(set)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                                  title="Edit Set"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeSet(set.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                                  title="Delete Set"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="p-4 bg-slate-950/40">
              <input
                type="text"
                placeholder="Add session notes (e.g. felt great on scapular pulls, wrist slightly tight)..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
