import React from 'react';
import { DetailedBreakdown } from '../types';

interface ScoreBreakdownProps {
  breakdown: DetailedBreakdown;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  const items = [
    { label: 'Technical Match', score: breakdown.technicalMatch, max: 25 },
    { label: 'Relevant Experience', score: breakdown.relevantExperience, max: 15 },
    { label: 'Portfolio Proof', score: breakdown.portfolioProof, max: 15 },
    { label: 'Client Quality', score: breakdown.clientQuality, max: 15 },
    { label: 'Budget Fit', score: breakdown.budgetFit, max: 10 },
    { label: 'Job Clarity', score: breakdown.jobClarity, max: 10 },
    { label: 'Connect Efficiency', score: breakdown.connectEfficiency, max: 5 },
    { label: 'Preferences', score: breakdown.preferences, max: 5 },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Score Breakdown Matrix
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item, idx) => {
          const pct = Math.round((item.score / item.max) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-semibold text-slate-900">
                  {item.score} <span className="text-slate-400 font-normal">/ {item.max}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
