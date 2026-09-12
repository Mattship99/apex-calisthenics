import React from 'react';
import { MASTER_PATHWAYS, PILLAR_MAPPINGS } from '../../data/constants'; // Adjust the import path as necessary

export default function BalanceRadar({ userProgress }) {
  // Utility function to calculate the 0-100 score for each pillar
  const calculatePillarScores = () => {
    const scores = [];
    
    // Assumes PILLAR_MAPPINGS maps a pillar name to a pathway key 
    // e.g., { "Push": "pushups", "Pull": "pullups", ... }
    Object.entries(PILLAR_MAPPINGS).forEach(([pillarName, pathwayKey]) => {
      // Safely get the user's current level, defaulting to 0
      const currentLevel = userProgress?.[pathwayKey] || 0;
      
      // Look up the pathway definition
      const pathwayDef = MASTER_PATHWAYS[pathwayKey];
      
      // Determine max level depending on how MASTER_PATHWAYS is structured
      const maxLevel = pathwayDef?.levels?.length || pathwayDef?.maxLevel || 10;
      
      // Calculate percentage, ensuring we don't divide by zero or exceed 100
      const rawPercentage = maxLevel > 0 ? (currentLevel / maxLevel) * 100 : 0;
      const score = Math.min(100, Math.round(rawPercentage));
      
      scores.push({
        name: pillarName,
        score: score
      });
    });
    
    return scores;
  };

  const pillarScores = calculatePillarScores();

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
