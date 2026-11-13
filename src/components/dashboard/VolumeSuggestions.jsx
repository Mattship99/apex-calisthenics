import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { BarChart3, TrendingUp, CheckCircle2, Activity, Sparkles, Dumbbell, ArrowRight } from 'lucide-react';
import { auth, db } from '../../services/firebase';

const PILLARS = ['Vertical Pull', 'Horizontal Pull', 'Vertical Push', 'Horizontal Push', 'Leg Power', 'Core'];

const MASTER_PATHWAYS = {
  'Vertical Pull': [
    { level: 1, name: 'Active Hang / Scapular Pulls', target: '3 x 10 reps' },
    { level: 2, name: 'Negative Pull-Ups', target: '3 x 5 (5s descent)' },
    { level: 3, name: 'Strict Pull-Ups', target: '3 x 8-12 reps' },
    { level: 4, name: 'Weighted Pull-Ups', target: '3 x 5 (+10-20% bodyweight)' },
    { level: 5, name: 'One-Arm Pull-Up Progression', target: '3 x 3 per arm' }
  ],
  'Horizontal Pull': [
    { level: 1, name: 'Inverted Rows (High Incline)', target: '3 x 12 reps' },
    { level: 2, name: 'Inverted Rows (Parallel / Feet Flat)', target: '3 x 10-12 reps' },
    { level: 3, name: 'Feet-Elevated Inverted Rows', target: '3 x 10 reps' },
    { level: 4, name: 'Tuck Front Lever Rows', target: '3 x 6-8 reps' },
    { level: 5, name: 'Advanced Front Lever Rows', target: '3 x 5 reps' }
  ],
  'Vertical Push': [
    { level: 1, name: 'Pike Push-Ups (Elevated Feet)', target: '3 x 8-10 reps' },
    { level: 2, name: 'Wall Walk Handstand Hold', target: '3 x 30s hold' },
    { level: 3, name: 'Box / Frog HSPU Progression', target: '3 x 6-8 reps' },
    { level: 4, name: 'Free-Standing Handstand Push-Ups', target: '3 x 3-5 reps' },
    { level: 5, name: 'Deficit Handstand Push-Ups', target: '3 x 3 reps' }
  ],
  'Horizontal Push': [
    { level: 1, name: 'Incline Push-Ups', target: '3 x 15 reps' },
    { level: 2, name: 'Standard Push-Ups (Strict)', target: '3 x 12-20 reps' },
    { level: 3, name: 'Decline / Diamond Push-Ups', target: '3 x 12 reps' },
    { level: 4, name: 'Pseudo Planche Push-Ups', target: '3 x 8-10 reps' },
    { level: 5, name: 'Tuck Planche Push-Ups', target: '3 x 5 reps' }
  ],
  'Leg Power': [
    { level: 1, name: 'Bodyweight Squats & Lunges', target: '3 x 15 reps' },
    { level: 2, name: 'Bulgarian Split Squats', target: '3 x 10 per leg' },
    { level: 3, name: 'Pistol Squat Progressions', target: '3 x 6-8 per leg' },
    { level: 4, name: 'Full Pistol Squats', target: '3 x 8 per leg' },
    { level: 5, name: 'Weighted / Explosive Jump Squats', target: '3 x 6 reps' }
  ],
  'Core': [
    { level: 1, name: 'Hollow Body Hold & Planks', target: '3 x 45s hold' },
    { level: 2, name: 'Hanging Knee Raises', target: '3 x 10-12 reps' },
    { level: 3, name: 'Strict Hanging Straight Leg Raises', target: '3 x 8-10 reps' },
    { level: 4, name: 'Toes-to-Bar / Windshield Wipers', target: '3 x 8 reps' },
    { level: 5, name: 'Front Lever / Human Flag Raises', target: '3 x 3-5 reps' }
  ]
};

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
        const fourteenDaysAgoTime = now - (14 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgoTime = now - (30 * 24 * 60 * 60 * 1000);

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
            const currentLevelNum = Number(userLevels[targetPillar] || userLevels[targetPillar?.toLowerCase()] || 1);
            const pathwayList = MASTER_PATHWAYS[targetPillar] || MASTER_PATHWAYS['Horizontal Push'];
            const matchedExercise = pathwayList.find(item => item.level === currentLevelNum) || pathwayList[0];

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
                    onClick={() => onJumpToPathway && onJumpToPathway(item.pillar)}
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
