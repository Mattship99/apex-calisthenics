import React, { useState } from 'react';
import { HeartPulse, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { MOBILITY_RECOVERY_MODULE } from '../../data/constants';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function MobilityView() {
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleLogMobilitySession = async (mod) => {
    setLoadingId(mod.id);
    setToastMessage('');

    try {
      const sessionRecord = {
        userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        category: 'Mobility & Recovery',
        title: mod.title,
        exercises: mod.exercises.map(ex => ({
          name: ex.name,
          target: ex.target,
          focus: ex.focus,
          completed: true
        })),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'workoutHistory'), sessionRecord);

      setLoadingId(null);
      setSuccessId(mod.id);
      setToastMessage(`Successfully logged "${mod.title}" to workout history!`);

      setTimeout(() => {
        setSuccessId(null);
        setToastMessage('');
      }, 4000);

    } catch (error) {
      console.error('Error logging mobility session:', error);
      setLoadingId(null);
      setToastMessage('Failed to log session. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <HeartPulse className="w-6 h-6 text-emerald-400" /> Mobility & Recovery Protocols
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Joint health and tissue resilience are the true limits of calisthenics progression. Incorporate these into your off-days or warm-ups and log your sessions to track consistency.
        </p>

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border animate-fadeIn ${
            successId ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300' : 'bg-red-950/50 border-red-800/60 text-red-300'
          }`}>
            {successId ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Sparkles className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Modules Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {MOBILITY_RECOVERY_MODULE.map(mod => {
          const isLogging = loadingId === mod.id;
          const isSuccess = successId === mod.id;

          return (
            <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-100">{mod.title}</h3>
                </div>

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

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleLogMobilitySession(mod)}
                  disabled={isLogging || isSuccess}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSuccess
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : isLogging
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
                  }`}
                >
                  {isLogging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Saving to History...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>Logged Successfully!</span>
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4 h-4" />
                      <span>Log {mod.title}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
