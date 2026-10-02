import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export default function VolumeSuggestions() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchVolumeData = async (user) => {
      if (!user) {
        console.log('[VolumeSuggestions] No authenticated user found.');
        return;
      }

      try {
        // Query the correct user sessions subcollection
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const snapshot = await getDocs(sessionsRef);
        
        const rawWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[VolumeSuggestions] Raw workouts fetched from Firestore:', rawWorkouts);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Filter by date locally
        const filteredWorkouts = rawWorkouts.filter(w => {
          const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.createdAt || w.date);
          return workoutDate >= sevenDaysAgo;
        });

        let matchingSetsCount = 0;
        filteredWorkouts.forEach((w, wIndex) => {
          const exercisesArr = w.exercises || [];
          const setsArr = w.sets || [];

          if (exercisesArr.length > 0) {
            exercisesArr.forEach((ex, exIndex) => {
              const setCount = Array.isArray(ex.sets) ? ex.sets.length : (ex.setCount || 1);
              matchingSetsCount += setCount;
              console.log(`[VolumeSuggestions] Matching Workout [${wIndex}] -> Exercise [${exIndex}]: "${ex.name}" | Sets Count: ${setCount} | RPE:`, ex.rpe || (ex.sets ? ex.sets.map(s => s.rpe) : 'N/A'));
            });
          } else if (setsArr.length > 0) {
            matchingSetsCount += setsArr.length;
            setsArr.forEach((set, setIndex) => {
              console.log(`[VolumeSuggestions] Matching Workout [${wIndex}] -> Set [${setIndex}]: "${set.exerciseName}" | RPE: ${set.rpe}`);
            });
          }
        });

        console.log(`[VolumeSuggestions] Total sets found matching date filters (last 7 days): ${matchingSetsCount}`);

        // Update state with your processed volume calculations if needed
      } catch (error) {
        console.error('[VolumeSuggestions] Error fetching volume data:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchVolumeData(user);
    });

    return () => unsubscribe();
  }, []);

  return null;
}
