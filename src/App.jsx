import React, { useState, useEffect, useRef } from 'react';
import { 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

// IMPORTING FIREBASE AND CONSTANTS
import { auth, db } from './services/firebase';
import { 
  MASTER_PATHWAYS, 
  MOBILITY_RECOVERY_MODULE, 
  DEFAULT_CIRCUITS, 
  LADDER_RUNGS 
} from './data/constants';

// IMPORTING MODALS & DASHBOARD COMPONENTS
import AuthModal from './components/ui/AuthModal';
import AccountSettingsModal from './components/ui/AccountSettingsModal';
import UnlockConfirmModal from './components/workout/UnlockConfirmModal';
import LogSetModal from './components/workout/LogSetModal';
import ExerciseFormVisualizer from './components/workout/ExerciseFormVisualizer';
import RoutineBuilderModal from './components/workout/RoutineBuilderModal';
import BalanceRadar from './components/dashboard/BalanceRadar';
import VolumeSuggestion from './components/dashboard/VolumeSuggestions.jsx';
import TendonWarningPill from './components/dashboard/TendonWarningPill.jsx';
import GlobalFeedback from './components/ui/GlobalFeedback';
import WorkoutHistory from './components/workout/WorkoutHistory.jsx';

import { 
  Dumbbell, Trophy, Timer as TimerIcon, CheckCircle, ChevronRight, 
  Play, Pause, RotateCcw, Plus, Trash2, Target, Award, 
  Zap, BarChart3, Activity, Check, Cloud, Eye, X, MessageSquare, 
  Layers, CheckSquare, ChevronUp, ChevronDown, Edit3, LogIn, LogOut, 
  User as UserIcon, Search, HeartPulse, Send, Lock as LockIcon, ShieldAlert
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Accordion UI States for Menus
  const [expandedPathway, setExpandedPathway] = useState(null);
  const [expandedRoutine, setExpandedRoutine] = useState(null);
  
  // Accordion UI States for Logs (De-Clutter Feature)
  const [expandedActiveLogs, setExpandedActiveLogs] = useState({});

  const [userLevels, setUserLevels] = useState({});
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

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerInitial, setTimerInitial] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const audioCtxRef = useRef(null);

  // Circuit Tracking State
  const [activeCircuit, setActiveCircuit] = useState(null);
  const [roundTally, setRoundTally] = useState(0);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else signInAnonymously(auth).catch(() => {});
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore per authenticated user
  useEffect(() => {
    if (!user) return;

    // Load History safely
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setWorkoutHistory(docs || []);
    });

    // Load Level Progress safely
    const levelsDocRef = doc(db, 'users', user.uid, 'settings', 'userLevels');
    const unsubscribeLevels = onSnapshot(levelsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserLevels(prev => ({ ...prev, ...(docSnap.data() || {}) }));
      }
    });

    // Load Unlocked Phases safely
    const phasesDocRef = doc(db, 'users', user.uid, 'settings', 'unlockedPhases');
    const unsubscribePhases = onSnapshot(phasesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUnlockedPhases(prev => ({ ...prev, ...(docSnap.data() || {}) }));
      }
    });

    // Load Custom Routines safely
    const routinesDocRef = doc(db, 'users', user.uid, 'settings', 'customRoutines');
    const unsubscribeRoutines = onSnapshot(routinesDocRef, async (docSnap) => {
      if (docSnap.exists() && docSnap.data().routines) {
        const cloudRoutines = docSnap.data().routines;
        const validRoutines = Array.isArray(cloudRoutines) ? cloudRoutines : [];
        const customOnly = validRoutines.filter(r => typeof r.id === 'number' && r.id > 1000000);
        setRoutines([...DEFAULT_CIRCUITS, ...customOnly]);
      } else {
        setRoutines(DEFAULT_CIRCUITS);
      }
    });

    // Load Active Workout State safely
    const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
    const unsubscribeActiveWorkout = onSnapshot(activeWorkoutDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().session) {
        const sessionData = docSnap.data().session;
        setActiveWorkout({
          ...sessionData,
          sets: sessionData.sets || [],
          plannedItems: sessionData.plannedItems || null
        });
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
    if (has10Levels && newLevel > 5 && !(unlockedPhases || {})[trackId]) {
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
    
    const newLevelData = track.levels1to5?.find(l => l.level === newLevelNum) || 
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
      const currentSets = prev.sets || [];
      const existingIndex = currentSets.findIndex(s => s.id === newSet.id);
      let updatedSets;
      if (existingIndex >= 0) {
        updatedSets = [...currentSets];
        updatedSets[existingIndex] = newSet;
      } else {
        updatedSets = [...currentSets, newSet];
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
      const updatedSets = (prev.sets || []).filter(s => s.id !== setId);
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
    if (!activeCircuit || !activeCircuit.items) return;

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
        sets: [...(prev.sets || []), ...newSets]
      };
      if (user) {
        const activeWorkoutDocRef = doc(db, 'users', user.uid, 'settings', 'activeWorkoutState');
        setDoc(activeWorkoutDocRef, { session: nextState }, { merge: true }).catch(err => console.error("Cloud sync err:", err));
      }
      return nextState;
    });
  };

  const handleToggleCircuitItem = (index) => {
    if (!activeCircuit || !activeCircuit.items) return;
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
    if (!activeCircuit || !activeCircuit.items) return;
    logCircuitRound(roundTally);
    setRoundTally(prev => prev + 1);
    const resetItems = activeCircuit.items.map(item => ({ ...item, completed: false }));
    setActiveCircuit({ ...activeCircuit, items: resetItems });
  };

  const startRoutineSession = (routine) => {
    if (!routine || !routine.items) return;

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
      sets: activeWorkout.sets || [],
      plannedItems: !isCircuit ? routine.items : null,
      restDuration: routine.restDuration || 90
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
      setTimerInitial(routine.restDuration || 90);
      setTimerSeconds(routine.restDuration || 90);
      setTimerActive(false);
    }

    setActiveTab('workout');
  };

  const finishWorkout = async () => {
    const currentSets = activeWorkout.sets || [];
    if (currentSets.length === 0 && roundTally === 0) return;

    const completedSession = {
      date: activeWorkout.date,
      title: activeWorkout.title,
      setsCount: currentSets.length,
      roundsCompleted: roundTally,
      sets: currentSets,
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

  const updateHistorySession = async (updatedSession) => {
    if (user && updatedSession.id) {
      try {
        const sessionDocRef = doc(db, 'users', user.uid, 'sessions', updatedSession.id);
        const { id, ...sessionData } = updatedSession;
        sessionData.setsCount = sessionData.sets ? sessionData.sets.length : 0;
        await updateDoc(sessionDocRef, sessionData);
      } catch (err) {
        console.error("Update error:", err);
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
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const searchLower = pathwaySearch.trim().toLowerCase();
    
    const matchesSearch = !searchLower || 
      t.title?.toLowerCase().includes(searchLower) ||
      t.description?.toLowerCase().includes(searchLower) ||
      t.levels1to5?.some(l => l.name?.toLowerCase().includes(searchLower)) ||
      t.levels6to10?.some(l => l.name?.toLowerCase().includes(searchLower));
      
    return matchesCat && matchesSearch;
  });

  const groupedSets = (activeWorkout.sets || []).reduce((acc, set) => {
    if (!set || !set.exerciseName) return acc;
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
              <span>Session: <strong className="text-emerald-400">{(activeWorkout.sets || []).length}</strong></span>
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
                    {user.displayName || user.email?.split('@')[0] || 'Athlete'}
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
            <TendonWarningPill workoutHistory={workoutHistory} />
            <BalanceRadar userProgress={userLevels} />
            <VolumeSuggestion userProgress={userLevels} />
            
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
                const currentLevel = (userLevels || {})[track.id] || 1;
                const isExpanded = expandedPathway === track.id;
                
                const has10Levels = track.levels6to10 && track.levels6to10.length > 0;
                const isPhase2Unlocked = !has10Levels || (unlockedPhases || {})[track.id] || currentLevel > 5;
                const activeList = has10Levels && activePhaseTab === '6-10' ? track.levels6to10 : track.levels1to5;
                
                const activeLevelData = track.levels1to5?.find(l => l.level === currentLevel) || 
                                        track.levels6to10?.find(l => l.level === currentLevel) || 
                                        track.levels1to5?.[0];

                return (
                  <div key={track.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-4">
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
                          {activeList?.map((lvl) => {
                            const isLocked = has10Levels && lvl.level > 5 && !isPhase2Unlocked;
                            return (
                              <button
                                key={lvl.level}
                                onClick={() => {
                                  if (!isLocked) updateLevel(track.id, lvl.level, has10Levels);
                                  else setPendingUnlockTrack(track);
                              }}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                                (userLevels || {})[track.id] === lvl.level
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

                {isExpanded && activeLevelData && (
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
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
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
                      {activeList?.map((lvl) => {
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
          </div>
        ))}
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
                disabled={(activeWorkout.sets || []).length === 0 && roundTally === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
                  (activeWorkout.sets || []).length > 0 || roundTally > 0
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
        {activeCircuit && activeCircuit.items && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Circuit Protocol</span>
                <h3 className="text-base font-bold text-slate-100">{activeCircuit.name}</h3>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                <span>Completed Rounds:</span>
                <span className="text-base font-black text-emerald-300">
                  {(roundTally + ((activeCircuit.items || []).filter(i => i.completed).length / Math.max(1, (activeCircuit.items || []).length))).toFixed(2)}
              </span>
            </div>
          </div>

          {activeCircuit.type === 'ladder' && roundTally >= LADDER_RUNGS.length ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
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
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">Lvl {item.level}</span>
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
  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
      <h3 className="font-bold text-slate-200 text-sm">Session Set Log</h3>
      <span className="text-xs text-slate-400 font-medium">{(activeWorkout.sets || []).length} total sets recorded</span>
    </div>

    {(activeWorkout.sets || []).length === 0 ? (
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
              <div 
                onClick={() => toggleActiveLogGroup(group.exerciseName)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{trackTitle}</span>
                  <h4 className="font-bold text-slate-100 text-base">{group.exerciseName}</h4>
                </div>

                <div className="flex items-center gap-4">
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                    {group.sets.length} Sets Logged
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

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
  )}

  {/* --- TAB 4: LOG HISTORY --- */}
  {activeTab === 'history' && (
    <WorkoutHistory
      workoutHistory={workoutHistory}
      onDeleteSession={deleteHistorySession}
      onUpdateSession={updateHistorySession}
      onNavigateWorkout={() => setActiveTab('workout')}
    />
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
  
  <GlobalFeedback />
  </div>
  );
}
