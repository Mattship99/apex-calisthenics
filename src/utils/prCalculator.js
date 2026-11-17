/**
 * Checks if a newly logged set is a Personal Record (PR) for reps or added weight.
 * 
 * @param {string} exerciseName - The name of the exercise being performed.
 * @param {Object} newSet - The newly logged set (e.g., { reps: 10, addedWeight: 5 }).
 * @param {Array} workoutHistory - Array of past workout objects from Firebase.
 * @returns {Object} An object containing boolean flags { isRepsPR, isWeightPR }.
 */
export const checkIsPR = (exerciseName, newSet, workoutHistory = []) => {
  let isRepsPR = false;
  let isWeightPR = false;

  const newReps = Number(newSet?.reps) || 0;
  const newWeight = Number(newSet?.addedWeight) || 0;

  // Extract past sets for the specific exercise across different possible history schemas
  const pastSets = [];
  
  workoutHistory.forEach(workout => {
    // Schema A: workout.sets is an object keyed by exerciseName (e.g., { pullups: [set1, set2] })
    if (workout.sets && typeof workout.sets === 'object' && !Array.isArray(workout.sets)) {
      if (workout.sets[exerciseName]) {
        pastSets.push(...workout.sets[exerciseName]);
      }
    }
    
    // Schema B: workout.exercises is an array of exercise objects containing sets
    if (Array.isArray(workout.exercises)) {
      workout.exercises.forEach(ex => {
        if (ex.exerciseName === exerciseName || ex.name === exerciseName) {
          if (Array.isArray(ex.sets)) {
            pastSets.push(...ex.sets);
          }
        }
      });
    }

    // Schema C: workout is a single exercise session log with a sets array
    if (Array.isArray(workout.sets) && (workout.exerciseName === exerciseName || workout.name === exerciseName)) {
      pastSets.push(...workout.sets);
    }
  });

  // If no past history exists for this exercise, count valid initial sets as PRs
  if (pastSets.length === 0) {
    return { 
      isRepsPR: newReps > 0, 
      isWeightPR: newWeight > 0 
    };
  }

  // Calculate historical maximums
  const maxHistoricalReps = Math.max(...pastSets.map(s => Number(s.reps) || 0), 0);
  const maxHistoricalWeight = Math.max(...pastSets.map(s => Number(s.addedWeight) || 0), 0);

  // Evaluate PR criteria (must beat previous record and be greater than zero)
  if (newReps > maxHistoricalReps && newReps > 0) {
    isRepsPR = true;
  }
  
  if (newWeight > maxHistoricalWeight && newWeight > 0) {
    isWeightPR = true;
  }

  return { isRepsPR, isWeightPR };
};
