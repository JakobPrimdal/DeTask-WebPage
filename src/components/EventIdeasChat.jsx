import React, { useState } from 'react';
import { fetchGeminiIdeas } from '../service/apiService';

const EVENT_IDEAS = [
  'Team Lunch at a Local Restaurant',
  'Friday Game Night',
  'Wellness Workshop',
  'Outdoor Team Building',
  'Monthly Book Club',
  'Hackathon Weekend',
  'Yoga or Meditation Session',
  'Charity Volunteering Day',
  'Office Decorating Contest',
  'Guest Speaker Series',
];


function getRandomIdea(existingIdeas) {
  const ALL_IDEAS = [
    ...EVENT_IDEAS,
    'Virtual Coffee Break',
    'Office Scavenger Hunt',
    'Lunch & Learn',
    'Pet Photo Contest',
    'DIY Craft Hour',
    'Board Game Tournament',
    'Karaoke Night',
    'Cooking Challenge',
    'Themed Dress Day',
    'Trivia Competition',
    'Mini Hackathon',
    'Open Mic Session',
    'Speed Networking',
    'Wellness Walk',
    'Team Podcast Recording',
    'Silent Disco',
    'Escape Room',
    'Innovation Jam',
    'Charity Auction',
    'Photo Day',
  ];
  const unused = ALL_IDEAS.filter(idea => !existingIdeas.includes(idea));
  if (unused.length === 0) return null;
  return unused[Math.floor(Math.random() * unused.length)];
}
function EventIdeasChat() {
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch ideas from Gemini when chat opens
  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const geminiIdeas = await fetchGeminiIdeas();
      setIdeas(geminiIdeas);
    } catch (err) {
      setError('Could not fetch ideas from Gemini.');
    }
    setLoading(false);
  };

  // Fetch more ideas from Gemini and REPLACE the list with a new batch
  const handleGenerateMore = async () => {
    setLoading(true);
    setError('');
    try {
      const geminiIdeas = await fetchGeminiIdeas(ideas);
      setIdeas(geminiIdeas);
    } catch (err) {
      setError('Could not fetch more ideas.');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[10000]"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000 }}
    >
      {/* Chat Button */}
      {!open && (
        <button
          className="bg-gradient-to-br from-[var(--sage)] to-[var(--sage-deep)] text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-2xl font-bold hover:scale-105 transition-all"
          onClick={handleOpen}
          aria-label="Open Event Ideas Chat"
        >
          💡
        </button>
      )}
      {/* Chat Window */}
      {open && (
        <div className="w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-[var(--border-soft)] flex flex-col animate-fade-up-2">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-soft)] bg-[var(--cream)] rounded-t-2xl">
            <span className="font-display text-lg font-semibold text-[var(--sage-deep)]">Event Ideas</span>
            <button
              className="text-[var(--sage-deep)] text-xl font-bold hover:text-[var(--sage)] transition-all"
              onClick={() => setOpen(false)}
              aria-label="Close Chat"
            >
              ×
            </button>
          </div>
          <div className="p-5 flex-1 overflow-y-auto max-h-72">
            {loading && <div className="text-center text-[var(--sage)]">Loading ideas...</div>}
            {error && <div className="text-center text-red-500 mb-2">{error}</div>}
            <ul className="space-y-3">
              {ideas.slice(0, 10).map((idea, idx) => (
                <li key={idx} className="bg-[var(--cream)] rounded-lg px-4 py-2 text-[var(--text-base)] shadow-sm">
                  {idea.length > 120 ? idea.slice(0, 117) + '…' : idea}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="mx-5 mb-5 mt-1 py-2 px-4 rounded-lg bg-gradient-to-br from-[var(--sage)] to-[var(--sage-deep)] text-white font-semibold shadow hover:scale-105 transition-all disabled:opacity-60"
            onClick={handleGenerateMore}
            disabled={loading}
          >
            Generate More Ideas
          </button>
        </div>
      )}
    </div>
  );
}
export default EventIdeasChat;
