import React, { useState } from 'react';
import { X, Unlock } from 'lucide-react';

export default function UnlockConfirmModal({ trackTitle, onConfirm, onClose }) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Unlock className="w-4 h-4 text-amber-400" /> Unlock Phase 2?
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        {step === 1 ? (
          <>
            <p className="text-xs text-slate-300">
              Phase 2 for <strong>{trackTitle}</strong> is locked until Level 5 is mastered. Are you sure you're able to complete the previous foundation levels cleanly?
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-700">Nevermind</button>
              <button onClick={() => setStep(2)} className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition">Yes, I'm Ready</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              🚨 <em>Hold up!</em> Are your joints truly forged in iron, or are you just eager to skip ahead and cry under a heavy barbell? No shame if so, but double check!
            </p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-700">Go Back</button>
              <button onClick={onConfirm} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition">I Accept the Risk, Unlock!</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
