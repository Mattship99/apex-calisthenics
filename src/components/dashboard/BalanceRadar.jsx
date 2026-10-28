import React, { useMemo } from 'react';
import { PILLAR_MAPPINGS as EXTERNAL_PILLAR_MAPPINGS } from '../../data/constants';

// Default fallback mappings for the 6 primary calisthenics pillars
const DEFAULT_PILLAR_MAPPINGS = {
  'Vertical Pull': ['pullup', 'chinup', 'pulldown', 'lat', 'front lever', 'vertical pull', 'pull-up'],
  'Horizontal Pull': ['row', 'australian', 'inverted', 'back lever', 'horizontal pull'],
  'Vertical Push': ['handstand', 'pike', 'dip', 'overhead', 'vertical push'],
  'Horizontal Push': ['pushup', 'push-up', 'planche', 'bench', 'horizontal push'],
  'Leg Power': ['squat', 'pistol', 'lunge', 'calf', 'jump', 'leg', 'lower body', 'air squat'],
  'Core': ['plank', 'leg raise', 'hollow', 'wiper', 'core', 'ab', 'crunch', 'leg lower']
};

const normalizeStr = (str) => String(str || '').toLowerCase().replace(/[\s_\-]/g, '');

export default function BalanceRadar({ workoutHistory = [], workouts = [] }) {
  const activeWorkouts = useMemo(() => {
    return Array.isArray(workoutHistory) && workoutHistory.length > 0 
      ? workoutHistory 
      : Array.isArray(workouts) 
      ? workouts 
      : [];
  }, [workoutHistory, workouts]);

  const pillarMappings = useMemo(() => {
    if (EXTERNAL_PILLAR_MAPPINGS && Object.keys(EXTERNAL_PILLAR_MAPPINGS).length > 0) {
      return EXTERNAL_PILLAR_MAPPINGS;
    }
    return DEFAULT_PILLAR_MAPPINGS;
  }, []);

  const pillarScores = useMemo(() => {
    const pillarKeys = Object.keys(pillarMappings);
    const pillarVolumes = {};
    pillarKeys.forEach((pillarName) => {
      pillarVolumes[pillarName] = 0;
    });

    if (pillarKeys.length === 0) return [];

    // Helper to match text or categories against pillars
    const addVolumeToPillar = (textToMatch, volume) => {
      const normText = normalizeStr(textToMatch);
      let matched = null;

      for (const [pillarName, keywords] of Object.entries(pillarMappings)) {
        if (Array.isArray(keywords)) {
          if (keywords.some((kw) => normText.includes(normalizeStr(kw)))) {
            matched = pillarName;
            break;
          }
        }
      }

      // Fallback matching against pillar name directly
      if (!matched) {
        for (const pillarName of pillarKeys) {
          if (normText.includes(normalizeStr(pillarName))) {
            matched = pillarName;
            break;
          }
        }
      }

      if (matched && pillarVolumes[matched] !== undefined) {
        pillarVolumes[matched] += volume;
      }
    };

    // Iterate through all saved workouts in history
    activeWorkouts.forEach((workout, wIdx) => {
      if (!workout) return;

      // Flatten out all possible ways sets/exercises are stored in a saved workout session
      let itemsToParse = [];
      
      if (Array.isArray(workout.sets)) {
        itemsToParse = workout.sets;
      } else if (Array.isArray(workout.exercises)) {
        itemsToParse = workout.exercises;
      } else if (Array.isArray(workout.items)) {
        itemsToParse = workout.items;
      } else if (typeof workout === 'object') {
        // If the workout object itself is a flat set record or contains properties
        itemsToParse = [workout];
      }

      itemsToParse.forEach((item) => {
        if (!item) return;

        // Case 1: Item is a direct string representation (e.g., "10 Push-ups")
        if (typeof item === 'string') {
          let vol = 1;
          const match = item.match(/^(\d+)/);
          if (match) vol = parseInt(match[1], 10) || 1;
          addVolumeToPillar(item, vol);
          return;
        }

        // Case 2: Item is an object (could be a set log or an exercise container)
        const nameProp = item.name || item.exerciseName || item.title || item.exercise || item.text || '';
        const categoryProp = item.category || item.pillar || '';
        
        let vol = 1;
        if (item.reps) vol = Number(item.reps) || 1;
        else if (item.completedSets) vol = Number(item.completedSets) || 1;
        else {
          const match = String(nameProp).match(/^(\d+)/);
          if (match) vol = parseInt(match[1], 10) || 1;
        }

        // Match using both its name and explicit category if available
        addVolumeToPillar(`${nameProp} ${categoryProp}`, vol);

        // Case 3: If the item has a nested sets array inside it
        if (Array.isArray(item.sets)) {
          item.sets.forEach((nestedSet) => {
            if (!nestedSet) return;
            if (typeof nestedSet === 'string') {
              let setVol = 1;
              const match = nestedSet.match(/^(\d+)/);
              if (match) setVol = parseInt(match[1], 10) || 1;
              addVolumeToPillar(`${nameProp} ${nestedSet}`, setVol);
            } else {
              const nestedName = nestedSet.name || nestedSet.exercise || nameProp;
              const nestedVol = Number(nestedSet.reps) || 1;
              addVolumeToPillar(nestedName, nestedVol);
            }
          });
        }
      });
    });

    // Calculate max volume for relative 0-100% scaling
    const volumes = Object.values(pillarVolumes);
    const maxVol = Math.max(...volumes, 1);

    return pillarKeys.map((pillarName) => {
      const volume = pillarVolumes[pillarName] || 0;
      const rawPercentage = (volume / maxVol) * 100;
      const score = volume > 0 ? Math.max(10, Math.min(100, Math.round(rawPercentage))) : 0;

      return {
        name: pillarName,
        score: score,
        totalVolume: volume,
      };
    });
  }, [activeWorkouts, pillarMappings]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4">
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

      <div className="space-y-5 pt-2">
        {pillarScores.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No workout history available.
          </div>
        ) : (
          pillarScores.map((pillar, index) => (
            <div key={index} className="w-full">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-semibold text-slate-300">
                  {pillar.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {pillar.score}% ({pillar.totalVolume} sets/reps)
                </span>
              </div>
              
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2.5 overflow-hidden">
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
