// Mood config and scoreColor utility
const MOOD = {
  great:      { emoji: '😄', label: 'Great',      color: '#5a8a78', bg: 'rgba(90,138,120,0.12)'  },
  good:       { emoji: '🙂', label: 'Good',       color: '#7c9e8f', bg: 'rgba(124,158,143,0.12)' },
  okay:       { emoji: '😐', label: 'Okay',       color: '#c4a882', bg: 'rgba(196,168,130,0.15)' },
  low:        { emoji: '😔', label: 'Low',        color: '#c08060', bg: 'rgba(192,128,96,0.12)'  },
  struggling: { emoji: '😟', label: 'Struggling', color: '#b85c5c', bg: 'rgba(184,92,92,0.12)'   },
};

function scoreColor(s) {
  if (s >= 75) return { text: '#5a8a78', bg: 'rgba(90,138,120,0.1)',  bar: '#5a8a78' };
  if (s >= 55) return { text: '#7c9e8f', bg: 'rgba(124,158,143,0.1)', bar: '#7c9e8f' };
  if (s >= 40) return { text: '#c4a882', bg: 'rgba(196,168,130,0.1)', bar: '#c4a882' };
  return              { text: '#b85c5c', bg: 'rgba(184,92,92,0.1)',   bar: '#b85c5c' };
}

export { MOOD, scoreColor };
