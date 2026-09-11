import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Dumbbell, 
  Trophy, 
  Timer as TimerIcon, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Flame, 
  Target, 
  ShieldAlert, 
  Award, 
  Zap, 
  BarChart3, 
  Activity, 
  Check, 
  Cloud, 
  Eye, 
  X, 
  Sparkles, 
  MessageSquare, 
  Layers, 
  CheckSquare, 
  ChevronUp, 
  ChevronDown, 
  Edit3,
  LogIn,
  LogOut,
  User as UserIcon,
  Mail,
  Lock,
  AlertCircle,
  Search,
  HeartPulse,
  Send,
  Lock as LockIcon,
  Unlock
} from 'lucide-react';

// IMPORTING YOUR DATA ARRAYS FROM YOUR NEW FILE
import { 
  MASTER_PATHWAYS, 
  MOBILITY_RECOVERY_MODULE, 
  DEFAULT_CIRCUITS, 
  LADDER_RUNGS 
} from './data/constants';

const firebaseConfig = {
  apiKey: "AIzaSyANdR3YT6_4QN8U6pDfi6NSKUEqQ23dyho",
  authDomain: "apex-calisthenics-2996c.firebaseapp.com",
  projectId: "apex-calisthenics-2996c",
  storageBucket: "apex-calisthenics-2996c.firebasestorage.app",
  messagingSenderId: "688212368969",
  appId: "1:688212368969:web:165a0e7082d6a2a487e998",
  measurementId: "G-5FHHDQ0JGR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


function UnlockConfirmModal({ trackTitle, onConfirm, onClose }) {
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

function AuthModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setAuthMessage('Password reset link sent! Check your email inbox.');
      } else if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (username.trim()) {
          await updateProfile(userCredential.user, {
            displayName: username.trim()
          });
        }
        onClose();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Account Portal</span>
            <h3 className="text-base font-bold text-slate-100">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create New Account' : 'Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {authMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{authMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && !isForgotPassword && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Username (e.g. Matt)</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Matt"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                  minLength={6}
                />
              </div>
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setAuthError(''); setAuthMessage(''); }}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 transition"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {!isForgotPassword && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-bold">Or</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <div className="text-center pt-2 space-y-1">
          {isForgotPassword ? (
            <button
              onClick={() => { setIsForgotPassword(false); setAuthError(''); setAuthMessage(''); }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition block w-full"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthMessage(''); }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition block w-full"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountSettingsModal({ user, onClose }) {
  const [username, setUsername] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (username !== user.displayName) {
        await updateProfile(user, { displayName: username });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (newPassword.trim().length > 0) {
        await updatePassword(user, newPassword);
      }
      setMessage('Account updated successfully!');
      setNewPassword('');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Profile Management</span>
            <h3 className="text-base font-bold text-slate-100">Edit Account Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
              placeholder="Matt"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">New Password (Optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function LogSetModal({ levelData, trackId, restDuration, initialSetData, onClose, onSave, onStartTimer }) {
  const [reps, setReps] = useState(initialSetData ? initialSetData.repsOrHold : (levelData?.type === 'hold' ? '30s' : '8'));
  const [rpe, setRpe] = useState(initialSetData ? initialSetData.rpe : '8');
  const [formQuality, setFormQuality] = useState(initialSetData ? initialSetData.formRating : 'Clean');
  const [setNote, setSetNote] = useState(initialSetData ? (initialSetData.notes || '') : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialSetData ? initialSetData.id : Date.now(),
      trackId: trackId || (initialSetData ? initialSetData.trackId : ''),
      exerciseName: levelData ? levelData.name : initialSetData.exerciseName,
      repsOrHold: reps,
      rpe,
      formRating: formQuality,
      notes: setNote,
      timestamp: initialSetData ? initialSetData.timestamp : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
            <h3 className="text-base font-bold text-slate-100">{levelData ? levelData.name : initialSetData?.exerciseName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

function ExerciseFormVisualizer({ exercise, onClose }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(p => (p === 0 ? 1 : 0));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const renderAnimation = () => {
    const isPhase1 = phase === 1;

    switch (exercise.animationType) {
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
              <line x1="126" y1="160" x2="215" y2={exercise.animationType === 'vsit_compression' ? (isPhase1 ? "90" : "110") : (isPhase1 ? "150" : "160")} stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
            </g>
            <text x="150" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
              {exercise.animationType === 'vsit_compression' ? "▲ V-Sit Compression: Legs Driven Past 90°" : "► Full L-Sit Parallel Leg Hold"}
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
            <h3 className="text-lg font-bold text-slate-100 mt-1">{exercise.name}</h3>
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
              {exercise.primaryMuscles?.map((m, i) => (
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
              {exercise.cues?.map((cue, idx) => (
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
}

function RoutineBuilderModal({ onClose, onSave }) {
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
                    {track.levels1to5.map(lvl => {
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

export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [expandedPathway, setExpandedPathway] = useState(null);
  const [expandedRoutine, setExpandedRoutine] = useState(null);
  
  const [expandedActiveLogs, setExpandedActiveLogs] = useState({});
  const [expandedHistoryLogs, setExpandedHistoryLogs] = useState({});

  const [userLevels, setUserLevels] = useState({
    'inversion-master': 1,
    'dragon-flag': 1,
    'one_arm_pushup': 1,
    'pulling': 2,
    'pushing': 2,
    'dragon_squat': 1,
    'pistol_squat': 1,
    'muscle_up': 1,
    'lsit_core': 1
  });

  const [unlockedPhases, setUnlockedPhases] = useState({});
  const [pendingUnlockTrack, setPendingUnlockTrack] = useState(null);

  const [activeWorkout, setActiveWorkout] = useState({
    date: new Date().toISOString().split('T')[0],
    title: 'Calisthenics Progression Session',
    sets: [],
    restDuration: 90
  });
  const [sessionNotes, setSessionNotes] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedExerciseDemo, setSelectedExerciseDemo] = useState(null);
  const [loggingExercise, setLoggingExercise] = useState(null);
  const [editingSet, setEditingSet] = useState(null);

  const [routines, setRoutines] = useState(DEFAULT_CIRCUITS);

  const [isBuildingRoutine, setIsBuildingRoutine] = useState(false);
  const [pathwaySearch, setPathwaySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePhaseTab, setActivePhaseTab] = useState('1-5');

  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerInitial, setTimerInitial] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const audioCtxRef = useRef(null);

  const [activeCircuit, setActiveCircuit] = useState(null);
  const [roundTally, setRoundTally] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else signInAnonymously(auth).catch(() => {});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setWorkoutHistory(docs);
    });

    const levelsDocRef = doc(db, 'users', user.uid, 'settings', 'userLevels');
    const unsubscribeLevels = onSnapshot(levelsDocRef, (docSnap) => {
      if (docSnap.exists()) setUserLevels(prev => ({ ...prev, ...docSnap.data() }));
    });

    const phasesDocRef = doc(db, 'users', user.uid, 'settings', 'unlockedPhases');
    const unsubscribePhases = onSnapshot(phasesDocRef, (docSnap) => {
      if (docSnap.exists()) setUnlockedPhases(prev => ({ ...prev, ...docSnap.data() }));
    });

    const routinesDocRef = doc(db, 'users', user.uid, 'settings', 'customRoutines');
    const unsubscribeRoutines = onSnapshot(routinesDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().routines) {
        const cloudRoutines = docSnap.data().routines;
        const customOnly = cloudRoutines.filter(r => typeof r.id === 'number' && r.id > 1000000);
        setRoutines([...DEFAULT_CIRCUITS, ...customOnly]);
      } else {
        setRoutines(DEFAULT_CIRCUITS);
      }
    });

    const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
    const unsubscribeActiveWorkout = onSnapshot(activeWorkoutDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().session) {
        setActiveWorkout(docSnap.data().session);
      }
    });

    return () => {
      unsubscribeSessions();
      unsubscribeLevels();
      unsubscribePhases();
      unsubscribeRoutines();
      unsubscribeActiveWorkout();
    };
  }, [user]);

  const updateActiveWorkoutInCloud = async (newWorkoutState) => {
    setActiveWorkout(newWorkoutState);
    if (user) {
      try {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        await setDoc(activeWorkoutDocRef, { session: newWorkoutState }, { merge: true });
      } catch (err) {
        console.error("Failed to sync active workout state:", err);
      }
    }
  };

  const saveRoutinesToFirebase = async (newRoutines) => {
    setRoutines(newRoutines);
    if (user) {
      try {
        const routinesDocRef = doc(db, 'users', user.uid, 'settings', 'customRoutines');
        const customOnly = newRoutines.filter(r => typeof r.id === 'number' && r.id > 1000000);
        await setDoc(routinesDocRef, { routines: customOnly }, { merge: true });
      } catch (err) {
        console.error("Failed to sync routines:", err);
      }
    }
  };

  const deleteRoutine = (routineId) => {
    const updated = routines.filter(r => r.id !== routineId);
    saveRoutinesToFirebase(updated);
  };

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio playback prevented');
    }
  };

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(sec => {
          if (activeCircuit?.type === 'amrap') {
            if (sec <= 1) {
              setTimerActive(false);
              playBeep();
              return 0;
            }
            return sec - 1;
          } else if (activeCircuit?.type === 'stopwatch' || activeCircuit?.type === 'ladder') {
            return sec + 1;
          } else {
            if (sec <= 1) {
              setTimerActive(false);
              playBeep();
              return 0;
            }
            return sec - 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, activeCircuit]);

  const startTimer = (seconds) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
    updateActiveWorkoutInCloud({ ...activeWorkout, restDuration: seconds });
  };

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(timerInitial);
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const updateLevel = async (trackId, newLevel, has10Levels) => {
    if (has10Levels && newLevel > 5 && !unlockedPhases[trackId]) {
      const track = MASTER_PATHWAYS.find(t => t.id === trackId);
      setPendingUnlockTrack(track);
      return;
    }
    const updated = { ...userLevels, [trackId]: Math.max(1, Math.min(10, newLevel)) };
    setUserLevels(updated);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'userLevels'), updated, { merge: true });
    }
  };

  const handleConfirmUnlock = async () => {
    if (!pendingUnlockTrack) return;
    const trackId = pendingUnlockTrack.id;
    const updatedPhases = { ...unlockedPhases, [trackId]: true };
    setUnlockedPhases(updatedPhases);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'unlockedPhases'), updatedPhases, { merge: true });
    }
    setPendingUnlockTrack(null);
    updateLevel(trackId, 6, true);
  };

  const adjustPlannedItemLevel = (itemIndex, direction) => {
    if (!activeWorkout.plannedItems) return;
    const items = [...activeWorkout.plannedItems];
    const currentItem = items[itemIndex];
    const track = MASTER_PATHWAYS.find(t => t.id === currentItem.trackId);
    if (!track) return;

    let maxLevel = track.levels6to10 ? 10 : 5;
    const newLevelNum = Math.max(1, Math.min(maxLevel, currentItem.level + direction));
    
    const newLevelData = track.levels1to5.find(l => l.level === newLevelNum) || 
                         track.levels6to10?.find(l => l.level === newLevelNum);
                         
    if (!newLevelData) return;

    items[itemIndex] = {
      ...currentItem,
      level: newLevelData.level,
      name: newLevelData.name,
      target: newLevelData.target
    };

    updateActiveWorkoutInCloud({ ...activeWorkout, plannedItems: items });
  };

  const handleSaveSet = (newSet) => {
    setActiveWorkout(prev => {
      const existingIndex = prev.sets.findIndex(s => s.id === newSet.id);
      let updatedSets;
      if (existingIndex >= 0) {
        updatedSets = [...prev.sets];
        updatedSets[existingIndex] = newSet;
      } else {
        updatedSets = [...prev.sets, newSet];
      }

      let updatedPlannedItems = prev.plannedItems;
      if (updatedPlannedItems && updatedPlannedItems.length > 0) {
        const matchIndex = updatedPlannedItems.findIndex(item => item.name === newSet.exerciseName);
        if (matchIndex >= 0) {
          updatedPlannedItems = updatedPlannedItems.filter((_, idx) => idx !== matchIndex);
        }
      }

      const nextState = {
        ...prev,
        sets: updatedSets,
        plannedItems: updatedPlannedItems && updatedPlannedItems.length > 0 ? updatedPlannedItems : null
      };

      if (user) {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        setDoc(activeWorkoutDocRef, { session: nextState }, { merge: true }).catch(err => console.error("Cloud sync err:", err));
      }
      
      setExpandedActiveLogs(current => ({ ...current, [newSet.exerciseName]: true }));

      return nextState;
    });
  };

  const removeSet = (setId) => {
    setActiveWorkout(prev => {
      const updatedSets = prev.sets.filter(s => s.id !== setId);
      const nextState = { ...prev, sets: updatedSets };
      if (user) {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        setDoc(activeWorkoutDocRef, { session: nextState }, { merge: true }).catch(err => console.error("Cloud sync err:", err));
      }
      return nextState;
    });
  };

  const clearRoutineChecklist = () => {
    updateActiveWorkoutInCloud({ ...activeWorkout, plannedItems: null });
  };

  const logCircuitRound = (currentRoundIndex) => {
    if (!activeCircuit) return;

    const isLadder = activeCircuit.type === 'ladder';
    const currentRungReps = isLadder ? LADDER_RUNGS[Math.min(currentRoundIndex, LADDER_RUNGS.length - 1)] : null;

    const newSets = activeCircuit.items.map((item, idx) => {
      const displayTarget = isLadder ? `${currentRungReps} Reps` : (item.target || 'Completed');
      return {
        id: Date.now() + Math.floor(Math.random() * 1000) + idx, 
        trackId: 'circuit_custom', 
        exerciseName: item.name,
        repsOrHold: displayTarget,
        rpe: '-',
        formRating: 'Circuit',
        notes: `Round ${currentRoundIndex + 1}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    setActiveWorkout(prev => {
      const nextState = {
        ...prev,
        sets: [...prev.sets, ...newSets]
      };
      if (user) {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        setDoc(activeWorkoutDocRef, { session: nextState }, { merge: true }).catch(err => console.error("Cloud sync err:", err));
      }
      return nextState;
    });
  };

  const handleToggleCircuitItem = (index) => {
    if (!activeCircuit) return;
    const updatedItems = [...activeCircuit.items];
    updatedItems[index].completed = !updatedItems[index].completed;

    const allCompleted = updatedItems.every(item => item.completed);
    if (allCompleted) {
      logCircuitRound(roundTally);
      setRoundTally(prev => prev + 1);
      updatedItems.forEach(item => item.completed = false);
    }

    setActiveCircuit({ ...activeCircuit, items: updatedItems });
  };

  const handleCompleteRoundFastForward = () => {
    if (!activeCircuit) return;
    logCircuitRound(roundTally);
    setRoundTally(prev => prev + 1);
    const resetItems = activeCircuit.items.map(item => ({ ...item, completed: false }));
    setActiveCircuit({ ...activeCircuit, items: resetItems });
  };

  const startRoutineSession = (routine) => {
    const isCircuit = routine.type === 'amrap' || routine.type === 'stopwatch' || routine.type === 'open' || routine.type === 'ladder';
    if (isCircuit) {
      setActiveCircuit({
        ...routine,
        items: routine.items.map(i => ({ ...i, completed: false }))
      });
      setRoundTally(0);
    } else {
      setActiveCircuit(null);
    }

    const sessionState = {
      date: new Date().toISOString().split('T')[0],
      title: routine.name,
      sets: activeWorkout.sets,
      plannedItems: !isCircuit ? routine.items : null,
      restDuration: routine.restDuration
    };
    updateActiveWorkoutInCloud(sessionState);

    if (routine.type === 'amrap') {
      setTimerInitial(routine.duration);
      setTimerSeconds(routine.duration);
      setTimerActive(true);
    } else if (routine.type === 'stopwatch' || routine.type === 'ladder') {
      setTimerInitial(0);
      setTimerSeconds(0);
      setTimerActive(true);
    } else {
      setTimerInitial(routine.restDuration);
      setTimerSeconds(routine.restDuration);
      setTimerActive(false);
    }

    setActiveTab('workout');
  };

  const finishWorkout = async () => {
    if (activeWorkout.sets.length === 0 && roundTally === 0) return;

    const completedSession = {
      date: activeWorkout.date,
      title: activeWorkout.title,
      setsCount: activeWorkout.sets.length,
      roundsCompleted: roundTally,
      sets: activeWorkout.sets,
      notes: sessionNotes || '',
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        await addDoc(sessionsRef, completedSession);
      } catch (err) {
        console.error("Save error:", err);
      }
    }

    updateActiveWorkoutInCloud({
      date: new Date().toISOString().split('T')[0],
      title: 'Calisthenics Progression Session',
      sets: [],
      restDuration: 90,
      plannedItems: null
    });
    
    setActiveCircuit(null);
    setRoundTally(0);
    setSessionNotes('');
    setActiveTab('history');
  };

  const deleteHistorySession = async (sessionId) => {
    if (user) {
      try {
        const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionId);
        await deleteDoc(sessionDocRef);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleSendSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    await addDoc(collection(db, 'suggestions'), {
      text: suggestionText.trim(),
      user: user ? (user.displayName || user.email || 'Anonymous') : 'Anonymous',
      createdAt: new Date().toISOString()
    });
    setSuggestionSubmitted(true);
    setSuggestionText('');
    setTimeout(() => setSuggestionSubmitted(false), 4000);
  };

  const filteredPathways = MASTER_PATHWAYS.filter(t => {
    const matchesCat = selectedFilter === 'All' || t.category === selectedFilter;
    const matchesSearch = !pathwaySearch.trim() || t.title.toLowerCase().includes(pathwaySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const groupedSets = activeWorkout.sets.reduce((acc, set) => {
    if (!acc[set.exerciseName]) {
      acc[set.exerciseName] = {
        trackId: set.trackId,
        exerciseName: set.exerciseName,
        sets: []
      };
    }
    acc[set.exerciseName].sets.push(set);
    return acc;
  }, {});

  const toggleActiveLogGroup = (name) => {
    setExpandedActiveLogs(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleHistorySessionDetails = (id) => {
    setExpandedHistoryLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Apex Calisthenics
              </h1>
              <p className="text-xs text-slate-400 font-medium">Interactive Progression Framework</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('workout')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span>Session: <strong className="text-emerald-400">{activeWorkout.sets.length}</strong></span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                  title="Open Account Settings"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-bold max-w-[140px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Matt'}
                  </span>
                </button>

                <button
                  onClick={async () => {
                    await signOut(auth);
                    window.location.reload(); 
                  }}
                  className="p-1 hover:text-rose-400 text-slate-400 ml-1 transition border-l border-slate-700 pl-2"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition shadow-md shadow-emerald-500/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4">
        <div className="max-w-5xl mx-auto flex overflow-x-auto space-x-1 scrollbar-none py-2">
          {[
            { id: 'roadmap', label: 'Skill Pathways', icon: Target },
            { id: 'mobility', label: 'Mobility & Recovery', icon: HeartPulse },
            { id: 'routines', label: 'Routines', icon: Layers },
            { id: 'workout', label: 'Active Workout', icon: Activity },
            { id: 'history', label: 'Log History', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* --- TAB 1: ROADMAP & SKILL PATHWAYS --- */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Interactive Progression Framework
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Filter by category or search skills to quickly find what you're working on.
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search skills or drills..."
                    value={pathwaySearch}
                    onChange={(e) => setPathwaySearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  {pathwaySearch && (
                    <button onClick={() => setPathwaySearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {['All', 'Beginner', 'Intermediate', 'Advanced', 'Elite', 'Unilateral', 'Legs', 'Pulling', 'Pushing', 'Balance', 'Core'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredPathways.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium text-sm">No skill tracks matched your search.</p>
                <button
                  onClick={() => { setPathwaySearch(''); setSelectedCategory('All'); }}
                  className="mt-3 text-xs font-bold text-emerald-400 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredPathways.map((track) => {
                const currentLevel = userLevels[track.id] || 1;
                const isExpanded = expandedPathway === track.id;
                
                const has10Levels = track.levels6to10 && track.levels6to10.length > 0;
                const isPhase2Unlocked = !has10Levels || unlockedPhases[track.id] || currentLevel > 5;
                const activeList = has10Levels && activePhaseTab === '6-10' ? track.levels6to10 : track.levels1to5;
                
                const activeLevelData = track.levels1to5.find(l => l.level === currentLevel) || 
                                        track.levels6to10?.find(l => l.level === currentLevel) || 
                                        track.levels1to5[0];

                return (
                  <div key={track.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => setExpandedPathway(isExpanded ? null : track.id)}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 cursor-pointer hover:bg-slate-800/50 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                            {track.badge}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Level {currentLevel} of {has10Levels ? 10 : 5}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-100 mt-2">{track.title}</h3>
                        {!isExpanded && <p className="text-sm text-slate-400 mt-1 truncate max-w-lg">{track.description}</p>}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs font-semibold text-slate-400 px-2 hidden md:inline">Set Level:</span>
                          {activeList.map((lvl) => {
                            const isLocked = has10Levels && lvl.level > 5 && !isPhase2Unlocked;
                            return (
                              <button
                                key={lvl.level}
                                onClick={() => {
                                  if (!isLocked) updateLevel(track.id, lvl.level, has10Levels);
                                  else setPendingUnlockTrack(track);
                                }}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                  userLevels[track.id] === lvl.level
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                                    : isLocked 
                                    ? 'bg-slate-950/50 text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {isLocked ? <LockIcon className="w-3 h-3" /> : lvl.level}
                              </button>
                            );
                          })}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Collapsible Content Body */}
                    {isExpanded && (
                      <div className="p-6 bg-slate-900/40 border-t border-slate-800/50">
                        <p className="text-sm text-slate-400 mb-6">{track.description}</p>

                        {has10Levels && (
                          <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4">
                            <button 
                              onClick={() => setActivePhaseTab('1-5')} 
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activePhaseTab === '1-5' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                            >
                              {track.levels1to5Title || 'Phase 1 (1-5)'}
                            </button>
                            <button 
                              onClick={() => {
                                if (!isPhase2Unlocked) {
                                  setPendingUnlockTrack(track);
                                } else {
                                  setActivePhaseTab('6-10');
                                }
                              }} 
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${activePhaseTab === '6-10' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                            >
                              {!isPhase2Unlocked && <LockIcon className="w-3.5 h-3.5 text-amber-400" />} {track.levels6to10Title || 'Phase 2 (6-10)'}
                            </button>
                          </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Current Target Drill</div>
                            <h4 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                              {activeLevelData.name}
                            </h4>
                            <div className="inline-flex items-center gap-2 bg-slate-800/80 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold mt-2 border border-slate-700">
                              <Target className="w-3.5 h-3.5" />
                              Mastery Standard: {activeLevelData.target}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedExerciseDemo(activeLevelData)}
                              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-sm"
                            >
                              <Eye className="w-4 h-4 text-amber-400" />
                              View Animated Demo
                            </button>

                            <button
                              onClick={() => setLoggingExercise({ trackId: track.id, levelData: activeLevelData })}
                              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                              Log Set
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Non-Negotiable Form Cues
                            </div>
                            <ul className="space-y-2 text-xs text-slate-300">
                              {activeLevelData.cues?.map((cue, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{cue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-2">
                              <ShieldAlert className="w-4 h-4 text-amber-400" />
                              Common Pitfalls to Avoid
                            </div>
                            <ul className="space-y-2 text-xs text-slate-300">
                              {activeLevelData.pitfalls?.map((pit, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span>{pit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800/80">
                          <div className="text-xs font-semibold text-slate-400 mb-3">Progression Continuum (Phase {activePhaseTab}):</div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {activeList.map((lvl) => {
                              const isLocked = has10Levels && lvl.level > 5 && !isPhase2Unlocked;
                              const isCurrent = lvl.level === currentLevel;
                              const isPassed = lvl.level < currentLevel;

                              return (
                                <div
                                  key={lvl.level}
                                  onClick={() => {
                                    if (!isLocked) updateLevel(track.id, lvl.level, has10Levels);
                                    else setPendingUnlockTrack(track);
                                  }}
                                  className={`p-2.5 rounded-xl border cursor-pointer transition relative ${
                                    isLocked 
                                      ? 'opacity-50 bg-slate-950 border-slate-800'
                                      : isCurrent
                                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                                      : isPassed
                                      ? 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Lvl {lvl.level}</span>
                                    {isLocked ? (
                                      <LockIcon className="w-3 h-3 text-amber-400" />
                                    ) : (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedExerciseDemo(lvl);
                                        }}
                                        className="text-slate-400 hover:text-amber-300"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-xs font-medium truncate mt-1">{lvl.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Suggestion Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-12 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Send App Feedback or Suggestions</h3>
              </div>
              {suggestionSubmitted ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">Thank you! Your feedback has been sent directly to our Firebase backend.</div>
              ) : (
                <form onSubmit={handleSendSuggestion} className="space-y-3">
                  <textarea rows={3} placeholder="Type your feature request, bug report, or new exercise pathway idea here..." value={suggestionText} onChange={e => setSuggestionText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" required />
                  <div className="flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20">
                      <Send className="w-3.5 h-3.5" /> Submit Feedback
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: MOBILITY & RECOVERY --- */}
        {activeTab === 'mobility' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100"><HeartPulse className="w-6 h-6 text-emerald-400" /> Mobility & Recovery Protocols</h2>
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
        )}

        {/* --- TAB 2: ROUTINES --- */}
        {activeTab === 'routines' && (
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
                        <span className="text-xs text-slate-400 font-medium">Rest interval: {routine.restDuration}s | {routine.type.toUpperCase()}</span>
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
                          {routine.items.map((item, idx) => (
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
        )}

        {/* --- TAB 3: ACTIVE WORKOUT LOGGER --- */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{activeWorkout.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Logged sets auto-save instantly to your personal Firebase cloud account.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={finishWorkout}
                  disabled={activeWorkout.sets.length === 0 && roundTally === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
                    activeWorkout.sets.length > 0 || roundTally > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Save & Finish Session
                </button>
              </div>
            </div>

            {/* Rest Timer Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <TimerIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Inter-Set Rest Timer</div>
                  <div className="text-3xl font-mono font-bold text-slate-100">{formatTime(timerSeconds)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startTimer(60)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 60 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                >
                  60s
                </button>
                <button
                  onClick={() => startTimer(90)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 90 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                >
                  90s
                </button>
                <button
                  onClick={() => startTimer(180)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${activeWorkout.restDuration === 180 ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                >
                  3 min
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                <button
                  onClick={toggleTimer}
                  className={`p-2.5 rounded-xl font-bold transition ${
                    timerActive ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Circuit Tracker & Fractional Round Calculator */}
            {activeCircuit && (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Circuit Protocol</span>
                    <h3 className="text-base font-bold text-slate-100">{activeCircuit.name}</h3>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <span>Completed Rounds:</span>
                    <span className="text-base font-black text-emerald-300">
                      {(roundTally + (activeCircuit.items.filter(i => i.completed).length / activeCircuit.items.length)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {activeCircuit.type === 'ladder' && roundTally >= LADDER_RUNGS.length ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-slate-100">Ladder Complete!</h3>
                    <p className="text-sm text-slate-400">You survived the Spider-Man Ladder.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleCompleteRoundFastForward}
                      className="w-full py-3 mb-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
                    >
                      Complete Full Round Fast-Forward
                    </button>
                    
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-400 block">Tap stations as you complete them. Completing all automatically logs a full round:</span>
                      {activeCircuit.items.map((item, idx) => {
                        const isLadder = activeCircuit.type === 'ladder';
                        const currentRungReps = isLadder ? LADDER_RUNGS[Math.min(roundTally, LADDER_RUNGS.length - 1)] : null;
                        const displayTarget = isLadder ? `${currentRungReps} Reps` : item.target;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleCircuitItem(idx)}
                            className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                              item.completed
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-xs font-bold">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-amber-400">{displayTarget}</span>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'}`}>
                                {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setActiveCircuit(null)}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Close Circuit Without Saving
                  </button>
                </div>
              </div>
            )}

            {/* Planned Routine Checklist (for standard workouts) */}
            {activeWorkout.plannedItems && activeWorkout.plannedItems.length > 0 && !activeCircuit && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <CheckSquare className="w-4 h-4" />
                    Routine Checklist (Tap to Log Sets)
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 hidden sm:inline">Use ▲/▼ to adjust difficulty</span>
                    <button
                      onClick={clearRoutineChecklist}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-lg border border-slate-700 transition"
                      title="Clear remaining routine checklist without affecting logged sets"
                    >
                      Clear Checklist
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {activeWorkout.plannedItems.map((item, idx) => {
                    const track = MASTER_PATHWAYS.find(t => t.id === item.trackId);
                    const levelData = track?.levels1to5?.find(l => l.level === item.level) || track?.levels6to10?.find(l => l.level === item.level);
                    
                    return (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => adjustPlannedItemLevel(idx, 1)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 transition"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => adjustPlannedItemLevel(idx, -1)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Lvl {item.level}</span>
                              <span className="text-xs font-bold text-slate-200">{item.name}</span>
                            </div>
                            <span className="text-[11px] text-amber-400 block mt-0.5">Target: {item.target}</span>
                          </div>
                        </div>

                        {levelData && track && (
                          <button
                            onClick={() => setLoggingExercise({ trackId: track.id, levelData })}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/10 self-end sm:self-auto"
                          >
                            + Log Set
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grouped Exercise Set Log (Accordion UI) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm">Session Set Log</h3>
                <span className="text-xs text-slate-400 font-medium">{activeWorkout.sets.length} total sets recorded</span>
              </div>

              {activeWorkout.sets.length === 0 ? (
                <div className="p-12 text-center">
                  <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium text-sm">No sets logged yet today.</p>
                  <p className="text-xs text-slate-500 mt-1">Head to Skill Pathways or Routines to start logging!</p>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl border border-slate-700 transition"
                  >
                    View Skill Pathways
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {Object.values(groupedSets).map((group, groupIdx) => {
                    const track = MASTER_PATHWAYS.find(t => t.id === group.trackId);
                    const trackTitle = track ? track.title : 'Circuit Station';
                    const levelData = track ? (track.levels1to5?.find(l => l.name === group.exerciseName) || track.levels6to10?.find(l => l.name === group.exerciseName)) : null;
                    const isExpanded = expandedActiveLogs[group.exerciseName];

                    return (
                      <div key={groupIdx} className="bg-slate-900/40 transition">
                        {/* Collapsible Header */}
                        <div 
                          onClick={() => toggleActiveLogGroup(group.exerciseName)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{trackTitle}</span>
                            <h4 className="font-bold text-slate-100 text-base">{group.exerciseName}</h4>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                              {group.sets.length} Sets Logged
                            </span>
                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Collapsed Body */}
                        {isExpanded && (
                          <div className="px-5 pb-5 space-y-3 pt-2 border-t border-slate-800/50">
                            {levelData && track && (
                              <div className="flex justify-end mb-2">
                                <button
                                  onClick={() => setLoggingExercise({ trackId: track.id, levelData })}
                                  className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Manual Set
                                </button>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              {group.sets.map((set, sIdx) => (
                                <div key={set.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-800">
                                      #{sIdx + 1}
                                    </span>
                                    <div>
                                      <span className="text-xs text-slate-400">Logged at {set.timestamp}</span>
                                      {set.notes && (
                                        <p className="text-xs text-amber-300/90 mt-0.5 flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          {set.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-5">
                                    <div className="text-center">
                                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Reps/Hold</span>
                                      <span className="text-xs font-bold text-emerald-400">{set.repsOrHold}</span>
                                    </div>

                                    <div className="text-center">
                                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">RPE</span>
                                      <span className="text-xs font-bold text-amber-400">{set.rpe}/10</span>
                                    </div>

                                    <div className="text-center">
                                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Form</span>
                                      <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                                        {set.formRating}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setEditingSet(set)}
                                        className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                                        title="Edit Set"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => removeSet(set.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                                        title="Delete Set"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="p-4 bg-slate-950/40">
                    <input
                      type="text"
                      placeholder="Add session notes (e.g. felt great on scapular pulls, wrist slightly tight)..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 4: LOG HISTORY --- */}
        {activeTab === 'history' && (
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
                  
                  // Generate quick summary map of { "Pull-ups": 19, "Dips": 19 }
                  const sessionSummary = session.sets?.reduce((acc, s) => {
                    acc[s.exerciseName] = (acc[s.exerciseName] || 0) + 1;
                    return acc;
                  }, {});

                  return (
                    <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition overflow-hidden shadow-lg">
                      <div className="p-5 border-b border-slate-800 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-100">{session.title}</h3>
                            <span className="text-xs text-slate-400">{session.date}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                              {session.roundsCompleted > 0 ? `${session.roundsCompleted} Rounds | ` : ''}{session.setsCount} Sets Total
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

                        {/* Clean summary pills showing total volume */}
                        {sessionSummary && Object.keys(sessionSummary).length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(sessionSummary).map(([exName, count]) => (
                              <span key={exName} className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-md">
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
                          className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition"
                        >
                          {isExpanded ? 'Hide Full Set Log' : 'View Detailed Set Log'}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Expanded huge list of sets (only shown when requested) */}
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
        )}

      </main>

      {/* MODALS */}
      {pendingUnlockTrack && <UnlockConfirmModal trackTitle={pendingUnlockTrack.title} onConfirm={handleConfirmUnlock} onClose={() => setPendingUnlockTrack(null)} />}
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showAccountModal && user && (
        <AccountSettingsModal user={user} onClose={() => setShowAccountModal(false)} />
      )}
  
      {selectedExerciseDemo && (
        <ExerciseFormVisualizer 
          exercise={selectedExerciseDemo} 
          onClose={() => setSelectedExerciseDemo(null)} 
        />
      )}

      {isBuildingRoutine && (
        <RoutineBuilderModal
          onClose={() => setIsBuildingRoutine(false)}
          onSave={(newRoutine) => saveRoutinesToFirebase([...routines, newRoutine])}
        />
      )}

      {loggingExercise && (
        <LogSetModal
          levelData={loggingExercise.levelData}
          trackId={loggingExercise.trackId}
          restDuration={activeWorkout.restDuration || 90}
          onClose={() => setLoggingExercise(null)}
          onSave={handleSaveSet}
          onStartTimer={startTimer}
        />
      )}

      {editingSet && (
        <LogSetModal
          initialSetData={editingSet}
          trackId={editingSet.trackId}
          restDuration={activeWorkout.restDuration || 90}
          onClose={() => setEditingSet(null)}
          onSave={handleSaveSet}
          onStartTimer={startTimer}
        />
      )}

    </div>
  );
}
