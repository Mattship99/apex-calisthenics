import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MASTER_PATHWAYS } from '../../data/constants';

export default function RoutineBuilderModal({ onClose, onSave }) {
  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState('open'); 
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [restSeconds, setRestSeconds] = useState(90);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleToggleExercise = (track, level) => {
    const exists = selectedItems.find(i => i.trackId === track.id && i.level === level.level);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => !(i.trackId === track.id && i.level === level.level)));
    } else {
      setSelectedItems([...selectedItems, { trackId: track.id, trackTitle: track.title, level: level.level, name: level.name, target: level.target, completed: false }]);
    }
  };

  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!routineName.trim() || selectedItems.length === 0) return;
    onSave({
      id: Date.now(),
      name: routineName,
      type: routineType,
      duration: routineType === 'amrap' ? durationMinutes * 60 : 0,
      restDuration: Number(restSeconds),
      items: selectedItems
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl p-6 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Template Creator</span>
            <h3 className="text-lg font-bold text-slate-100">Build Custom Workout Routine</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveRoutine} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Routine Name:</label>
            <input
              type="text"
              placeholder="e.g. Custom Conditioning Circuit"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Routine Mode / Style:</label>
              <select
                value={routineType}
                onChange={(e) => setRoutineType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="open">Standard / Open Circuit</option>
                <option value="amrap">AMRAP (Timed Countdown)</option>
                <option value="stopwatch">For Time / Stopwatch</option>
                <option value="ladder">Pyramid Ladder (1-10-1)</option>
              </select>
            </div>

            {routineType === 'amrap' ? (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">AMRAP Duration (Minutes):</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  min={1}
                  max={120}
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Default Rest Between Sets:</label>
                <select
                  value={restSeconds}
                  onChange={(e) => setRestSeconds(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                  <option value={120}>2 Minutes</option>
                  <option value={180}>3 Minutes</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select Exercises / Circuit Stations:</label>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 border border-slate-800 rounded-xl p-3 bg-slate-950/60">
              {MASTER_PATHWAYS.map(track => (
                <div key={track.id} className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{track.title}</span>
                  <div className="grid gap-1">
                    {track.levels1to5?.map(lvl => {
                      const isSelected = selectedItems.some(i => i.trackId === track.id && i.level === lvl.level);
                      return (
                        <div
                          key={`l1-${lvl.level}`}
                          onClick={() => handleToggleExercise(track, lvl)}
                          className={`text-xs p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>Lvl {lvl.level}: {lvl.name}</span>
                          <span className="text-[10px] text-slate-400">{lvl.target}</span>
                        </div>
                      );
                    })}
                    {track.levels6to10?.map(lvl => {
                      const isSelected = selectedItems.some(i => i.trackId === track.id && i.level === lvl.level);
                      return (
                        <div
                          key={`l6-${lvl.level}`}
                          onClick={() => handleToggleExercise(track, lvl)}
                          className={`text-xs p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>Lvl {lvl.level}: {lvl.name}</span>
                          <span className="text-[10px] text-slate-400">{lvl.target}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
              disabled={selectedItems.length === 0 || !routineName.trim()}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition shadow-lg ${
                selectedItems.length > 0 && routineName.trim()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Save Routine ({selectedItems.length} stations)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
