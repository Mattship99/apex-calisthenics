import React from 'react';

export default function ExerciseGuideModal({ exercise, onClose }) {
  if (!exercise) return null;

  // Extract base properties and support both direct fields or nested guide object
  const {
    level,
    name,
    target,
    cues = [],
    pitfalls = [],
    focus,
    isIsometric,
    defaultRest,
    guide = {}
  } = exercise;

  // Fallback or resolve from guide object vs top-level exercise props
  const setupText = guide.setup || exercise.setup || 'Assume a rigid, controlled starting position. Ensure proper joint stacking, engage core bracing, and establish full tension before initiating movement.';
  
  const executionSteps = guide.execution || exercise.execution || [
    {
      title: 'Initiation',
      description: 'Maintain strict form integrity from the first second. Do not rely on momentum or loose joint angles unless specifically programmed.'
    },
    {
      title: 'Execution / Hold',
      description: 'Execute through the full active range of motion or hold static tension smoothly, keeping breathing steady and controlled.'
    },
    {
      title: 'Completion',
      description: 'Return to the starting position safely without dropping abruptly or breaking core rigidity.'
    }
  ];

  const primaryMuscles = guide.engagement || guide.primaryMuscles || exercise.primaryMuscles || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Badge & Title */}
        <div className="mb-6 pr-8">
          {level && (
            <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-400/10 rounded-full border border-amber-400/20">
              Level {level} Movement
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {name}
          </h2>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 bg-zinc-800/40 rounded-xl border border-zinc-800">
          <div>
            <span className="block text-xs font-medium text-zinc-400 uppercase">Target</span>
            <span className="text-sm font-bold text-amber-400">{target || 'Standard'}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-zinc-400 uppercase">Type</span>
            <span className="text-sm font-semibold text-zinc-200">
              {isIsometric ? 'Isometric Hold' : 'Dynamic Reps'}
            </span>
          </div>
          <div>
            <span className="block text-xs font-medium text-zinc-400 uppercase">Default Rest</span>
            <span className="text-sm font-semibold text-zinc-200">{defaultRest || 90}s</span>
          </div>
        </div>

        {/* Primary Muscles / Engagement / Focus Area */}
        {(primaryMuscles.length > 0 || focus) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Primary Engagement
            </h3>
            <div className="flex flex-wrap gap-2">
              {primaryMuscles.map((muscle, index) => {
                const label = typeof muscle === 'string' ? muscle : (muscle.name || muscle.muscle || JSON.stringify(muscle));
                return (
                  <span 
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/50"
                  >
                    {label}
                  </span>
                );
              })}
              {focus && (
                <span className="px-3 py-1 text-xs font-medium bg-amber-950/40 text-amber-300 rounded-lg border border-amber-800/40">
                  {focus}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Setup & Positioning */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
            1. Setup & Positioning
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/30 p-3.5 rounded-xl border border-zinc-800/80">
            {setupText}
          </p>
        </div>

        {/* Step-by-Step Execution */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
            2. Step-by-Step Execution
          </h3>
          <ol className="space-y-2.5 text-sm text-zinc-300">
            {executionSteps.map((step, index) => {
              const stepTitle = typeof step === 'object' && step.title ? step.title : `Step ${index + 1}`;
              const stepDesc = typeof step === 'object' ? (step.description || step.text || '') : step;
              
              return (
                <li key={index} className="flex items-start bg-zinc-800/30 p-3 rounded-xl border border-zinc-800/80">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-800 text-amber-400 font-bold text-xs rounded-full mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span>
                    <strong className="text-white">{stepTitle}:</strong> {stepDesc}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Form Cues & Common Pitfalls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Form Cues */}
          {cues.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Key Form Cues
              </h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {cues.map((cue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Pitfalls */}
          {pitfalls.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Common Pitfalls
              </h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {pitfalls.map((pitfall, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-rose-500 mr-2">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/10"
          >
            Got It, Let's Train
          </button>
        </div>
      </div>
    </div>
  );
}
