import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../services/firebase';

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

        // Strict 7-day rolling window from current timestamp (includes today fully)
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

        // Show empty prompt only if 0 workouts exist in the last 7 days
        if (filteredWorkouts.length === 0) {
          setSuggestions([]);
          setLoading(false);
          return;
        }

        // Initialize pillar volume tracking
        const pillarVolume = {
          'Vertical Pull': 0,
          'Horizontal Pull': 0,
          'Vertical Push': 0,
          'Horizontal Push': 0,
          'Leg Power': 0,
          'Core': 0
        };

        filteredWorkouts.forEach((w) => {
          let countedForWorkout = false;
          const exercisesArr = Array.isArray(w.exercises) ? w.exercises : [];
          const setsArr = Array.isArray(w.sets) ? w.sets : [];

          // Process standard exercises array if present
          exercisesArr.forEach((ex) => {
            const exName = typeof ex === 'string' ? ex : (ex.name || ex.exerciseName || '');
            const setCount = typeof ex === 'object' && Array.isArray(ex.sets) ? ex.sets.length : (ex.setCount || 1);
            
            const pillar = categorizeExercise(exName);
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + setCount;
            countedForWorkout = true;
          });

          // Process flat sets array saved by session logs
          setsArr.forEach((set) => {
            const setName = typeof set === 'string' ? set : (set.exerciseName || set.name || set.trackId || '');
            
            const pillar = categorizeExercise(setName);
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + 1;
            countedForWorkout = true;
          });

          // Handle case where w.sets is stored as a direct number
          if (typeof w.sets === 'number' && w.sets > 0) {
            const pillar = categorizeExercise(w.category || 'Push');
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + w.sets;
            countedForWorkout = true;
          }

          // Fallback guarantee: ensure any logged workout unlocks suggestions immediately
          if (!countedForWorkout) {
            const pillar = categorizeExercise(w.category || 'Push');
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + (w.setCount || 1);
          }
        });

        console.log('[VolumeSuggestions] Calculated Pillar Volumes (Last 7 Days):', pillarVolume);

        // Gap-Analysis Coach Engine
        const generatedSuggestions = [];
        const pillars = PILLARS.map(p => ({
          pillar: p,
          sets: pillarVolume[p] || 0
        }));

        const activePillars = pillars.filter(p => p.sets > 0);
        const zeroPillars = pillars.filter(p => p.sets === 0);

        // Sort active descending by set count
        activePillars.sort((a, b) => b.sets - a.sets);

        if (activePillars.length > 0) {
          const highest = activePillars[0];

          if (zeroPillars.length > 0) {
            const activeNames = activePillars.map(p => p.pillar).join(', ');
            const zeroNames = zeroPillars.map(p => p.pillar).join(' and ');
            const samplePillar = zeroPillars[0].pillar;
            const sampleEx = samplePillar.toLowerCase().includes('pull') ? 'pull-ups' :
                             samplePillar.toLowerCase().includes('push') ? 'push-ups' :
                             samplePillar.toLowerCase().includes('leg') ? 'squats' : 'planks';
            
            generatedSuggestions.push(
              `You've been putting in work on ${activeNames} this week, but your ${zeroNames} patterns are at zero. Try mixing in some ${sampleEx} next!`
            );
          } else {
            generatedSuggestions.push(
              `Your training volume is active across all major patterns, led by ${highest.pillar} (${highest.sets} sets). Keep up the consistent work!`
            );
            generatedSuggestions.push(
              "Your weekly training distribution across movement patterns looks well-rounded and structured."
            );
          }

          // High-volume recovery caution if applicable
          if (highest.sets >= 10) {
            generatedSuggestions.push(
              `High cumulative volume detected in ${highest.pillar}. Ensure you schedule adequate rest days before overloading this movement pattern again.`
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
