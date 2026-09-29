import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
        const workoutsRef = collection(db, 'workouts');
        // Modify your date filter query logic here if needed (e.g., filtering for past 7 days)
        const q = query(
          workoutsRef,
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        
        // 1. Log raw workouts array fetched from Firestore
        const rawWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[VolumeSuggestions] Raw workouts fetched from Firestore:', rawWorkouts);

        // Example Date Filter (adjust fields like doc.date / doc.createdAt to match your schema)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filteredWorkouts = rawWorkouts.filter(w => {
          const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.date);
          return workoutDate >= sevenDaysAgo;
        });

        // 2. Log how many sets were found matching date filters
        let matchingSetsCount = 0;
        filteredWorkouts.forEach((w, wIndex) => {
          if (w.exercises && Array.isArray(w.exercises)) {
            w.exercises.forEach((ex, exIndex) => {
              const setCount = Array.isArray(ex.sets) ? ex.sets.length : (ex.setCount || 1);
              matchingSetsCount += setCount;

              // 3. Log what exercise names and RPE values it is evaluating
              console.log(`[VolumeSuggestions] Matching Workout [${wIndex}] -> Exercise [${exIndex}]: "${ex.name}" | Sets Count: ${setCount} | RPE:`, ex.rpe || (ex.sets ? ex.sets.map(s => s.rpe) : 'N/A'));
            });
          }
        });

        console.log(`[VolumeSuggestions] Total sets found matching date filters (last 7 days): ${matchingSetsCount}`);

        // Set your component state here based on processed volume calculations...
      } catch (error) {
        console.error('[VolumeSuggestions] Error fetching volume data:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchVolumeData(user);
    });

    return () => unsubscribe();
  }, []);

  return null; // Render your UI component here
}
