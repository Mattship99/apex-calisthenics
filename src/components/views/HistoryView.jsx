import React from 'react';
import { BarChart3, Cloud, Trash2, ChevronDown } from 'lucide-react';

export default function HistoryView({
  workoutHistory,
  expandedHistoryLogs,
  toggleHistorySessionDetails,
  deleteHistorySession
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Training History
          </h2>
          <p className="text-sm text-slate-400 mt-1">Review consistent progression over time.</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold">
          <Cloud className="w-4 h-4" />
          <span>Auto-Saved</span>
        </div>
      </div>

      {workoutHistory.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">No saved sessions found yet.</p>
          <p className="text-xs text-slate-500 mt-1">Complete your first workout in the "Active Workout" tab to save it here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutHistory.map((session) => {
            const isExpanded = expandedHistoryLogs[session.id];
            
            const sessionSummary = (session.sets || []).reduce((acc, s) => {
              if (s && s.exerciseName) {
                acc[s.exerciseName] = (acc[s.exerciseName] || 0) + 1;
              }
              return acc;
            }, {});

            return (
              <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition overflow-hidden shadow-lg">
                <div className="p-5 border-b border-slate-800 pb-4 bg-slate-900/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-100">{session.title}</h3>
                      <span className="text-xs text-slate-400">{session.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                        {session.roundsCompleted > 0 ? `${session.roundsCompleted} Rounds | ` : ''}{session.setsCount || 0} Sets Total
                      </span>
                      <button
                        onClick={() => deleteHistorySession(session.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition bg-slate-950 rounded-lg border border-slate-800"
                        title="Delete Entire Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {sessionSummary && Object.keys(sessionSummary).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(sessionSummary).map(([exName, count]) => (
                        <span key={exName} className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-md">
                          {count}x {exName}
                        </span>
                      ))}
                    </div>
                  )}

                  {session.notes && (
                    <p className="text-xs text-slate-400 mb-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 italic">
                      "{session.notes}"
                    </p>
                  )}

                  <button 
                    onClick={() => toggleHistorySessionDetails(session.id)}
                    className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition mt-1"
                  >
                    {isExpanded ? 'Hide Full Set Log' : 'View Detailed Set Log'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isExpanded && session.sets && (
                  <div className="p-5 bg-slate-900/40 space-y-2 max-h-96 overflow-y-auto">
                    {session.sets.map((s, idx) => (
                      <div key={idx} className="text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-slate-200">{s.exerciseName}</span>
                        <div className="flex gap-4">
                          <span className="text-emerald-400 font-bold w-16 text-right">{s.repsOrHold}</span>
                          <span className="text-amber-400 w-12 text-right">RPE {s.rpe}</span>
                          <span className="text-slate-400 w-16 text-right">{s.formRating}</span>
                        </div>
                        {s.notes && <span className="text-amber-300 italic sm:ml-2">"{s.notes}"</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
