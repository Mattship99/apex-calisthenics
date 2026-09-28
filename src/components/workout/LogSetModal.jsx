import React, { useState, useEffect } from 'react';
import { X, ArrowRight, RotateCcw } from 'lucide-react';

export default function LogSetModal({ 
  levelData, 
  trackId, 
  restDuration, 
  initialSetData, 
  onClose, 
  onSave, 
  onStartTimer,
  circuitExercises = [], // Array of exercises if logging a circuit
  circuitRound = 1,      // Current circuit round number
  onNextCircuitExercise  // Callback to advance to the next exercise in the circuit
}) {
  // Determine if we are in circuit mode
  const isCircuitMode = circuitExercises.length > 0;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Active exercise to log (either current circuit exercise or single levelData)
  const activeExercise = isCircuitMode ? circuitExercises[currentExerciseIndex] : levelData;

  const [reps, setReps] = useState(
    initialSetData 
      ? initialSetData.repsOrHold 
      : (activeExercise?.targetReps || activeExercise?.repsOrHold || (activeExercise?.type === 'hold' ? '30s' : '8'))
  );
  const [rpe, setRpe] = useState(initialSetData ? initialSetData.rpe : '8');
  const [formQuality, setFormQuality] = useState(initialSetData ? initialSetData.formRating : 'Clean');
  const [setNote, setSetNote] = useState(initialSetData ? (initialSetData.notes || '') : '');

  // Update default reps when switching circuit exercises
  useEffect(() => {
    if (isCircuitMode && activeExercise && !initialSetData) {
      setReps(activeExercise.targetReps || activeExercise.repsOrHold || (activeExercise?.type === 'hold' ? '30s' : '8'));
    }
  }, [currentExerciseIndex, isCircuitMode, activeExercise, initialSetData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const savedData = {
      id: initialSetData ? initialSetData.id : Date.now(),
      trackId: trackId || (initialSetData ? initialSetData.trackId : ''),
      exerciseName: activeExercise?.name || initialSetData?.exerciseName || 'Custom Exercise',
      repsOrHold: reps,
      rpe,
      formRating: formQuality,
      notes: setNote,
      round: isCircuitMode ? circuitRound : undefined,
      timestamp: initialSetData ? initialSetData.timestamp : new Date().toISOString()
    };

    onSave(savedData);

    // If in circuit mode and there are more exercises in this round, advance to the next movement
    if (isCircuitMode && !initialSetData && currentExerciseIndex < circuitExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      if (onStartTimer && restDuration) {
        onStartTimer(restDuration);
      }
      return; // Keep modal open for the next circuit exercise
    }

    // Otherwise, complete the flow
    if (!initialSetData && onStartTimer) {
      onStartTimer(restDuration);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {initialSetData 
                  ? 'Edit Set' 
                  : isCircuitMode 
                    ? `Circuit Round ${circuitRound} • Exercise ${currentExerciseIndex + 1} of ${circuitExercises.length}`
                    : 'Log Set & Start Rest'
                }
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-0.5">
              {activeExercise?.name || initialSetData?.exerciseName}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Actual Reps / Hold:</label>
              {activeExercise?.targetReps && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  Target: {activeExercise.targetReps}
                </span>
              )}
            </div>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">RPE / Effort (1-10):</label>
            <select
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>RPE {n} {n >= 9 ? '(Max Effort)' : n >= 7 ? '(Hard)' : '(Moderate)'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Form Quality:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Clean', 'Good', 'Struggled'].map(q => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setFormQuality(q)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    formQuality === q
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Set Notes (Optional):</label>
            <input
              type="text"
              placeholder="e.g. narrow grip felt stronger..."
              value={setNote}
              onChange={(e) => setSetNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              {initialSetData ? (
                'Update Set'
              ) : isCircuitMode && currentExerciseIndex < circuitExercises.length - 1 ? (
                <><span>Next Exercise</span><ArrowRight className="w-3.5 h-3.5" /></>
              ) : (
                `Save & Rest (${restDuration}s)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
