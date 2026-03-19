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

// 30-day history: survey completions + avg wellbeing score per day
function buildThirtyDays() {
  const today = new Date();
  const pseudo = (seed) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };
  return Array.from({ length: 30 }, (_, idx) => {
    const i = 29 - idx;
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 4 : 8;
    const drift = Math.round(idx / 29 * 2);
    const noise = Math.round((pseudo(i * 7) - 0.5) * 4);
    const count = i === 0
      ? MOCK_EMPLOYEES.filter(e => e.surveyDone).length
      : Math.min(TEAM_SIZE, Math.max(2, base + drift + noise));
    const scoreBase = 60 + idx / 29 * 7;
    const scoreNoise = (pseudo(i * 13) - 0.5) * 11;
    const avgScore = i === 0
      ? Math.round(MOCK_EMPLOYEES.reduce((s, e) => s + e.score, 0) / MOCK_EMPLOYEES.length)
      : Math.min(92, Math.max(38, Math.round(scoreBase + scoreNoise)));
    return { label, count, avgScore, isToday: i === 0 };
  });
}
const THIRTY_DAY_DATA = buildThirtyDays();

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
   DUAL-SERIES 30-DAY TREND CHART
   Left Y  → survey completions (sage green)
   Right Y → avg wellbeing score (dusty rose)
───────────────────────────────────────────── */
function TrendChart({ data, teamSize }) {
  const W = 900, H = 180;
  const PAD = { top: 24, right: 52, bottom: 38, left: 42 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const toX     = (i) => PAD.left + (i / (data.length - 1)) * iW;
  const toYLeft = (v) => PAD.top + iH - (v / teamSize) * iH;
  const toYRight= (v) => PAD.top + iH - ((v - 30) / (100 - 30)) * iH;

  const bezier = (pts) => pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const surveyPts = data.map((d, i) => ({ x: toX(i), y: toYLeft(d.count) }));
  const scorePts  = data.map((d, i) => ({ x: toX(i), y: toYRight(d.avgScore) }));
  const surveyLine = bezier(surveyPts);
  const scoreLine  = bezier(scorePts);
  const surveyArea = `${surveyLine} L ${surveyPts[surveyPts.length-1].x} ${PAD.top+iH} L ${surveyPts[0].x} ${PAD.top+iH} Z`;
  const scoreArea  = `${scoreLine} L ${scorePts[scorePts.length-1].x} ${PAD.top+iH} L ${scorePts[0].x} ${PAD.top+iH} Z`;

  const todayIdx = data.length - 1;
  const todayS   = surveyPts[todayIdx];
  const todayW   = scorePts[todayIdx];
  const leftGrid  = [0, 3, 6, 9, teamSize];
  const rightGrid = [40, 55, 70, 85, 100];

  return (
    <div className="w-full" style={{ height: '190px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c9e8f" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7c9e8f" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#b8849a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#b8849a" stopOpacity="0.01" />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD.top + iH - f * iH;
          return <line key={f} x1={PAD.left} y1={y} x2={PAD.left+iW} y2={y}
            stroke="rgba(124,158,143,0.12)" strokeWidth="1" strokeDasharray="4 4" />;
        })}
        <line x1={PAD.left} y1={PAD.top+iH} x2={PAD.left+iW} y2={PAD.top+iH}
          stroke="rgba(124,158,143,0.2)" strokeWidth="1" />

        {/* Left Y labels — survey count */}
        {leftGrid.map(v => (
          <text key={`l${v}`} x={PAD.left-7} y={toYLeft(v)+4}
            textAnchor="end" fontSize="9" fill="rgba(90,138,120,0.7)" fontFamily="system-ui">{v}</text>
        ))}

        {/* Right Y labels — wellbeing score */}
        {rightGrid.map(v => (
          <text key={`r${v}`} x={PAD.left+iW+7} y={toYRight(v)+4}
            textAnchor="start" fontSize="9" fill="rgba(158,96,128,0.7)" fontFamily="system-ui">{v}</text>
        ))}

        {/* Today guide */}
        <line x1={todayS.x} y1={PAD.top} x2={todayS.x} y2={PAD.top+iH}
          stroke="rgba(90,138,120,0.18)" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Areas + lines */}
        <path d={surveyArea} fill="url(#sgGrad)" />
        <path d={scoreArea}  fill="url(#roseGrad)" />
        <path d={surveyLine} fill="none" stroke="#7c9e8f" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={scoreLine}  fill="none" stroke="#b8849a" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Today dots */}
        <circle cx={todayS.x} cy={todayS.y} r="5.5" fill="#5a8a78" filter="url(#glow2)" />
        <circle cx={todayW.x} cy={todayW.y} r="5.5" fill="#9e6080" filter="url(#glow2)" />

        {/* Today value callouts */}
        <text x={todayS.x-12} y={todayS.y-12} textAnchor="middle"
          fontSize="11" fontWeight="700" fill="#5a8a78" fontFamily="system-ui">
          {data[todayIdx].count}
        </text>
        <text x={todayW.x+12} y={todayW.y-12} textAnchor="middle"
          fontSize="11" fontWeight="700" fill="#9e6080" fontFamily="system-ui">
          {data[todayIdx].avgScore}
        </text>

        {/* X-axis labels — every 5th + today */}
        {data.map((d, i) => {
          const isToday = i === todayIdx;
          if (!isToday && i % 5 !== 0) return null;
          return (
            <text key={i} x={toX(i)} y={H-4} textAnchor="middle"
              fontSize="9.5"
              fontWeight={isToday ? '700' : '400'}
              fill={isToday ? '#5a8a78' : 'rgba(138,126,118,0.6)'}
              fontFamily="system-ui">
              {isToday ? `${d.label} ✦` : d.label}
            </text>
          );
        })}
      </svg>
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

        {/* ── FULL-WIDTH 30-day dual trend chart ──────────────────────── */}
        <div className="mb-4 animate-fade-up-2">
          <div className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.06)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-[1.25rem] font-normal text-[var(--text-base)]">30-day team trends</h2>
                <p className="text-[0.78rem] text-[var(--text-faint)] mt-0.5">Past 30 days · today highlighted ✦</p>
              </div>
              <div className="flex flex-wrap items-center gap-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-[3px] rounded-full bg-[#7c9e8f]" />
                  <span className="text-[0.75rem] font-medium text-[var(--text-muted)]">Survey completions</span>
                  <span className="text-[0.72rem] bg-[rgba(90,138,120,0.1)] text-[var(--sage-deep)] rounded-full px-2.5 py-0.5 font-medium">{surveyDoneToday}/{TEAM_SIZE} today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-[3px] rounded-full bg-[#b8849a]" />
                  <span className="text-[0.75rem] font-medium text-[var(--text-muted)]">Avg wellbeing score</span>
                  <span className="text-[0.72rem] bg-[rgba(184,132,154,0.1)] text-[#9e6080] rounded-full px-2.5 py-0.5 font-medium">{avgScore}/100 today</span>
                </div>
              </div>
            </div>
            <TrendChart data={THIRTY_DAY_DATA} teamSize={TEAM_SIZE} />
          </div>
        </div>

        {/* ── MOOD DISTRIBUTION ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.06)] p-6 animate-fade-up-2">
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
          <div className="hidden lg:block" />
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