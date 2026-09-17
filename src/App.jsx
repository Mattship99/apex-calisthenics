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
  deleteDoc 
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
import ActiveWorkoutView from './components/views/ActiveWorkoutView';
import SkillPathwaysView from './components/views/SkillPathwaysView';
import RoutinesView from './components/views/RoutinesView';
import MobilityView from './components/views/MobilityView';

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
  const [expandedHistoryLogs, setExpandedHistoryLogs] = useState({});

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
        // Bulletproof check: Ensure cloudRoutines is an array before filtering
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
        // Only save custom user routines to the cloud
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
      
      // Auto-expand the log group for this new set so they can see it instantly
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
  <SkillPathwaysView
    workoutHistory={workoutHistory}
    userLevels={userLevels}
    pathwaySearch={pathwaySearch}
    setPathwaySearch={setPathwaySearch}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
    filteredPathways={filteredPathways}
    expandedPathway={expandedPathway}
    setExpandedPathway={setExpandedPathway}
    unlockedPhases={unlockedPhases}
    activePhaseTab={activePhaseTab}
    setActivePhaseTab={setActivePhaseTab}
    setPendingUnlockTrack={setPendingUnlockTrack}
    updateLevel={updateLevel}
    setSelectedExerciseDemo={setSelectedExerciseDemo}
    setLoggingExercise={setLoggingExercise}
  />
)}
        {/* --- TAB: MOBILITY & RECOVERY --- */}
{activeTab === 'mobility' && (
  <MobilityView />
)}

        {/* --- TAB 2: ROUTINES --- */}
{activeTab === 'routines' && (
  <RoutinesView
    routines={routines}
    expandedRoutine={expandedRoutine}
    setExpandedRoutine={setExpandedRoutine}
    startRoutineSession={startRoutineSession}
    deleteRoutine={deleteRoutine}
    setIsBuildingRoutine={setIsBuildingRoutine}
  />
)}

        {/* --- TAB 3: ACTIVE WORKOUT LOGGER --- */}
{activeTab === 'workout' && (
  <ActiveWorkoutView
    activeWorkout={activeWorkout}
    finishWorkout={finishWorkout}
    timerSeconds={timerSeconds}
    formatTime={formatTime}
    startTimer={startTimer}
    toggleTimer={toggleTimer}
    resetTimer={resetTimer}
    timerActive={timerActive}
    activeCircuit={activeCircuit}
    roundTally={roundTally}
    handleCompleteRoundFastForward={handleCompleteRoundFastForward}
    handleToggleCircuitItem={handleToggleCircuitItem}
    setActiveCircuit={setActiveCircuit}
    clearRoutineChecklist={clearRoutineChecklist}
    adjustPlannedItemLevel={adjustPlannedItemLevel}
    setLoggingExercise={setLoggingExercise}
    groupedSets={groupedSets}
    expandedActiveLogs={expandedActiveLogs}
    toggleActiveLogGroup={toggleActiveLogGroup}
    sessionNotes={sessionNotes}
    setSessionNotes={setSessionNotes}
    setEditingSet={setEditingSet}
    removeSet={removeSet}
    setActiveTab={setActiveTab}
  />
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
                  
                  // Generate quick summary map safely
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

                        {/* Clean summary pills showing total volume */}
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
      
      <GlobalFeedback />
    </div>
  );
}
