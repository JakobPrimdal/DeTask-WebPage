import React from 'react';

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

export default TrendChart;
