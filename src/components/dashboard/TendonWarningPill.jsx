import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
        const workoutsRef = collection(db, 'workouts');
        const q = query(
          workoutsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(4)
        );

        const snapshot = await getDocs(q);
        
        // 1. Log raw fetched workouts array
        const rawWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[TendonWarningPill] Raw workouts fetched from Firestore:', rawWorkouts);

        if (snapshot.empty || snapshot.size < 2) {
          console.log('[TendonWarningPill] Insufficient workout history found (less than 2 sessions).');
          setShowWarning(false);
          return;
        }

        // Helper to check if a single workout contains heavy tendon load
        const hasHeavyTendonLoad = (workout, index) => {
          if (!workout.exercises || !Array.isArray(workout.exercises)) {
            console.log(`[TendonWarningPill] Workout [${index}] (${workout.id}) has no valid exercises array.`);
            return false;
          }
          
          return workout.exercises.some((ex, exIndex) => {
            const exerciseName = (ex.name || '').trim();
            const isIntensive = TENDON_INTENSIVE_MOVEMENTS.some(
              m => m.toLowerCase() === exerciseName.toLowerCase()
            );

            const directRpe = ex.rpe;
            const setsRpe = Array.isArray(ex.sets) ? ex.sets.map(s => s.rpe) : 'N/A';

            // 3. Log what exercise names and RPE values are being evaluated
            console.log(`[TendonWarningPill] Evaluating Workout [${index}] -> Exercise [${exIndex}]: "${exerciseName}" | Match Intensive List?: ${isIntensive} | Direct RPE: ${directRpe} | Sets RPEs:`, setsRpe);

            if (!isIntensive) return false;

            const directRpeValid = typeof directRpe === 'number' && directRpe >= 9;
            const setsRpeValid = Array.isArray(ex.sets) && ex.sets.some(set => (set.rpe || 0) >= 9);

            return directRpeValid || setsRpeValid;
          });
        };

        let warningTriggered = false;
        
        for (let i = 0; i < rawWorkouts.length - 1; i++) {
          const currentSessionHeavy = hasHeavyTendonLoad(rawWorkouts[i], i);
          const previousSessionHeavy = hasHeavyTendonLoad(rawWorkouts[i + 1], i + 1);

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
