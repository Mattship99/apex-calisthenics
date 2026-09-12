import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { X, Calendar, Trash2, Edit2, Check, AlertCircle, Dumbbell, Clock } from 'lucide-react';

export default function WorkoutHistoryModal({ user, db, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editExercises, setEditExercises] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, [user, db]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users', user.uid, 'sessions'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const sessionList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionList);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this training session?')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'sessions', sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleStartEdit = (session) => {
    setEditingId(session.id);
    setEditDate(session.date || '');
    setEditExercises(session.exercises ? JSON.parse(JSON.stringify(session.exercises)) : []);
  };

  const handleSaveEdit = async (sessionId) => {
    try {
      const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        date: editDate,
        exercises: editExercises
      });
      setEditingId(null);
      fetchSessions();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...editExercises];
    updated[exerciseIndex].sets[setIndex][field] = Number(value);
    setEditExercises(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Training Log</span>
            <h3 className="text-base font-bold text-slate-100">Workout History</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500 font-medium">Loading workout history...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-medium">No past workout sessions found. Time to train!</div>
          ) : (
            sessions.map((session) => {
              const isEditing = editingId === session.id;

              return (
                <div key={session.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  
                  {/* Session Header / Date Info */}
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-200">{session.date || 'Unknown Date'}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(session.id)}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition"
                            title="Save Changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(session)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Edit Session"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Exercises & Sets Display / Editor */}
                  <div className="space-y-3 pt-1">
                    {(isEditing ? editExercises : session.exercises || []).map((ex, exIdx) => (
                      <div key={exIdx} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{ex.name || 'Exercise'}</span>
                        </div>

                        <div className="space-y-1.5">
                          {(ex.sets || []).map((set, setIdx) => (
                            <div key={setIdx} className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800/50">
                              <span className="font-semibold text-slate-500">Set {setIdx + 1}</span>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] text-slate-500">Reps:</label>
                                  <input
                                    type="number"
                                    value={set.reps || 0}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 text-center focus:outline-none focus:border-emerald-500"
                                  />
                                  <label className="text-[10px] text-slate-500">Weight:</label>
                                  <input
                                    type="number"
                                    value={set.weight || 0}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                                    className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 text-center focus:outline-none focus:border-emerald-500"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-4 font-medium text-slate-300">
                                  <span>{set.reps} reps</span>
                                  <span>{set.weight} lbs</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 shrink-0 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
