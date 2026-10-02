import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { MASTER_PATHWAYS } from '../../data/constants';

export default function VolumeSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolumeData = async (user) => {
      if (!user) {
        console.log('[VolumeSuggestions] No authenticated user found.');
        setLoading(false);
        return;
      }

      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const snapshot = await getDocs(sessionsRef);
        
        const rawWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('[VolumeSuggestions] Raw workouts fetched from Firestore:', rawWorkouts);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Filter sessions within the last 7 days locally
        const filteredWorkouts = rawWorkouts.filter(w => {
          const workoutDate = w.date?.toDate ? w.date.toDate() : new Date(w.createdAt || w.date);
          return workoutDate >= sevenDaysAgo;
        });

        // Track set counts per category (e.g., Push, Pull, Legs, Core, etc.)
        const categoryVolume = {};

        filteredWorkouts.forEach((w) => {
          const exercisesArr = w.exercises || [];
          const setsArr = w.sets || [];

          // Process standard exercises array if present
          exercisesArr.forEach((ex) => {
            const exName = (ex.name || '').trim().toLowerCase();
            const setCount = Array.isArray(ex.sets) ? ex.sets.length : (ex.setCount || 1);
            
            // Find category from MASTER_PATHWAYS case-insensitively
            const matchedTrack = MASTER_PATHWAYS.find(t => 
              t.title?.toLowerCase() === exName ||
              t.levels1to5?.some(l => l.name?.toLowerCase() === exName) ||
              t.levels6to10?.some(l => l.name?.toLowerCase() === exName)
            );

            const category = matchedTrack ? matchedTrack.category : 'General / Other';
            categoryVolume[category] = (categoryVolume[category] || 0) + setCount;
          });

          // Process flat sets array saved by App.jsx session logs
          setsArr.forEach((set) => {
            const exerciseName = (set.exerciseName || set.name || '').trim().toLowerCase();
            
            // Match against MASTER_PATHWAYS by trackId or exercise name
            const matchedTrack = MASTER_PATHWAYS.find(t => 
              t.id === set.trackId ||
              t.title?.toLowerCase() === exerciseName ||
              t.levels1to5?.some(l => l.name?.toLowerCase() === exerciseName) ||
              t.levels6to10?.some(l => l.name?.toLowerCase() === exerciseName)
            );

            const category = matchedTrack ? (matchedTrack.category || 'Upper Body') : 'Core / Movement';
            categoryVolume[category] = (categoryVolume[category] || 0) + 1;
          });
        });

        console.log('[VolumeSuggestions] Calculated Category Volumes (Last 7 Days):', categoryVolume);

        // Generate dynamic suggestions based on volume balance
        const generatedSuggestions = [];
        const categories = Object.keys(categoryVolume);

        if (categories.length === 0) {
          setSuggestions([]);
        } else {
          // Find lowest and highest volume categories to provide balance recommendations
          const sortedCategories = Object.entries(categoryVolume).sort((a, b) => b[1] - a[1]);
          const highest = sortedCategories[0];
          const lowest = sortedCategories[sortedCategories.length - 1];

          if (highest && highest[1] >= 6) {
            generatedSuggestions.push(`High volume logged in ${highest[0]} (${highest[1]} sets). Make sure to prioritize adequate recovery.`);
          }
          if (lowest && lowest[1] < 3) {
            generatedSuggestions.push(`Consider adding more volume to ${lowest[0]} this week to maintain balance across pathways.`);
          }
          if (generatedSuggestions.length === 0) {
            generatedSuggestions.push("Your weekly training volume distribution across categories looks well-balanced!");
          }

          setSuggestions(generatedSuggestions);
        }
      } catch (error) {
        console.error('[VolumeSuggestions] Error fetching volume data:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchVolumeData(user);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 my-4 shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Weekly Volume Balance</h3>
          <p className="text-[11px] text-slate-400">Insights based on your past 7 days of training</p>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-medium">Log more workouts to see volume balance suggestions.</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Complete and save sessions in the Active Workout tab to track progress.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
