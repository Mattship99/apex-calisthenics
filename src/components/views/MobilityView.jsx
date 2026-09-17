import React from 'react';
import { HeartPulse } from 'lucide-react';
import { MOBILITY_RECOVERY_MODULE } from '../../data/constants';

export default function MobilityView() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <HeartPulse className="w-6 h-6 text-emerald-400" /> Mobility & Recovery Protocols
        </h2>
        <p className="text-sm text-slate-400 mt-2">Joint health and tissue resilience are the true limits of calisthenics progression. Incorporate these into your off-days or warm-ups.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {MOBILITY_RECOVERY_MODULE.map(mod => (
          <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-100">{mod.title}</h3>
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {mod.exercises.map((ex, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-200">{ex.name}</div>
                  <div className="text-amber-400 font-medium">Target: {ex.target}</div>
                  <div className="text-slate-500 mt-1">Focus: {ex.focus}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
