import React, { useMemo } from 'react';
import { PILLAR_MAPPINGS as EXTERNAL_PILLAR_MAPPINGS } from '../../data/constants';

// Default fallback mappings for the 6 primary calisthenics pillars
const DEFAULT_PILLAR_MAPPINGS = {
  'Vertical Pull': ['pullup', 'chinup', 'pulldown', 'lat', 'front lever', 'vertical pull'],
  'Horizontal Pull': ['row', 'australian', 'inverted', 'back lever', 'horizontal pull'],
  'Vertical Push': ['handstand', 'pike', 'dip', 'overhead', 'vertical push'],
  'Horizontal Push': ['pushup', 'push-up', 'planche', 'bench', 'horizontal push'],
  'Leg Power': ['squat', 'pistol', 'lunge', 'calf', 'jump', 'leg', 'lower body'],
  'Core': ['plank', 'leg raise', 'hollow', 'wiper', 'core', 'ab', 'crunch']
};

// Helper utility to normalize strings for reliable matching (removes casing, spaces, underscores, and hyphens)
const normalizeStr = (str) => String(str || '').toLowerCase().replace(/[\s_\-]/g, '');

export default function BalanceRadar({ workoutHistory = [], workouts = [] }) {
  // Support either workoutHistory or workouts prop naming safely
  const activeWorkouts = useMemo(() => {
    return Array.isArray(workoutHistory) && workoutHistory.length > 0 
      ? workoutHistory 
      : Array.isArray(workouts) 
      ? workouts 
      : [];
  }, [workoutHistory, workouts]);

  // Merge external mappings with defaults as a safeguard against empty/missing imports
  const pillarMappings = useMemo(() => {
    if (EXTERNAL_PILLAR_MAPPINGS && Object.keys(EXTERNAL_PILLAR_MAPPINGS).length > 0) {
      return EXTERNAL_PILLAR_MAPPINGS;
    }
    return DEFAULT_PILLAR_MAPPINGS;
  }, []);

  // Utility function to calculate 0-100 scores based on actual logged workout history
  const pillarScores = useMemo(() => {
    const pillarKeys = Object.keys(pillarMappings);
    const pillarVolumes = {};

    pillarKeys.forEach((pillarName) => {
      pillarVolumes[pillarName] = 0;
    });

    if (pillarKeys.length === 0) return [];

    // 1. Iterate through logged workouts and completed sets/exercises
    activeWorkouts.forEach((workout) => {
      if (!workout) return;

      // Support various Firestore schema structures (exercises, sets, items, or flat workout records)
      const exercises = Array.isArray(workout.exercises)
        ? workout.exercises
        : Array.isArray(workout.sets)
        ? workout.sets
        : Array.isArray(workout.items)
        ? workout.items
        : Array.isArray(workout.workoutItems)
        ? workout.workoutItems
        : [workout];

      exercises.forEach((item) => {
        if (!item) return;

        // Extract potential identifiers and nested category/pillar attributes safely
        const movementKey = item.pathwayKey || item.exerciseId || item.exerciseName || item.name || item.title || item.exercise || '';
        const explicitPillar = 
          item.pillar || 
          item.category || 
          item.levelData?.category || 
          item.levelData?.pillar || 
          item.exerciseData?.category || 
          item.exerciseData?.pillar ||
          workout.pillar || 
          workout.category || 
          '';

        let matchedPillar = null;

        // Strategy A: Check if the exercise record explicitly specifies its pillar or category
        if (explicitPillar) {
          const normExplicit = normalizeStr(explicitPillar);
          for (const pillarName of pillarKeys) {
            if (normalizeStr(pillarName) === normExplicit || normExplicit.includes(normalizeStr(pillarName)) || normalizeStr(pillarName).includes(normExplicit)) {
              matchedPillar = pillarName;
              break;
            }
          }
        }

        // Strategy B: Look up via pillarMappings using normalized comparison against movement keys
        if (!matchedPillar && movementKey) {
          const normMovement = normalizeStr(movementKey);
          for (const [pillarName, mapping] of Object.entries(pillarMappings)) {
            if (Array.isArray(mapping)) {
              if (
                mapping.some((m) => {
                  const normM = normalizeStr(m);
                  return normM === normMovement || normMovement.includes(normM) || normM.includes(normMovement);
                })
              ) {
                matchedPillar = pillarName;
                break;
              }
            } else if (typeof mapping === 'string') {
              const normMapping = normalizeStr(mapping);
              if (
                normMapping === normMovement ||
                normMovement.includes(normMapping) ||
                normMapping.includes(normMovement)
              ) {
                matchedPillar = pillarName;
                break;
              }
            }
          }
        }

        // Strategy C: Fallback keyword matching if still unmatched
        if (!matchedPillar) {
          const searchStr = normalizeStr(movementKey + ' ' + explicitPillar);
          for (const pillarName of pillarKeys) {
            const normPillar = normalizeStr(pillarName);
            if (searchStr.includes(normPillar)) {
              matchedPillar = pillarName;
              break;
            }
          }
        }

        // 2. Aggregate volume if a valid pillar is matched
        if (matchedPillar && pillarVolumes[matchedPillar] !== undefined) {
          let itemVolume = 1;
          
          if (Array.isArray(item.sets)) {
            const completedSets = item.sets.filter((s) => s && (s.completed || s.reps > 0));
            if (completedSets.length > 0) {
              itemVolume = completedSets.reduce((sum, s) => sum + (Number(s.reps) || 1), 0);
            } else {
              itemVolume = item.sets.length;
            }
          } else if (item.completedSets) {
            itemVolume = Number(item.completedSets) || 1;
          } else if (item.reps) {
            itemVolume = Number(item.reps) || 1;
          } else if (item.setsCount) {
            itemVolume = Number(item.setsCount) || 1;
          }

          pillarVolumes[matchedPillar] += itemVolume;
        }
      });
    });

    // 3. Find the maximum volume among all pillars to normalize percentages (0-100%)
    const volumes = Object.values(pillarVolumes);
    const maxVolume = Math.max(...volumes, 1); // Prevent division by zero

    // 4. Transform into final score objects formatted for the UI
    return pillarKeys.map((pillarName) => {
      const volume = pillarVolumes[pillarName] || 0;
      const rawPercentage = (volume / maxVolume) * 100;
      const score = Math.min(100, Math.round(rawPercentage));

      return {
        name: pillarName,
        score: score,
        totalVolume: volume,
      };
    });
  }, [activeWorkouts, pillarMappings]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Performance
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Strength Balance
          </h3>
        </div>
      </div>

      {/* Progress Bars Container */}
      <div className="space-y-5 pt-2">
        {pillarScores.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No workout history available.
          </div>
        ) : (
          pillarScores.map((pillar, index) => (
            <div key={index} className="w-full">
              {/* Label and Percentage */}
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-semibold text-slate-300">
                  {pillar.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {pillar.score}%
                </span>
              </div>
              
              {/* Progress Bar Track */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                {/* Progress Bar Fill */}
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
