import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Adjust path to your firebase config if necessary

const PILLARS = ['Vertical Pull', 'Horizontal Pull', 'Vertical Push', 'Horizontal Push', 'Leg Power', 'Core'];

const categorizeExercise = (name) => {
  const n = (name || '').toLowerCase();
  
  if (/pull[\s-]?up|chin[\s-]?up|muscle[\s-]?up|front lever|pulldown|rope climb/.test(n)) return 'Vertical Pull';
  if (/row|inverted|face pull|back lever|australian/.test(n)) return 'Horizontal Pull';
  if (/dip|handstand|pike push|hspu|overhead press|ohp/.test(n)) return 'Vertical Push';
  if (/push[\s-]?up|pushup|planche|bench press|chest fly/.test(n)) return 'Horizontal Push';
  if (/squat|lunge|jump|leg|calf|nordic|step[\s-]?up|extension|curl|pistol/.test(n)) return 'Leg Power';
  if (/plank|hollow|leg raise|l-sit|wiper|toes to bar|crunch|sit[\s-]?up|ab wheel|v-up|flag/.test(n)) return 'Core';
  
  // Broader keyword fallbacks
  if (/pull|chin/.test(n)) return 'Vertical Pull';
  if (/push/.test(n)) return 'Horizontal Push';
  if (/leg|squat|calf|jump/.test(n)) return 'Leg Power';
  if (/core|ab|plank/.test(n)) return 'Core';
  
  return 'Horizontal Push'; // Default fallback
};

export default function BalanceRadar({ workoutHistory = [], workouts = [] }) {
  const [fetchedWorkouts, setFetchedWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fallback direct Firestore fetch if no props are provided
  useEffect(() => {
    const hasProps = (Array.isArray(workoutHistory) && workoutHistory.length > 0) || 
                     (Array.isArray(workouts) && workouts.length > 0);

    if (hasProps) {
      setFetchedWorkouts([]);
      return;
    }

    const fetchWorkoutsFromFirestore = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        // Attempt fetching from 'sessions' collection
        let snapshot = await getDocs(collection(db, 'users', user.uid, 'sessions'));
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // If empty, try 'workouts' collection as a secondary path
        if (data.length === 0) {
          snapshot = await getDocs(collection(db, 'users', user.uid, 'workouts'));
          data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        setFetchedWorkouts(data);
      } catch (err) {
        console.error("Error fetching workouts in BalanceRadar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutsFromFirestore();
  }, [workoutHistory, workouts]);

  const activeWorkouts = useMemo(() => {
    if (Array.isArray(workoutHistory) && workoutHistory.length > 0) return workoutHistory;
    if (Array.isArray(workouts) && workouts.length > 0) return workouts;
    return fetchedWorkouts;
  }, [workoutHistory, workouts, fetchedWorkouts]);

  const pillarScores = useMemo(() => {
    const pillarVolume = {
      'Vertical Pull': 0,
      'Horizontal Pull': 0,
      'Vertical Push': 0,
      'Horizontal Push': 0,
      'Leg Power': 0,
      'Core': 0
    };

    activeWorkouts.forEach((w) => {
      if (!w) return;

      // Extract exercises from various possible Firestore schema properties
      const exercisesArr = Array.isArray(w.exercises) 
        ? w.exercises 
        : Array.isArray(w.completedExercises) 
        ? w.completedExercises 
        : Array.isArray(w.sessionExercises)
        ? w.sessionExercises
        : [];

      const setsArr = Array.isArray(w.sets) ? w.sets : [];
      let countedForWorkout = false;

      // 1. Process structured exercises array
      exercisesArr.forEach((ex) => {
        if (!ex) return;
        const exName = typeof ex === 'string' 
          ? ex 
          : (ex.exerciseName || ex.name || ex.title || ex.exercise?.name || '');

        // Determine set count or volume weight
        let setCount = 1;
        if (Array.isArray(ex.sets)) {
          setCount = ex.sets.length > 0 ? ex.sets.length : 1;
        } else if (typeof ex.completedSets === 'number') {
          setCount = ex.completedSets;
        } else if (typeof ex.setCount === 'number') {
          setCount = ex.setCount;
        } else if (Array.isArray(ex.repsOrHold)) {
          setCount = ex.repsOrHold.length;
        }

        const pillar = categorizeExercise(exName);
        pillarVolume[pillar] = (pillarVolume[pillar] || 0) + setCount;
        countedForWorkout = true;
      });

      // 2. Process flat sets array saved by session logs
      setsArr.forEach((set) => {
        if (!set) return;
        const setName = typeof set === 'string' 
          ? set 
          : (set.exerciseName || set.name || set.title || set.trackId || '');
        
        const pillar = categorizeExercise(setName);
        pillarVolume[pillar] = (pillarVolume[pillar] || 0) + 1;
        countedForWorkout = true;
      });

      // 3. Handle case where w.sets or w.setCount is stored as a direct number
      if (typeof w.sets === 'number' && w.sets > 0) {
        const pillar = categorizeExercise(w.category || w.workoutType || 'Push');
        pillarVolume[pillar] = (pillarVolume[pillar] || 0) + w.sets;
        countedForWorkout = true;
      }

      // 4. Fallback guarantee for generic workouts
      if (!countedForWorkout) {
        const fallbackName = w.category || w.title || w.name || 'Push';
        const pillar = categorizeExercise(fallbackName);
        pillarVolume[pillar] = (pillarVolume[pillar] || 0) + (w.setCount || 1);
      }
    });

    const totalCombinedVolume = Object.values(pillarVolume).reduce((sum, v) => sum + v, 0);

    return PILLARS.map((pillarName) => {
      const volume = pillarVolume[pillarName] || 0;
      const score = totalCombinedVolume > 0 ? Math.round((volume / totalCombinedVolume) * 100) : 0;

      return {
        name: pillarName,
        score: score,
        totalVolume: volume,
      };
    });
  }, [activeWorkouts]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Performance
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Strength Balance
          </h3>
        </div>
        {loading && (
          <span className="text-xs text-slate-400 animate-pulse">Syncing...</span>
        )}
      </div>

      <div className="space-y-5 pt-2">
        {pillarScores.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No workout history available.
          </div>
        ) : (
          pillarScores.map((pillar, index) => (
            <div key={index} className="w-full">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-semibold text-slate-300">
                  {pillar.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {pillar.score}% ({pillar.totalVolume} sets)
                </span>
              </div>
              
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
