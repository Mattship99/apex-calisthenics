import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../../services/firebase';

export default function GlobalFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Pushes to a 'feedback' collection in Firestore
      await addDoc(collection(db, 'feedback'), {
        text: feedback.trim(),
        createdAt: serverTimestamp(),
      });
      
      setStatus({ type: 'success', message: 'Suggestion sent! Thank you.' });
      setFeedback('');
      
      // Auto-close after a short delay on success
      setTimeout(() => {
        setIsOpen(false);
        setStatus({ type: '', message: '' });
      }, 2500);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setStatus({ type: '', message: '' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Compact Popover Form */}
      {isOpen && (
        <div className="mb-4 bg-slate-900 border border-slate-800 rounded-2xl w-72 overflow-hidden shadow-2xl p-4 space-y-3 origin-bottom-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Feedback</span>
            </div>
            <button onClick={toggleOpen} className="text-slate-400 hover:text-slate-200 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {status.type === 'error' && (
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          {status.type === 'success' && (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share a suggestion or report a bug..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium resize-none placeholder:text-slate-600"
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <span>Submit</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleOpen}
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 rounded-full shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        aria-label="Toggle feedback form"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 fill-current" />}
      </button>
    </div>
  );
}
