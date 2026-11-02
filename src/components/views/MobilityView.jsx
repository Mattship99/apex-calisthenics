import React, { useState } from 'react';
import { HeartPulse, CheckCircle2, Loader2, Sparkles, Dumbbell } from 'lucide-react';
import { MOBILITY_RECOVERY_MODULE } from '../../data/constants';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function MobilityView() {
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Helper utility to recursively sanitize objects/arrays for Firebase
  const sanitizeForFirebase = (data) => {
    if (data === undefined) return null;
    if (data === null || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => sanitizeForFirebase(item));
    }

    const sanitized = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      sanitized[key] = val === undefined ? null : sanitizeForFirebase(val);
    }
    return sanitized;
  };

  // Log an entire protocol module
  const handleLogMobilitySession = async (mod) => {
    if (!auth.currentUser) {
      setToastMessage('Please sign in to log sessions.');
      return;
    }

    setLoadingId(mod.id);
    setToastMessage('');

    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      const sessionRecord = sanitizeForFirebase({
        date: dateStr,
        title: `Mobility: ${mod.title}`,
        category: 'Mobility & Recovery',
        setsCount: mod.exercises.length,
        sets: mod.exercises.map(ex => ({
          id: Date.now() + Math.random(),
          trackId: 'mobility',
          exerciseName: ex.name,
          repsOrHold: ex.target || 'Completed',
          rpe: '-',
          formRating: 'Mobility',
          notes: `Focus: ${ex.focus}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        createdAt: `${dateStr}T${hours}:${mins}:${secs}.000Z`,
        serverCreatedAt: serverTimestamp()
      });

      const sessionsRef = collection(db, 'users', auth.currentUser.uid, 'sessions');
      await addDoc(sessionsRef, sessionRecord);

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

  // Log an individual exercise from a protocol
  const handleLogSingleExercise = async (mod, ex, exIdx) => {
    if (!auth.currentUser) {
      setToastMessage('Please sign in to log sessions.');
      return;
    }

    const uniqueId = `${mod.id}-${exIdx}`;
    setLoadingId(uniqueId);
    setToastMessage('');

    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      const sessionRecord = sanitizeForFirebase({
        date: dateStr,
        title: `Mobility: ${ex.name}`,
        category: 'Mobility & Recovery',
        setsCount: 1,
        sets: [{
          id: Date.now(),
          trackId: 'mobility',
          exerciseName: ex.name,
          repsOrHold: ex.target || 'Completed',
          rpe: '-',
          formRating: 'Mobility',
          notes: `Module: ${mod.title} | Focus: ${ex.focus}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }],
        createdAt: `${dateStr}T${hours}:${mins}:${secs}.000Z`,
        serverCreatedAt: serverTimestamp()
      });

      const sessionsRef = collection(db, 'users', auth.currentUser.uid, 'sessions');
      await addDoc(sessionsRef, sessionRecord);

      setLoadingId(null);
      setSuccessId(uniqueId);
      setToastMessage(`Successfully logged "${ex.name}"!`);

      setTimeout(() => {
        setSuccessId(null);
        setToastMessage('');
      }, 4000);

    } catch (error) {
      console.error('Error logging individual exercise:', error);
      setLoadingId(null);
      setToastMessage('Failed to log exercise. Please try again.');
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
          const isProtocolLogging = loadingId === mod.id;
          const isProtocolSuccess = successId === mod.id;

          return (
            <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-100">{mod.title}</h3>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  {mod.exercises.map((ex, i) => {
                    const exUniqueId = `${mod.id}-${i}`;
                    const isExLogging = loadingId === exUniqueId;
                    const isExSuccess = successId === exUniqueId;

                    return (
                      <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-3">
                        <div>
                          <div className="font-bold text-slate-200 text-sm">{ex.name}</div>
                          <div className="text-amber-400 font-medium mt-1">Target: {ex.target}</div>
                          <div className="text-slate-500 mt-0.5">Focus: {ex.focus}</div>
                        </div>

                        {/* Upgraded Explicit Log Button */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleLogSingleExercise(mod, ex, i)}
                            disabled={isExLogging || isExSuccess}
                            title={`Log ${ex.name}`}
                            className={`py-1.5 px-3 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all duration-150 ${
                              isExSuccess
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                : isExLogging
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-emerald-600/20 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 active:scale-95'
                            }`}
                          >
                            {isExLogging ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Logging...</span>
                              </>
                            ) : isExSuccess ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Logged</span>
                              </>
                            ) : (
                              <>
                                <Dumbbell className="w-3.5 h-3.5" />
                                <span>Log Exercise</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleLogMobilitySession(mod)}
                  disabled={isProtocolLogging || isProtocolSuccess}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 ${
                    isProtocolSuccess
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : isProtocolLogging
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
                  }`}
                >
                  {isProtocolLogging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Saving Protocol...</span>
                    </>
                  ) : isProtocolSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>Protocol Logged!</span>
                    </>
                  ) : (
                    <>
                      <HeartPulse className="w-4 h-4" />
                      <span>Log Whole Protocol</span>
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
