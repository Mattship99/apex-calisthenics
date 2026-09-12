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
        setShowWarning(false);
        return;
      }

      try {
        // Query the last 4 workout sessions for the user
        const workoutsRef = collection(db, 'workouts');
        const q = query(
          workoutsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(4)
        );

        const snapshot = await getDocs(q);
        
        // If they don't have at least 2 sessions, they can't have consecutive high-load days
        if (snapshot.empty || snapshot.size < 2) {
          setShowWarning(false);
          return;
        }

        const workouts = snapshot.docs.map(doc => doc.data());

        // Helper to check if a single workout contains heavy tendon load
        const hasHeavyTendonLoad = (workout) => {
          // Adjust 'exercises', 'name', or 'rpe' based on your exact Firestore document structure
          if (!workout.exercises || !Array.isArray(workout.exercises)) return false;
          
          return workout.exercises.some(ex => 
            TENDON_INTENSIVE_MOVEMENTS.includes(ex.name) && 
            ex.rpe >= 9
          );
        };

        // Check for consecutive sessions with high tendon load
        let warningTriggered = false;
        
        // Loop through the recent sessions to check for consecutive triggers
        for (let i = 0; i < workouts.length - 1; i++) {
          const currentSessionHeavy = hasHeavyTendonLoad(workouts[i]);
          const previousSessionHeavy = hasHeavyTendonLoad(workouts[i + 1]);

          if (currentSessionHeavy && previousSessionHeavy) {
            warningTriggered = true;
            break;
          }
        }

        setShowWarning(warningTriggered);
      } catch (error) {
        console.error('Error fetching workouts for tendon check:', error);
        setShowWarning(false);
      }
    };

    // Use onAuthStateChanged to ensure the user object is ready before querying
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
