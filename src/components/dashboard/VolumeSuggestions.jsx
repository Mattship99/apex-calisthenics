import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { BarChart3, TrendingUp, CheckCircle2, Activity, Sparkles, Dumbbell, ArrowRight } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { MASTER_PATHWAYS, PILLAR_MAPPINGS } from '../../data/constants';

const PILLARS = ['Vertical Pull', 'Horizontal Pull', 'Vertical Push', 'Horizontal Push', 'Leg Power', 'Core'];

const categorizeExercise = (name) => {
  const n = (name || '').toLowerCase();
  if (/pull[\s-]?up|chin[\s-]?up|muscle[\s-]?up|front lever|pulldown|rope climb/.test(n)) return 'Vertical Pull';
  if (/row|inverted|face pull|back lever|australian/.test(n)) return 'Horizontal Pull';
  if (/dip|handstand|pike push|hspu|overhead press|ohp/.test(n)) return 'Vertical Push';
  if (/push[\s-]?up|pushup|planche|bench press|chest fly/.test(n)) return 'Horizontal Push';
  if (/squat|lunge|jump|leg|calf|nordic|step[\s-]?up|extension|curl|pistol/.test(n)) return 'Leg Power';
  if (/plank|hollow|leg raise|l-sit|wiper|toes to bar|crunch|sit[\s-]?up|ab wheel|v-up|flag/.test(n)) return 'Core';
  
  if (/pull|chin/.test(n)) return 'Vertical Pull';
  if (/push/.test(n)) return 'Horizontal Push';
  if (/leg|squat|calf|jump/.test(n)) return 'Leg Power';
  if (/core|ab|plank/.test(n)) return 'Core';
  
  return 'Horizontal Push';
};

export default function VolumeSuggestions({ onJumpToPathway }) {
  const [weeklySuggestions, setWeeklySuggestions] = useState([]);
  const [lifestyleReminders, setLifestyleReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolumeData = async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const userDocRef = doc(db, 'users', user.uid);

        const [snapshot, userDocSnap] = await Promise.all([
          getDocs(sessionsRef),
          getDoc(userDocRef)
        ]);
        
        const rawWorkouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const userLevels = userData.userLevels || userData.levels || userData.pathways || {};

        if (rawWorkouts.length === 0) {
          setWeeklySuggestions([]);
          setLifestyleReminders([]);
          setLoading(false);
          return;
        }

        const now = Date.now();
        const sevenDaysAgoTime = now - (7 * 24 * 60 * 60 * 1000);

        const getWorkoutDate = (w) => {
          if (w.date?.toDate) return w.date.toDate();
          if (w.date instanceof Date) return w.date;
          return new Date(w.createdAt || w.date || Date.now());
        };

        const filteredWorkouts = rawWorkouts.filter(w => getWorkoutDate(w).getTime() >= sevenDaysAgoTime);

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

          exercisesArr.forEach((ex) => {
            const exName = typeof ex === 'string' ? ex : (ex.name || ex.exerciseName || '');
            const pillar = categorizeExercise(exName);
            const setCount = typeof ex === 'object' && Array.isArray(ex.sets) ? ex.sets.length : (ex.setCount || 1);
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + setCount;
            countedForWorkout = true;
          });

          setsArr.forEach((set) => {
            const setName = typeof set === 'string' ? set : (set.exerciseName || set.name || set.trackId || '');
            const pillar = categorizeExercise(setName);
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + 1;
            countedForWorkout = true;
          });

          if (!countedForWorkout) {
            const pillar = categorizeExercise(w.category || 'Push');
            pillarVolume[pillar] = (pillarVolume[pillar] || 0) + (w.setCount || 1);
          }
        });

        const generatedWeekly = [];
        const pillars = PILLARS.map(p => ({
          pillar: p,
          sets: pillarVolume[p] || 0
        }));

        const sortedDesc = [...pillars].sort((a, b) => b.sets - a.sets);
        const highest = sortedDesc[0];

        if (filteredWorkouts.length > 0 && highest && highest.sets > 0) {
          const candidateGaps = pillars
            .filter(p => p.pillar !== highest.pillar)
            .sort((a, b) => a.sets - b.sets);

          const targetGaps = candidateGaps.filter(p => p.sets === 0);
          const gapsToRecommend = targetGaps.length > 0 ? targetGaps.slice(0, 1) : candidateGaps.slice(0, 1);

          if (gapsToRecommend.length > 0) {
            const targetPillar = gapsToRecommend[0].pillar;

            // Map pillars to their respective track IDs used in userLevels / MASTER_PATHWAYS
            const pillarToTrackKeyMap = {
              'vertical pull': 'pulling',
              'horizontal pull': 'pulling', // Or update if you have a separate horizontal track ID in constants
              'vertical push': 'pushing',
              'horizontal push': 'pushing',
              'leg power': 'pistol_squat',
              'core': 'lsit_core'
            };

            const trackKey = pillarToTrackKeyMap[targetPillar.toLowerCase()] || targetPillar.toLowerCase();

            // Find the corresponding track definition from your app's global MASTER_PATHWAYS constant
            const globalTrack = MASTER_PATHWAYS.find(t => t.id === trackKey);

            // Calculate user's current level for this track
            const currentLevelNum = Number(
              userLevels[trackKey] || 
              userLevels[targetPillar] || 
              userLevels[targetPillar.toLowerCase()] || 
              1
            );

            // Pull the exact exercise data from the global track's levels array
            const levelsList = globalTrack ? [...(globalTrack.levels1to5 || []), ...(globalTrack.levels6to10 || [])] : [];
            const matchedExercise = levelsList.find(item => item.level === currentLevelNum) || levelsList[0] || { name: targetPillar, target: '3 x 10 reps' };

            generatedWeekly.push({
              type: 'gap_recommendation',
              pillar: targetPillar,
              text: `Heavy focus on ${highest.pillar} detected. Balance your physique by scheduling some ${targetPillar} work.`,
              exercise: matchedExercise,
              level: currentLevelNum
            });
          }
        }
        setWeeklySuggestions(generatedWeekly);
        setLoading(false);
      } catch (error) {
        console.error('[VolumeSuggestions] Error fetching volume data:', error);
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchVolumeData(user);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (weeklySuggestions.length === 0) return null;

  return (
    <div className="space-y-4 my-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Weekly Volume Balance</h3>
            <p className="text-[11px] text-slate-400">Proactive coaching insights based on your past 7 days</p>
          </div>
        </div>

        <div className="space-y-3">
          {weeklySuggestions.map((item, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
              </div>

              {item.type === 'gap_recommendation' && item.exercise && (
                <div className="mt-2 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 bg-slate-900/80 rounded-lg p-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                          Level {item.level} {item.pillar}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                        {item.exercise.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Target: <span className="text-slate-300 font-medium">{item.exercise.target}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onJumpToPathway) {
                        onJumpToPathway(item.pillar, item.level);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
                  >
                    <span>View in Pathways</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
