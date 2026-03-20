
import { useState, useEffect } from 'react';
import { fetchEvents, createEvent } from '../service/eventService';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TrendChart from '../components/TrendChart';

import { MOOD, scoreColor } from '../components/moodUtils';
import { buildThirtyDays, TEAM_SIZE, MOCK_EMPLOYEES } from '../components/thirtyDayUtils';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';

const THIRTY_DAY_DATA = buildThirtyDays();

/* ─────────────────────────────────────────────
   DASHBOARD PAGE
───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'done' | 'pending'
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const surveyDoneToday = MOCK_EMPLOYEES.filter(e => e.surveyDone).length;
  const avgScore = Math.round(MOCK_EMPLOYEES.reduce((s, e) => s + e.score, 0) / MOCK_EMPLOYEES.length);
  const atRisk = MOCK_EMPLOYEES.filter(e => e.score < 45).length;

  const filtered = MOCK_EMPLOYEES.filter(e => {
    if (filter === 'done')    return e.surveyDone;
    if (filter === 'pending') return !e.surveyDone;
    return true;
  });

  // Fetch events from backend on mount
  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  // Add event to backend and update state
  const handleAddEvent = async (event) => {
    try {
      const saved = await createEvent(event);
      setEvents(prev => [...prev, saved]);
      setShowEventForm(false);
    } catch {
      // Optionally show an error
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] font-body text-[var(--text-base)] pb-20">

      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <nav id="navBar" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border-soft)] px-6 lg:px-10 py-4 flex items-center relative">
        {/* Centered DeTask */}
        <span className="absolute left-1/2 -translate-x-1/2 font-display italic font-light text-[1.7rem] text-[var(--sage-deep)] tracking-wide px-4 py-1">
          DeTask
        </span>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-3 mr-2">
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
          <div id='mood-distribution' className="bg-white rounded-2xl border border-[var(--border-soft)] shadow-[0_2px_16px_rgba(100,80,60,0.06)] p-6 animate-fade-up-2">
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
        
        {/* Events Section */}
        <div className="mt-16 mb-8 pb-24">
          <h2 id="upcoming-events-header" className="font-display text-[1.3rem] font-normal mb-4 text-center">Upcoming Team Events</h2>
          <EventList events={events} />
          {!showEventForm && (
            <div className="flex justify-center">
              <button id="create-event-btn"
                className="bg-gradient-to-r from-[var(--sage)] to-[var(--sage-deep)] text-white font-semibold rounded-xl px-7 py-3 mt-4 shadow-lg hover:scale-[1.04] hover:shadow-xl transition-all duration-150"
                onClick={() => setShowEventForm(true)}
              >
                Create Event
              </button>
            </div>
          )}
          {showEventForm && (
            <EventForm id="eventform" onAddEvent={handleAddEvent} />
          )}
        </div>
        {/* Large visible test div for bottom spacing */}
        <div id="bottom-spacing" className="w-full flex flex-col items-center mt-12">
          <hr className="w-1/2 border-t-2 border-white opacity-70 mb-2" />
          <div id="DeTaskInc" className="w-full h-32 bg-red-500 text-white flex items-center justify-center text-2xl font-bold rounded-t-2xl shadow-lg">
            DeTask inc.
          </div>
        </div>
      </div>
    </div>
  );
}