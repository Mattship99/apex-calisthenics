import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Lightbulb } from 'lucide-react';
import { db, auth } from '../../services/firebase';
import { VOLUME_CATEGORIES } from '../../data/constants'; // Adjust path as needed

export default function VolumeSuggestion() {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndAnalyzeVolume = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const workoutsRef = collection(db, 'workouts');
        const q = query(
          workoutsRef,
          where('userId', '==', auth.currentUser.uid),
          where('date', '>=', Timestamp.fromDate(sevenDaysAgo))
        );

        const snapshot = await getDocs(q);
        
        // If no workouts in the last 7 days
        if (snapshot.empty) {
          setSuggestion("It's a fresh week! Let's get some sets in today.");
          setLoading(false);
          return;
        }

        // Tally volume (counting total sets) per category
        const volumeTally = {};
        
        // Initialize tally with 0 for all known categories to ensure we catch skipped ones
        Object.values(VOLUME_CATEGORIES).forEach(category => {
          if (typeof category === 'string') {
            volumeTally[category.toLowerCase()] = 0;
          }
        });

        snapshot.forEach((doc) => {
          const workout = doc.data();
          
          if (workout.exercises && Array.isArray(workout.exercises)) {
            workout.exercises.forEach((exercise) => {
              // Map the exercise to its category using the constants file
              const categoryName = (exercise.category || VOLUME_CATEGORIES[exercise.name] || 'other').toLowerCase();
              
              if (categoryName !== 'other') {
                const setsCompleted = exercise.sets ? exercise.sets.length : 0;
                volumeTally[categoryName] = (volumeTally[categoryName] || 0) + setsCompleted;
              }
            });
          }
        });

        // Find the category with the absolute lowest volume
        let lowestCategory = null;
        let lowestVolume = Infinity;

        Object.entries(volumeTally).forEach(([category, volume]) => {
          if (volume < lowestVolume) {
            lowestVolume = volume;
            lowestCategory = category;
          }
        });

        // Generate a conversational suggestion
        if (lowestCategory) {
          const suggestions = [
            `Hey, maybe try hitting more ${lowestCategory} today.`,
            `Your ${lowestCategory} volume is pretty low this week, consider prioritizing it!`,
            `Looks like a great day to sneak in some extra ${lowestCategory} sets.`,
            `You've been neglecting your ${lowestCategory} recently. Time to give it some attention?`
          ];
          const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          setSuggestion(randomSuggestion);
        } else {
          setSuggestion("Your volume looks beautifully balanced this week. Keep it up!");
        }

      } catch (error) {
        console.error("Error fetching volume data:", error);
        setSuggestion("Ready to crush today's session?");
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyzeVolume();
  }, []);

  if (loading || !suggestion) return null;

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 transition-opacity duration-500">
      <Lightbulb className="w-4 h-4 text-emerald-500/70 shrink-0 mt-0.5" />
      <p className="text-xs font-medium text-slate-400 leading-relaxed">
        {suggestion}
      </p>
    </div>
  );
}
