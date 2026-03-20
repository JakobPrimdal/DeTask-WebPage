// Utility to build 30-day data
const TEAM_SIZE = 12;
const MOCK_EMPLOYEES = [
  { id: 1, score: 82, mood: 'great',   surveyDone: true,  trend: [70,74,78,75,80,79,82] },
  { id: 2, score: 61, mood: 'okay',    surveyDone: true,  trend: [68,65,63,60,62,61,61] },
  { id: 3, score: 45, mood: 'low',     surveyDone: true,  trend: [55,52,50,47,46,45,45] },
  { id: 4, score: 90, mood: 'great',   surveyDone: true,  trend: [82,84,86,87,89,90,90] },
  { id: 6, score: 38, mood: 'low',     surveyDone: true,  trend: [50,48,44,41,39,38,38] },
  { id: 7, score: 77, mood: 'good',    surveyDone: true,  trend: [72,73,75,74,76,77,77] },
  { id: 9, score: 88, mood: 'great',   surveyDone: true,  trend: [80,82,83,85,86,87,88] },
  { id: 10, score: 29, mood: 'struggling', surveyDone: true,  trend: [45,40,36,33,31,30,29] },
  { id: 12, score: 71, mood: 'good',   surveyDone: true,  trend: [68,69,70,70,71,71,71] },
];

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

export { buildThirtyDays, TEAM_SIZE, MOCK_EMPLOYEES };
