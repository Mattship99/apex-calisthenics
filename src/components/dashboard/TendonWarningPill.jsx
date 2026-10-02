import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { AlertTriangle } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { TENDON_INTENSIVE_MOVEMENTS } from '../../data/constants';

export default function TendonWarningPill() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkTendonLoad = async (user) => {
      if (!user) {
        console.log('[TendonWarningPill] No authenticated user found.');
        setShowWarning(false);
        return;
      }

      try {
        // Query the correct user sessions subcollection without compound indexes
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const snapshot = await getDocs(sessionsRef);
        
        const rawWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort locally descending by createdAt or date to replicate orderBy('date', 'desc')
        rawWorkouts.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

        // Limit to 4 sessions locally
        const limitedWorkouts = rawWorkouts.slice(0, 4);
        console.log('[TendonWarningPill] Workouts fetched and sorted locally:', limitedWorkouts);

        if (limitedWorkouts.length < 2) {
          console.log('[TendonWarningPill] Insufficient workout history found (less than 2 sessions).');
          setShowWarning(false);
          return;
        }

        const hasHeavyTendonLoad = (workout, index) => {
          const exercisesArr = workout.exercises || [];
          const setsArr = workout.sets || [];

          if (exercisesArr.length === 0 && setsArr.length === 0) {
            console.log(`[TendonWarningPill] Workout [${index}] (${workout.id}) has no valid exercises or sets array.`);
            return false;
          }
          
          // Check standard exercises array if present
          const hasIntensiveInExercises = exercisesArr.some((ex, exIndex) => {
            const exerciseName = (ex.name || '').trim();
            const isIntensive = TENDON_INTENSIVE_MOVEMENTS.some(
              m => m.toLowerCase() === exerciseName.toLowerCase()
            );
            const directRpe = ex.rpe;
            const setsRpe = Array.isArray(ex.sets) ? ex.sets.map(s => s.rpe) : 'N/A';

            console.log(`[TendonWarningPill] Evaluating Workout [${index}] -> Exercise [${exIndex}]: "${exerciseName}" | Match Intensive List?: ${isIntensive} | Direct RPE: ${directRpe} | Sets RPEs:`, setsRpe);

            if (!isIntensive) return false;
            const directRpeValid = typeof directRpe === 'number' && directRpe >= 9;
            const setsRpeValid = Array.isArray(ex.sets) && ex.sets.some(set => (set.rpe || 0) >= 9);
            return directRpeValid || setsRpeValid;
          });

          if (hasIntensiveInExercises) return true;

          // Check flat sets array saved by App.jsx
          const hasIntensiveInSets = setsArr.some((set, setIndex) => {
            const exerciseName = (set.exerciseName || set.name || '').trim();
            const isIntensive = TENDON_INTENSIVE_MOVEMENTS.some(
              m => m.toLowerCase() === exerciseName.toLowerCase()
            );
            const rpe = set.rpe;

            console.log(`[TendonWarningPill] Evaluating Workout [${index}] -> Set [${setIndex}]: "${exerciseName}" | Match Intensive List?: ${isIntensive} | RPE: ${rpe}`);

            if (!isIntensive) return false;
            const numericRpe = typeof rpe === 'number' ? rpe : parseFloat(rpe);
            return !isNaN(numericRpe) && numericRpe >= 9;
          });

          return hasIntensiveInSets;
        };

        let warningTriggered = false;
        
        for (let i = 0; i < limitedWorkouts.length - 1; i++) {
          const currentSessionHeavy = hasHeavyTendonLoad(limitedWorkouts[i], i);
          const previousSessionHeavy = hasHeavyTendonLoad(limitedWorkouts[i + 1], i + 1);

          console.log(`[TendonWarningPill] Session pair check [i=${i} vs i=${i+1}] -> Current Heavy: ${currentSessionHeavy}, Previous Heavy: ${previousSessionHeavy}`);

          if (currentSessionHeavy && previousSessionHeavy) {
            warningTriggered = true;
            break;
          }
        }

        console.log('[TendonWarningPill] Final warningTriggered status:', warningTriggered);
        setShowWarning(warningTriggered);
      } catch (error) {
        console.error('[TendonWarningPill] Error fetching workouts for tendon check:', error);
        setShowWarning(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      checkTendonLoad(user);
    });

    return () => unsubscribe();
  }, []);

  if (!showWarning) return null;

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-semibold shadow-lg shadow-orange-500/5 transition-all">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>High connective tissue load detected. Consider a deload or mobility focus today.</span>
      </div>
    </div>
  );
}
