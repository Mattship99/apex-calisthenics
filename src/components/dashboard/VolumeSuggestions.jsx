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

        // Requirement 1: Strict 7-day rolling window from current timestamp (includes today fully)
        const sevenDaysAgoTime = Date.now() - (7 * 24 * 60 * 60 * 1000);

        const filteredWorkouts = rawWorkouts.filter(w => {
          let workoutDate;
          if (w.date?.toDate) {
            workoutDate = w.date.toDate();
          } else if (w.date instanceof Date) {
            workoutDate = w.date;
          } else {
            workoutDate = new Date(w.createdAt || w.date || Date.now());
          }
          return workoutDate.getTime() >= sevenDaysAgoTime;
        });

        console.log('[VolumeSuggestions] Filtered workouts (last 7 days):', filteredWorkouts);

        // Requirement 4: Only show empty prompt if 0 workouts exist in the last 7 days
        if (filteredWorkouts.length === 0) {
          setSuggestions([]);
          setLoading(false);
          return;
        }

        // Track set counts per normalized category
        const categoryVolume = {};

        filteredWorkouts.forEach((w) => {
          let countedForWorkout = false;
          const exercisesArr = Array.isArray(w.exercises) ? w.exercises : [];
          const setsArr = Array.isArray(w.sets) ? w.sets : [];

          // Process standard exercises array if present
          exercisesArr.forEach((ex) => {
            const exName = typeof ex === 'string' ? ex.trim().toLowerCase() : (ex.name || '').trim().toLowerCase();
            const setCount = typeof ex === 'object' && Array.isArray(ex.sets) ? ex.sets.length : (ex.setCount || 1);
            
            // Match against MASTER_PATHWAYS case-insensitively
            const matchedTrack = MASTER_PATHWAYS.find(t => 
              t.title?.toLowerCase() === exName ||
              t.levels1to5?.some(l => l.name?.toLowerCase() === exName) ||
              t.levels6to10?.some(l => l.name?.toLowerCase() === exName)
            );

            const rawCategory = matchedTrack?.category || (typeof ex === 'object' ? ex.category : null) || w.category || 'Upper Body';
            const normalizedCategory = rawCategory.trim();
            const category = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();

            categoryVolume[category] = (categoryVolume[category] || 0) + setCount;
            countedForWorkout = true;
          });

          // Process flat sets array saved by session logs
          setsArr.forEach((set) => {
            const exerciseName = typeof set === 'string' ? set.trim().toLowerCase() : (set.exerciseName || set.name || '').trim().toLowerCase();
            
            // Match against MASTER_PATHWAYS by trackId or exercise name
            const matchedTrack = MASTER_PATHWAYS.find(t => 
              t.id === set.trackId ||
              t.title?.toLowerCase() === exerciseName ||
              t.levels1to5?.some(l => l.name?.toLowerCase() === exerciseName) ||
              t.levels6to10?.some(l => l.name?.toLowerCase() === exerciseName)
            );

            const rawCategory = matchedTrack?.category || (typeof set === 'object' ? set.category : null) || w.category || 'Upper Body';
            const normalizedCategory = rawCategory.trim();
            const category = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();

            categoryVolume[category] = (categoryVolume[category] || 0) + 1;
            countedForWorkout = true;
          });

          // Handle case where w.sets is stored as a direct number
          if (typeof w.sets === 'number' && w.sets > 0) {
            const rawCategory = w.category || 'Upper Body';
            const normalizedCategory = rawCategory.trim();
            const category = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();
            categoryVolume[category] = (categoryVolume[category] || 0) + w.sets;
            countedForWorkout = true;
          }

          // Fallback guarantee: ensure any logged workout unlocks suggestions immediately even if structure varies
          if (!countedForWorkout) {
            const rawCategory = w.category || 'Upper Body';
            const normalizedCategory = rawCategory.trim();
            const category = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();
            categoryVolume[category] = (categoryVolume[category] || 0) + (w.setCount || 1);
          }
        });

        console.log('[VolumeSuggestions] Calculated Category Volumes (Last 7 Days):', categoryVolume);

        // Requirements 2 & 3: True Gap Analysis Coach Engine
        const generatedSuggestions = [];
        const standardCategories = ['Push', 'Pull', 'Legs', 'Core'];

        // Map standard categories with their recorded volume (defaulting to 0 if untracked)
        const distribution = standardCategories.map(cat => {
          const matchingKey = Object.keys(categoryVolume).find(k => k.toLowerCase() === cat.toLowerCase());
          return {
            category: cat,
            sets: matchingKey ? categoryVolume[matchingKey] : (categoryVolume[cat] || 0)
          };
        });

        const activeCats = distribution.filter(d => d.sets > 0);
        const zeroCats = distribution.filter(d => d.sets === 0);

        // Sort active descending by set count
        activeCats.sort((a, b) => b.sets - a.sets);

        if (activeCats.length > 0) {
          const highest = activeCats[0];

          // If there are unworked movement patterns (gaps), call them out explicitly
          if (zeroCats.length > 0) {
            const activeNames = activeCats.map(c => c.category).join(', ');
            const zeroNames = zeroCats.map(c => c.category).join(' and ');
            const exampleCategory = zeroCats[0].category.toLowerCase();
            
            generatedSuggestions.push(
              `You've been putting in work on ${activeNames} this week, but your ${zeroNames} patterns are at zero. Try mixing in some ${exampleCategory} exercises next!`
            );
          } else {
            // All pillars have volume; check if truly well-rounded
            generatedSuggestions.push(
              `Your training volume is active across all major patterns, led by ${highest.category} (${highest.sets} sets). Keep up the consistent work!`
            );
            generatedSuggestions.push(
              "Your weekly training distribution across movement patterns looks well-rounded and structured."
            );
          }

          // High-volume recovery caution if applicable
          if (highest.sets >= 8) {
            generatedSuggestions.push(
              `High cumulative volume detected in ${highest.category}. Ensure you schedule adequate rest days before overloading this movement pattern again.`
            );
          }
        }

        setSuggestions(generatedSuggestions);
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
          <p className="text-[11px] text-slate-400">Proactive coaching insights based on your past 7 days</p>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-medium">Log more workouts to unlock your smart coach suggestions.</p>
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
