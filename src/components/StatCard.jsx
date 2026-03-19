import React from 'react';

function StatCard({ label, value, sub, accent, icon, delay = '0s' }) {
  return (
    <div
      className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.06)] p-6 flex flex-col gap-2 animate-fade-up-2"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] font-medium tracking-[0.08em] uppercase text-[var(--text-muted)]">{label}</span>
        <span className="text-[1.4rem]">{icon}</span>
      </div>
      <div className="text-[2.4rem] font-display font-normal leading-none" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-[0.8rem] text-[var(--text-faint)]">{sub}</div>}
    </div>
  );
}

export default StatCard;
