import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
   MOCK DATA  (swap for real API calls later)
───────────────────────────────────────────── */
const TEAM_SIZE = 12;

// Each entry = one anonymous employee slot
// score: 0-100, mood: emoji key, surveyDone: bool today, trend: array of 7 daily scores
const MOCK_EMPLOYEES = [
  { id: 1, score: 82, mood: 'great',   surveyDone: true,  trend: [70,74,78,75,80,79,82] },
  { id: 2, score: 61, mood: 'okay',    surveyDone: true,  trend: [68,65,63,60,62,61,61] },
  { id: 3, score: 45, mood: 'low',     surveyDone: true,  trend: [55,52,50,47,46,45,45] },
  { id: 4, score: 90, mood: 'great',   surveyDone: true,  trend: [82,84,86,87,89,90,90] },
  { id: 5, score: 73, mood: 'good',    surveyDone: false, trend: [70,71,72,73,72,73,73] },
  { id: 6, score: 38, mood: 'low',     surveyDone: true,  trend: [50,48,44,41,39,38,38] },
  { id: 7, score: 77, mood: 'good',    surveyDone: true,  trend: [72,73,75,74,76,77,77] },
  { id: 8, score: 55, mood: 'okay',    surveyDone: false, trend: [60,58,56,55,55,55,55] },
  { id: 9, score: 88, mood: 'great',   surveyDone: true,  trend: [80,82,83,85,86,87,88] },
  { id: 10, score: 29, mood: 'struggling', surveyDone: true,  trend: [45,40,36,33,31,30,29] },
  { id: 11, score: 67, mood: 'good',   surveyDone: false, trend: [65,66,66,67,67,67,67] },
  { id: 12, score: 71, mood: 'good',   surveyDone: true,  trend: [68,69,70,70,71,71,71] },
];

// Last 7 days survey completion counts
const WEEK_SURVEY_DATA = [
  { day: 'Mon', count: 8 },
  { day: 'Tue', count: 10 },
  { day: 'Wed', count: 7 },
  { day: 'Thu', count: 11 },
  { day: 'Fri', count: 9 },
  { day: 'Sat', count: 5 },
  { day: 'Sun', count: MOCK_EMPLOYEES.filter(e => e.surveyDone).length },
];

/* ─────────────────────────────────────────────
   MOOD CONFIG
───────────────────────────────────────────── */
const MOOD = {
  great:      { emoji: '😄', label: 'Great',      color: '#5a8a78', bg: 'rgba(90,138,120,0.12)'  },
  good:       { emoji: '🙂', label: 'Good',       color: '#7c9e8f', bg: 'rgba(124,158,143,0.12)' },
  okay:       { emoji: '😐', label: 'Okay',       color: '#c4a882', bg: 'rgba(196,168,130,0.15)' },
  low:        { emoji: '😔', label: 'Low',        color: '#c08060', bg: 'rgba(192,128,96,0.12)'  },
  struggling: { emoji: '😟', label: 'Struggling', color: '#b85c5c', bg: 'rgba(184,92,92,0.12)'   },
};

/* score → colour band */
function scoreColor(s) {
  if (s >= 75) return { text: '#5a8a78', bg: 'rgba(90,138,120,0.1)',  bar: '#5a8a78' };
  if (s >= 55) return { text: '#7c9e8f', bg: 'rgba(124,158,143,0.1)', bar: '#7c9e8f' };
  if (s >= 40) return { text: '#c4a882', bg: 'rgba(196,168,130,0.1)', bar: '#c4a882' };
  return              { text: '#b85c5c', bg: 'rgba(184,92,92,0.1)',   bar: '#b85c5c' };
}

