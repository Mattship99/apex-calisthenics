import React, { useMemo } from 'react';
import { PILLAR_MAPPINGS } from '../../data/constants'; // Adjust import as necessary

export default function BalanceRadar({ workoutHistory = [], workouts = [] }) {
  // Support either workoutHistory or workouts prop naming safely
  const activeWorkouts = useMemo(() => {
    return workoutHistory.length > 0 ? workoutHistory : workouts;
  }, [workoutHistory, workouts]);

  // Utility function to calculate 0-100 scores based on actual logged workout history
  const pillarScores = useMemo(() => {
    const pillarKeys = Object.keys(PILLAR_MAPPINGS || {});
    const pillarVolumes = {};

    pillarKeys.forEach((pillarName) => {
      pillarVolumes[pillarName] = 0;
    });

    if (pillarKeys.length === 0) return [];

    // 1. Iterate through logged workouts and completed sets/exercises
    activeWorkouts.forEach((workout) => {
      // Support various Firestore schema structures (exercises, sets, items)
      const exercises = workout.exercises || workout.sets || workout.items || [];

      exercises.forEach((item) => {
        // Extract potential identifiers from the exercise record
        const movementKey = item.pathwayKey || item.exerciseId || item.exerciseName || item.name || '';
        const explicitPillar = item.pillar || item.category || '';

        let matchedPillar = null;

        // Strategy A: Check if the exercise record explicitly specifies its pillar or category
        if (explicitPillar && pillarVolumes[explicitPillar] !== undefined) {
          matchedPillar = explicitPillar;
        } else {
          // Strategy B: Look up via PILLAR_MAPPINGS (supports both arrays of keys and direct strings)
          for (const [pillarName, mapping] of Object.entries(PILLAR_MAPPINGS)) {
            if (Array.isArray(mapping)) {
              if (
                mapping.includes(movementKey) ||
                mapping.some((m) => String(m).toLowerCase() === String(movementKey).toLowerCase())
              ) {
                matchedPillar = pillarName;
                break;
              }
            } else if (typeof mapping === 'string') {
              if (
                mapping === movementKey ||
                String(mapping).toLowerCase() === String(movementKey).toLowerCase()
              ) {
                matchedPillar = pillarName;
                break;
              }
            }
          }
        }

        // Strategy C: Fallback keyword matching if still unmatched
        if (!matchedPillar && movementKey) {
          const lowerKey = String(movementKey).toLowerCase();
          for (const pillarName of pillarKeys) {
            if (lowerKey.includes(pillarName.toLowerCase())) {
              matchedPillar = pillarName;
              break;
            }
          }
        }

        // 2. Aggregate volume if a valid pillar is matched
        if (matchedPillar && pillarVolumes[matchedPillar] !== undefined) {
          const completedSets =
            item.completedSets ||
            (Array.isArray(item.sets) ? item.sets.filter((s) => s.completed || s.reps > 0).length : 0) ||
            item.setsCount ||
            1;

          pillarVolumes[matchedPillar] += completedSets;
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
  }, [activeWorkouts]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4">
      {/* Header section styled identically to AuthModal */}
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
