import React, { useMemo } from 'react';
import { PILLAR_MAPPINGS } from '../../data/constants'; // Adjust import as necessary

export default function BalanceRadar({ workouts = [] }) {
  // Utility function to calculate 0-100 scores based on actual logged workout history
  const pillarScores = useMemo(() => {
    // 1. Initialize volume counters for each pillar found in PILLAR_MAPPINGS
    const pillarVolumes = {};
    const pillarKeys = Object.keys(PILLAR_MAPPINGS); // e.g., ["Push", "Pull", "Legs", ...]
    
    pillarKeys.forEach((pillarName) => {
      pillarVolumes[pillarName] = 0;
    });

    // 2. Iterate through logged workouts and completed sets
    workouts.forEach((workout) => {
      // Assuming each workout has an array of exercises or sets
      // Adjust `workout.exercises` or `workout.sets` to match your Firestore schema
      const exercises = workout.exercises || workout.sets || [];

      exercises.forEach((item) => {
        // Map the exercise/pathway/movement to its pillar using PILLAR_MAPPINGS or exercise metadata
        // Example: item.pathwayKey or item.exerciseName matches PILLAR_MAPPINGS values
        const movementKey = item.pathwayKey || item.exerciseName;
        
        // Find which pillar this movement belongs to
        const matchedPillar = Object.entries(PILLAR_MAPPINGS).find(
          ([_, pathwayKey]) => pathwayKey === movementKey
        )?.[0];

        if (matchedPillar && pillarVolumes[matchedPillar] !== undefined) {
          // Count completed working sets (default to 1 if it's an entry, or sum up item.sets / reps)
          const completedSets = item.completedSets || item.sets?.filter(s => s.completed)?.length || 1;
          pillarVolumes[matchedPillar] += completedSets;
        }
      });
    });

    // 3. Find the maximum volume among all pillars to normalize percentages (0-100%)
    const volumes = Object.values(pillarVolumes);
    const maxVolume = Math.max(...volumes, 1); // Prevent division by zero

    // 4. Transform into final score objects formatted for the UI
    return pillarKeys.map((pillarName) => {
      const volume = pillarVolumes[pillarName];
      const rawPercentage = (volume / maxVolume) * 100;
      const score = Math.min(100, Math.round(rawPercentage));

      return {
        name: pillarName,
        score: score,
        totalVolume: volume,
      };
    });
  }, [workouts]);

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
        {pillarScores.map((pillar, index) => (
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
        ))}
      </div>
    </div>
  );
}
