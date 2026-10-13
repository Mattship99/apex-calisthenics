import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, RotateCcw, Play, Square, Timer, Dumbbell } from 'lucide-react';

export default function LogSetModal({ 
  levelData, 
  trackId, 
  restDuration, 
  initialSetData, 
  onClose, 
  onSave, 
  onStartTimer,
  circuitExercises = [],
  circuitRound = 1,      
  onNextCircuitExercise  
}) {
  const isCircuitMode = circuitExercises.length > 0;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const activeExercise = isCircuitMode ? circuitExercises[currentExerciseIndex] : levelData;

  const [mode, setMode] = useState('reps');
  const [reps, setReps] = useState(
    initialSetData 
      ? initialSetData.repsOrHold 
      : (activeExercise?.targetReps || activeExercise?.repsOrHold || (activeExercise?.type === 'hold' ? '30s' : '8'))
  );
  const [rpe, setRpe] = useState(initialSetData ? initialSetData.rpe : '8');
  const [formQuality, setFormQuality] = useState(initialSetData ? initialSetData.formRating : 'Clean');
  const [setNote, setSetNote] = useState(initialSetData ? (initialSetData.notes || '') : '');

  // Stopwatch state
  const [timerState, setTimerState] = useState('idle'); // idle, countdown, running, stopped
  const [countdown, setCountdown] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0); // Tracks milliseconds
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const startTimeRef = useRef(null); // Used to calculate precise time against Date.now()

  useEffect(() => {
    if (activeExercise?.isIsometric || activeExercise?.type === 'hold') {
      setMode('stopwatch');
    } else {
      setMode('reps');
    }
    
    if (isCircuitMode && activeExercise && !initialSetData) {
      setReps(activeExercise.targetReps || activeExercise.repsOrHold || (activeExercise?.type === 'hold' ? '30s' : '8'));
    }
    
    // Reset timer states on new exercise
    setTimerState('idle');
    setCountdown(5);
    setElapsedTime(0);
    startTimeRef.current = null;
  }, [currentExerciseIndex, isCircuitMode, activeExercise, initialSetData]);

  // Stopwatch interval logic
  useEffect(() => {
    if (timerState === 'countdown') {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            startTimeRef.current = Date.now();
            setTimerState('running');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerState === 'running') {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  const handleStartTimer = () => {
    setTimerState('countdown');
    setCountdown(5);
    setElapsedTime(0);
    startTimeRef.current = null;
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const hundredths = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${hundredths}`;
  };

  const handleStopTimer = () => {
    setTimerState('stopped');
    clearInterval(timerRef.current);
    setReps(formatTime(elapsedTime));
  };

  const handleResetTimer = () => {
    setTimerState('idle');
    setElapsedTime(0);
    setCountdown(5);
    startTimeRef.current = null;
    setReps(activeExercise?.targetReps || '30s');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If stopwatch is currently running, stop it and log the current time
    let finalReps = reps;
    if (mode === 'stopwatch' && timerState === 'running') {
      handleStopTimer();
      finalReps = formatTime(elapsedTime);
    }

    const savedData = {
      id: initialSetData ? initialSetData.id : Date.now(),
      trackId: trackId || (initialSetData ? initialSetData.trackId : ''),
      exerciseName: activeExercise?.name || initialSetData?.exerciseName || 'Custom Exercise',
      repsOrHold: finalReps,
      rpe,
      formRating: formQuality,
      notes: setNote,
      round: isCircuitMode ? circuitRound : undefined,
      timestamp: initialSetData ? initialSetData.timestamp : new Date().toISOString()
    };

    onSave(savedData);

    if (isCircuitMode && !initialSetData && currentExerciseIndex < circuitExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      if (onStartTimer && restDuration) {
        onStartTimer(restDuration);
      }
      return; 
    }

    if (!initialSetData && onStartTimer) {
      onStartTimer(restDuration);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
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

        {/* Mode Toggle */}
        <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
          <button 
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'reps' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setMode('reps')}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Rep Mode
          </button>
          <button 
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'stopwatch' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            onClick={() => setMode('stopwatch')}
          >
            <Timer className="w-3.5 h-3.5" />
            Stopwatch
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dynamic Input Area */}
          {mode === 'reps' ? (
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
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="flex justify-between items-center w-full mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interval Timer</span>
                {activeExercise?.targetReps && (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Target: {activeExercise.targetReps}
                  </span>
                )}
              </div>
              
              <div className="h-20 flex items-center justify-center">
                {timerState === 'countdown' ? (
                  <div className="text-6xl font-bold text-emerald-400 animate-pulse drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                    {countdown}
                  </div>
                ) : (
                  <div className={`text-5xl font-mono font-bold tracking-tight ${timerState === 'stopped' ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {formatTime(elapsedTime)}
                  </div>
                )}
              </div>

              <div className="mt-4 w-full flex gap-2">
                {timerState === 'idle' && (
                  <button 
                    type="button" 
                    onClick={handleStartTimer}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-950" /> Start Hold
                  </button>
                )}
                
                {timerState === 'countdown' && (
                  <div className="flex-1 py-2.5 bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center border border-emerald-500/30">
                    Get Ready...
                  </div>
                )}
                
                {timerState === 'running' && (
                  <button 
                    type="button" 
                    onClick={handleStopTimer}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                  >
                    <Square className="w-4 h-4 fill-slate-950" /> Stop Timer
                  </button>
                )}
                
                {timerState === 'stopped' && (
                  <button 
                    type="button" 
                    onClick={handleResetTimer}
                    className="w-12 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 flex items-center justify-center shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                
                {timerState === 'stopped' && (
                  <div className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center border border-slate-700">
                    Logged: {formatTime(elapsedTime)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RPE Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">RPE / Effort (1-10):</label>
            <select
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>RPE {n} {n >= 9 ? '(Max Effort)' : n >= 7 ? '(Hard)' : '(Moderate)'}</option>
              ))}
            </select>
          </div>

          {/* Form Quality */}
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
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Set Notes (Optional):</label>
            <input
              type="text"
              placeholder="e.g. narrow grip felt stronger..."
              value={setNote}
              onChange={(e) => setSetNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
            />
          </div>

          {/* Actions */}
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
              className={`flex-1 py-2.5 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg ${
                mode === 'stopwatch' && timerState === 'running' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                  : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
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
