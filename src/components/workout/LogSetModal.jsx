import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

export default function LogSetModal({ levelData, trackId, restDuration, initialSetData, onClose, onSave, onStartTimer }) {
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [reps, setReps] = useState(initialSetData ? initialSetData.repsOrHold : (levelData?.type === 'hold' ? '30s' : '8'));
  const [rpe, setRpe] = useState(initialSetData ? initialSetData.rpe : '8');
  const [formQuality, setFormQuality] = useState(initialSetData ? initialSetData.formRating : 'Clean');
  const [setNote, setSetNote] = useState(initialSetData ? (initialSetData.notes || '') : '');
  const [workoutDate, setWorkoutDate] = useState(
    initialSetData?.date || initialSetData?.timestamp?.split('T')[0] || getTodayDateString()
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialSetData ? initialSetData.id : Date.now(),
      trackId: trackId || (initialSetData ? initialSetData.trackId : ''),
      exerciseName: levelData?.name || initialSetData?.exerciseName || 'Custom Exercise',
      repsOrHold: reps,
      rpe,
      formRating: formQuality,
      notes: setNote,
      date: workoutDate,
      timestamp: initialSetData ? initialSetData.timestamp : new Date().toISOString()
    });
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
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{initialSetData ? 'Edit Set' : 'Log Set & Start Rest'}</span>
            <h3 className="text-base font-bold text-slate-100">{levelData?.name || initialSetData?.exerciseName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Workout Date:</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Actual Reps / Hold:</label>
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
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              {initialSetData ? 'Update Set' : `Save & Rest (${restDuration}s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
