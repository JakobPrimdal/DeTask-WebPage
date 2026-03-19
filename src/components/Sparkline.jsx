import React from 'react';

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

export default Sparkline;