/* ─────────────────────────────────────────────
   TINY SPARKLINE (7-day trend)
───────────────────────────────────────────── */
function Sparkline({ data, color }) {
  const W = 64, H = 28;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const last = pts[pts.length - 1].split(',');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <polyline points={polyline} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SURVEY BAR CHART (week overview)
───────────────────────────────────────────── */
function WeekChart({ data, total }) {
  const maxVal = total;
  return (
    <div className="flex items-end gap-2 h-[80px]">
      {data.map((d, i) => {
        const pct = (d.count / maxVal) * 100;
        const isToday = i === data.length - 1;
        return (
          <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[0.65rem] text-[var(--text-faint)] font-medium">{d.count}</span>
            <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: `${Math.max(pct * 0.6, 6)}px` }}>
              <div
                className="absolute inset-0 rounded-t-lg transition-all duration-700"
                style={{
                  background: isToday
                    ? 'linear-gradient(to top, var(--sage-deep), var(--sage))'
                    : 'rgba(124,158,143,0.25)',
                }}
              />
            </div>
            <span className={`text-[0.65rem] font-medium ${isToday ? 'text-[var(--sage)]' : 'text-[var(--text-faint)]'}`}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   EMPLOYEE CARD (anonymous)
───────────────────────────────────────────── */
function EmployeeCard({ emp, index }) {
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

/* ─────────────────────────────────────────────
   DASHBOARD PAGE
───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'done' | 'pending'

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const surveyDoneToday = MOCK_EMPLOYEES.filter(e => e.surveyDone).length;
  const avgScore = Math.round(MOCK_EMPLOYEES.reduce((s, e) => s + e.score, 0) / MOCK_EMPLOYEES.length);
  const atRisk = MOCK_EMPLOYEES.filter(e => e.score < 45).length;

  const filtered = MOCK_EMPLOYEES.filter(e => {
    if (filter === 'done')    return e.surveyDone;
    if (filter === 'pending') return !e.surveyDone;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--cream)] font-body text-[var(--text-base)]">

      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border-soft)] px-6 lg:px-10 py-4 flex items-center justify-between">
        <span className="font-display italic font-light text-[1.7rem] text-[var(--sage-deep)] tracking-wide">
          DeTask
        </span>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[0.83rem] text-[var(--text-muted)]">{today}</span>
          <button
            onClick={() => navigate('/')}
            className="text-[0.82rem] font-medium text-[var(--text-muted)] hover:text-[var(--text-base)] bg-[var(--cream)] hover:bg-[#ede7de] border border-[var(--border-soft)] rounded-xl px-4 py-2 transition-all duration-150"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <div className="mb-10 animate-fade-up-1">
          <h1 className="font-display font-normal text-[2.4rem] leading-tight mb-1">
            Team Wellbeing Overview
          </h1>
          <p className="text-[0.95rem] text-[var(--text-muted)] font-light">
            All data is anonymous. Individual identities are never tracked.
          </p>
        </div>

        {/* ── STAT CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Team size"
            value={TEAM_SIZE}
            sub="total members"
            accent="var(--text-base)"
            icon="👥"
            delay="0s"
          />
          <StatCard
            label="Surveys today"
            value={`${surveyDoneToday}/${TEAM_SIZE}`}
            sub={`${Math.round((surveyDoneToday / TEAM_SIZE) * 100)}% completion`}
            accent="var(--sage-deep)"
            icon="📋"
            delay="0.08s"
          />
          <StatCard
            label="Avg. wellbeing"
            value={avgScore}
            sub="out of 100"
            accent={avgScore >= 65 ? 'var(--sage-deep)' : avgScore >= 45 ? '#c4a882' : '#b85c5c'}
            icon="💚"
            delay="0.16s"
          />
          <StatCard
            label="Needs attention"
            value={atRisk}
            sub={atRisk === 0 ? 'everyone doing well' : `score below 45`}
            accent={atRisk === 0 ? 'var(--sage-deep)' : '#b85c5c'}
            icon={atRisk === 0 ? '✅' : '⚠️'}
            delay="0.24s"
          />
        </div>

        {/* ── TWO-COL: survey chart + mood breakdown ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">

          {/* Survey 7-day chart */}
          <div className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.06)] p-6 animate-fade-up-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-[1.2rem] font-normal text-[var(--text-base)]">Survey completions</h2>
                <p className="text-[0.78rem] text-[var(--text-faint)] mt-0.5">Past 7 days · today highlighted</p>
              </div>
              <div className="text-[0.72rem] font-medium bg-[rgba(90,138,120,0.1)] text-[var(--sage-deep)] rounded-full px-3 py-1">
                {surveyDoneToday} today
              </div>
            </div>
            <WeekChart data={WEEK_SURVEY_DATA} total={TEAM_SIZE} />
          </div>

          {/* Mood distribution */}
          <div className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.06)] p-6 animate-fade-up-2 [animation-delay:0.1s]">
            <div className="mb-5">
              <h2 className="font-display text-[1.2rem] font-normal text-[var(--text-base)]">Mood distribution</h2>
              <p className="text-[0.78rem] text-[var(--text-faint)] mt-0.5">Today's anonymous responses</p>
            </div>
            <div className="space-y-3">
              {Object.entries(MOOD).map(([key, m]) => {
                const count = MOCK_EMPLOYEES.filter(e => e.mood === key).length;
                const pct = Math.round((count / TEAM_SIZE) * 100);
                if (count === 0) return null;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-[1.1rem] w-6 text-center">{m.emoji}</span>
                    <span className="text-[0.82rem] font-medium w-20 text-[var(--text-muted)]">{m.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[var(--cream)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: m.color, opacity: 0.75 }}
                      />
                    </div>
                    <span className="text-[0.78rem] font-medium w-6 text-right" style={{ color: m.color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── EMPLOYEE CARDS ──────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-up-2">
          <div>
            <h2 className="font-display text-[1.4rem] font-normal">Anonymous member scores</h2>
            <p className="text-[0.8rem] text-[var(--text-faint)] mt-0.5">No names, no identifiers — wellbeing only</p>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2">
            {[
              { key: 'all',     label: `All (${TEAM_SIZE})` },
              { key: 'done',    label: `✓ Done (${surveyDoneToday})` },
              { key: 'pending', label: `– Pending (${TEAM_SIZE - surveyDoneToday})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="text-[0.78rem] font-medium px-4 py-1.5 rounded-full border transition-all duration-150"
                style={filter === f.key
                  ? { background: 'var(--sage)', color: '#fff', borderColor: 'var(--sage)' }
                  : { background: '#fff', color: 'var(--text-muted)', borderColor: 'var(--border-soft)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp, i) => (
            <EmployeeCard key={emp.id} emp={emp} index={i} />
          ))}
        </div>

        {/* Bottom breathing room */}
        <div className="h-16" />
      </div>
    </div>
  );
}