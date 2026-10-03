import React from 'react';

interface OpportunityScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OpportunityScore: React.FC<OpportunityScoreProps> = ({ score, size = 'md', showLabel = true }) => {
  let colorBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let badgeColor = 'bg-emerald-600';
  let label = 'Strong Match';

  if (score >= 90) {
    colorBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    badgeColor = 'bg-emerald-600';
    label = 'Strong Match';
  } else if (score >= 80) {
    colorBg = 'bg-blue-50 text-blue-800 border-blue-200';
    badgeColor = 'bg-blue-600';
    label = 'Good Match';
  } else if (score >= 70) {
    colorBg = 'bg-amber-50 text-amber-800 border-amber-200';
    badgeColor = 'bg-amber-600';
    label = 'Moderate';
  } else {
    colorBg = 'bg-rose-50 text-rose-800 border-rose-200';
    badgeColor = 'bg-rose-600';
    label = 'Low Signal';
  }

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${colorBg}`}>
        <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
        <span>Score: {score}/100</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-xl border flex items-center justify-between ${colorBg}`}>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide opacity-80">Opportunity Score</div>
          <div className="text-3xl font-extrabold tracking-tight mt-0.5">{score} <span className="text-sm font-normal opacity-70">/ 100</span></div>
        </div>
        {showLabel && (
          <span className={`px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-2xs ${badgeColor}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${colorBg}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`}></span>
      <span className="font-bold">{score} / 100</span>
      {showLabel && <span className="opacity-75">• {label}</span>}
    </div>
  );
};
