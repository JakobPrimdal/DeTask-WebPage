import React from 'react';
import Sparkline from './Sparkline';

function EmployeeCard({ emp, index, scoreColor, MOOD }) {
  const sc = scoreColor(emp.score);
  const mood = MOOD[emp.mood];
  const trendDir = emp.trend[6] >= emp.trend[5] ? 'up' : 'down';
  const trendDiff = Math.abs(emp.trend[6] - emp.trend[0]);

  return (
    <div
      className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.05)] p-5 flex flex-col gap-4 animate-fade-up-3 hover:shadow-[0_6px_28px_rgba(100,80,60,0.1)] hover:-translate-y-0.5 transition-all duration-200"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        {/* Anonymous avatar */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[0.75rem] font-medium"
            style={{ background: sc.bg, color: sc.text }}
          >
            #{emp.id}
          </div>
          <span className="text-[0.82rem] font-medium text-[var(--text-muted)] tracking-wide">
            Team member
          </span>
        </div>

        {/* Survey badge */}
        <span
          className="text-[0.68rem] font-medium tracking-wide px-2.5 py-1 rounded-full"
          style={emp.surveyDone
            ? { background: 'rgba(90,138,120,0.12)', color: '#5a8a78' }
            : { background: 'rgba(196,168,130,0.15)', color: '#a8845c' }
          }
        >
          {emp.surveyDone ? '✓ Done today' : '– Pending'}
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[0.72rem] uppercase tracking-[0.08em] text-[var(--text-faint)] font-medium">Wellbeing score</span>
          <span className="text-[1.1rem] font-display font-medium" style={{ color: sc.text }}>{emp.score}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--cream)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${emp.score}%`, background: sc.bar, opacity: 0.85 }}
          />
        </div>
      </div>

      {/* Mood + sparkline row */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[0.8rem] font-medium"
          style={{ background: mood.bg, color: mood.color }}
        >
          <span>{mood.emoji}</span>
          <span>{mood.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <Sparkline data={emp.trend} color={sc.bar} />
          <span
            className="text-[0.72rem] font-medium flex items-center gap-0.5"
            style={{ color: trendDir === 'up' ? '#5a8a78' : '#b85c5c' }}
          >
            {trendDir === 'up' ? '↑' : '↓'} {trendDiff}
          </span>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCard;
