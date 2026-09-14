import React from 'react';
import { Layers, Plus, Play, Trash2, ChevronDown } from 'lucide-react';

export default function RoutinesView({
  routines,
  expandedRoutine,
  setExpandedRoutine,
  startRoutineSession,
  deleteRoutine,
  setIsBuildingRoutine
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Custom Workout Routines
          </h2>
          <p className="text-sm text-slate-400 mt-1">Pre-build your training split days (Push, Pull, Core, etc.) and rest durations. Saved directly to cloud storage.</p>
        </div>
        <button
          onClick={() => setIsBuildingRoutine(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create New Routine
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {routines.map((routine) => {
          const isExpanded = expandedRoutine === routine.id;

          return (
            <div key={routine.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div 
                onClick={() => setExpandedRoutine(isExpanded ? null : routine.id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{routine.name}</h3>
                  <span className="text-xs text-slate-400 font-medium">Rest interval: {routine.restDuration}s | {(routine.type || 'open').toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); startRoutineSession(routine); }}
                    className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-bold transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start
                  </button>
                  
                  {typeof routine.id === 'number' && routine.id > 1000000 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRoutine(routine.id); }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                      title="Delete Routine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/50 bg-slate-900/40">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 mt-2">Planned Exercises:</span>
                  <div className="space-y-1.5">
                    {(routine.items || []).map((item, idx) => (
                      <div key={idx} className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="font-bold text-slate-200">{item.name}</span>
                        <span className="text-amber-400 font-medium">{item.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
