import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ExerciseFormVisualizer({ exercise, onClose }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {import React, { useState } from 'react';
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
                    {/* Map through levels 1-5 */}
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
                    {/* Map through levels 6-10 if they exist */}
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
    const timer = setInterval(() => {
      setPhase(p => (p === 0 ? 1 : 0));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const renderAnimation = () => {
    const isPhase1 = phase === 1;

    switch (exercise?.animationType) {
      case 'one_arm_pushup':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="105" cy="180" r="6" fill="#f59e0b" />
              <line x1="105" y1="180" x2={isPhase1 ? "100" : "105"} y2={isPhase1 ? "160" : "130"} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              <circle cx={isPhase1 ? "82" : "78"} cy={isPhase1 ? "148" : "112"} r="12" fill="#38bdf8" />
              <line x1={isPhase1 ? "92" : "88"} y1={isPhase1 ? "154" : "118"} x2="220" y2={isPhase1 ? "175" : "165"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <path d={isPhase1 ? "M 130 156 Q 140 148 150 162" : "M 130 120 Q 140 112 150 126"} fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
              <circle cx="215" cy="180" r="4" fill="#94a3b8" />
              <circle cx="230" cy="180" r="4" fill="#94a3b8" />
            </g>
            <text x="150" y="222" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Full Depth: Chest 1 Inch Off Floor (Square Hips)" : "▲ Single-Arm Lockout (Tuck Opposite Hand)"}
            </text>
          </svg>
        );

      case 'dragon_squat':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="200" x2="270" y2="200" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="120" cy="200" r="5" fill="#f59e0b" />
              <line x1="120" y1="200" x2="105" y2={isPhase1 ? "180" : "155"} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <line x1="105" y1={isPhase1 ? "180" : "155"} x2="135" y2={isPhase1 ? "170" : "120"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx={isPhase1 ? "130" : "135"} cy={isPhase1 ? "150" : "100"} r="12" fill="#38bdf8" />
              <line x1={isPhase1 ? "130" : "135"} y1={isPhase1 ? "170" : "125"} x2="225" y2={isPhase1 ? "165" : "140"} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <circle cx="225" cy={isPhase1 ? "165" : "140"} r="4" fill="#10b981" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Bottom Dragon Squat: Rear Leg Swept Out Sideways" : "▲ Drive Through Working Heel to Lockout"}
            </text>
          </svg>
        );

      case 'hollow_body':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="70" cy="162" r="12" fill="#38bdf8" />
              <line x1="70" y1="162" x2="35" y2={isPhase1 ? "152" : "158"} stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
              <line x1="82" y1="168" x2="160" y2="174" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="120" cy="170" r="14" fill="#f59e0b" opacity="0.5" />
              <line x1="160" y1="174" x2="245" y2={isPhase1 ? "145" : "155"} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            </g>
            <text x="150" y="220" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Peak PPT: Lower Back Pressed Flat to Floor" : "► Extended Hollow Hold Line"}
            </text>
          </svg>
        );

      case 'crow_pose':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="200" x2="270" y2="200" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="130" cy="200" r="6" fill="#f59e0b" />
              <circle cx="160" cy="200" r="6" fill="#f59e0b" />
              <line x1="130" y1="200" x2="135" y2="160" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <line x1="160" y1="200" x2="155" y2="160" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="115" cy="140" r="12" fill="#38bdf8" />
              <line x1="125" y1="145" x2="165" y2="135" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <ellipse cx="150" cy="148" rx="14" ry="10" fill="#10b981" opacity="0.8" />
              <circle cx={isPhase1 ? "185" : "180"} cy="140" r="5" fill="#10b981" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "◄ Lean Forward Past Wrists & Grip Floor" : "▲ Feet Off Ground & Knees Anchored"}
            </text>
          </svg>
        );

      case 'hs_wall':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="210" x2="270" y2="210" stroke="#475569" strokeWidth="4" />
            <line x1="200" y1="20" x2="200" y2="210" stroke="#f59e0b" strokeWidth="5" strokeDasharray="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="180" cy="210" r="6" fill="#10b981" />
              <line x1="180" y1="210" x2="185" y2="150" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="175" cy="160" r="11" fill="#38bdf8" />
              <line x1="185" y1="150" x2="195" y2="40" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="198" cy="35" r="4" fill="#f59e0b" />
            </g>
            <text x="150" y="232" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Shrug Shoulders into Ears against Wall" : "► Straight Alignment Line"}
            </text>
          </svg>
        );

      case 'hs_wall_taps':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="210" x2="270" y2="210" stroke="#475569" strokeWidth="4" />
            <line x1="210" y1="20" x2="210" y2="210" stroke="#64748b" strokeWidth="4" strokeDasharray="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="170" cy="210" r="6" fill="#10b981" />
              <line x1="170" y1="210" x2="175" y2="150" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <line x1="175" y1="150" x2="185" y2="40" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx={isPhase1 ? "180" : "210"} cy="35" r="5" fill="#f59e0b" />
              <circle cx={isPhase1 ? "210" : "180"} cy="35" r="5" fill="#10b981" />
            </g>
            <text x="150" y="232" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "◄ Fingertip Pressure Floats Feet off Wall" : "► Tap Wall Gently with Alternating Toes"}
            </text>
          </svg>
        );

      case 'hs_freestanding':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="210" x2="270" y2="210" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="130" cy="210" r="6" fill="#f59e0b" />
              <circle cx="170" cy="210" r="6" fill="#f59e0b" />
              <circle cx="130" cy="210" r={isPhase1 ? "11" : "6"} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="170" cy="210" r={isPhase1 ? "11" : "6"} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="150" y1="210" x2="150" y2="150" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              <circle cx="150" cy="165" r="12" fill="#38bdf8" />
              <line x1="150" y1="140" x2="150" y2="80" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <line x1="150" y1="80" x2={isPhase1 ? "148" : "152"} y2="25" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <circle cx={isPhase1 ? "148" : "152"} cy="20" r="4" fill="#10b981" />
            </g>
            <text x="150" y="232" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "◄ Claw Fingertips (Overbalance)" : "► Press Heel of Hand (Underbalance)"}
            </text>
          </svg>
        );

      case 'seated_pike_compression':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="190" x2="270" y2="190" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <line x1="100" y1="190" x2="100" y2="120" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="100" cy="105" r="12" fill="#38bdf8" />
              <circle cx="140" cy="190" r="5" fill="#f59e0b" />
              <line x1="100" y1="140" x2="140" y2="190" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="190" x2="220" y2={isPhase1 ? "150" : "185"} stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
              <circle cx="115" cy="180" r="10" fill="#f59e0b" opacity="0.6" />
            </g>
            <text x="150" y="222" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Peak Hip Flexor & Abs Compression Lift" : "▼ Control Heels Softly Above Floor"}
            </text>
          </svg>
        );

      case 'lsit_support':
      case 'vsit_compression':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <rect x="100" y="170" width="12" height="30" fill="#475569" rx="2" />
            <rect x="140" y="170" width="12" height="30" fill="#475569" rx="2" />
            <line x1="30" y1="200" x2="270" y2="200" stroke="#334155" strokeWidth="3" />
            <g className="transition-all duration-1000 ease-in-out">
              <line x1="126" y1="170" x2="126" y2="120" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx="126" cy="105" r="13" fill="#38bdf8" />
              <line x1="126" y1="118" x2="126" y2="160" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <line x1="126" y1="160" x2="215" y2={exercise?.animationType === 'vsit_compression' ? (isPhase1 ? "90" : "110") : (isPhase1 ? "150" : "160")} stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {exercise?.animationType === 'vsit_compression' ? "▲ V-Sit Compression: Legs Driven Past 90°" : "► Full L-Sit Parallel Leg Hold"}
            </text>
          </svg>
        );

      case 'pistol_squat':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="200" x2="270" y2="200" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="120" cy="200" r="5" fill="#f59e0b" />
              <line x1="120" y1="200" x2="110" y2={isPhase1 ? "175" : "150"} stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <line x1="110" y1={isPhase1 ? "175" : "150"} x2="130" y2={isPhase1 ? "170" : "115"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
              <circle cx={isPhase1 ? "125" : "130"} cy={isPhase1 ? "152" : "98"} r="12" fill="#38bdf8" />
              <line x1={isPhase1 ? "125" : "130"} y1={isPhase1 ? "172" : "120"} x2="210" y2={isPhase1 ? "172" : "130"} stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Bottom Pistol Squat: Full Ankle Flexion" : "▲ Top Single-Leg Lockout"}
            </text>
          </svg>
        );

      case 'muscle_up':
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="50" y1="90" x2="250" y2="90" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="130" cy="90" r="5" fill="#10b981" />
              <circle cx="170" cy="90" r="5" fill="#10b981" />
              <circle cx="150" cy={isPhase1 ? "50" : "130"} r="13" fill="#38bdf8" />
              <line x1="150" y1={isPhase1 ? "63" : "143"} x2="150" y2={isPhase1 ? "125" : "195"} stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▲ Lockout Above Bar: Lean Shoulders Forward" : "▼ Explosive Pull & Hip Transition"}
            </text>
          </svg>
        );

      case 'pushup_standard':
      case 'pushup_diamond':
      case 'pushup_pppu':
      case 'pushup_archer':
      default:
        return (
          <svg className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800" viewBox="0 0 300 240">
            <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" strokeWidth="4" />
            <g className="transition-all duration-1000 ease-in-out">
              <circle cx="100" cy="180" r="5" fill="#3b82f6" />
              <line x1="100" y1="180" x2="100" y2={isPhase1 ? "160" : "130"} stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
              <circle cx={isPhase1 ? "80" : "75"} cy={isPhase1 ? "145" : "110"} r="13" fill="#38bdf8" />
              <line x1={isPhase1 ? "90" : "85"} y1={isPhase1 ? "152" : "117"} x2="220" y2={isPhase1 ? "175" : "165"} stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" />
              <circle cx="220" cy="180" r="4" fill="#94a3b8" />
            </g>
            <text x="150" y="220" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {isPhase1 ? "▼ Full Depth: Chest 1 Inch Off Floor" : "▲ Scapular Protraction Lockout"}
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Biomechanical Visualizer
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">{exercise?.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {renderAnimation()}

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Targeted Muscle Groups:</span>
            <div className="flex flex-wrap gap-2">
              {exercise?.primaryMuscles?.map((m, i) => (
                <span key={i} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">Non-Negotiable Execution Cues</span>
            <ul className="space-y-2 text-xs text-slate-300">
              {exercise?.cues?.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-right">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
            Close Visualizer
          </button>
        </div>
      </div>
    </div>
  );
}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
