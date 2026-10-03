import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { AnalysisConfidence } from '../types';

interface ConfidenceBadgeProps {
  confidence: AnalysisConfidence;
  explanation?: string;
  size?: 'sm' | 'md' | 'lg';
  showExplanation?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  explanation,
  size = 'md',
  showExplanation = false
}) => {
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let indicatorColor = 'bg-emerald-500';

  if (confidence === 'High') {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    indicatorColor = 'bg-emerald-500';
  } else if (confidence === 'Medium') {
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
    indicatorColor = 'bg-blue-500';
  } else {
    badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
    indicatorColor = 'bg-slate-500';
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`}></span>
        <span>Confidence: {confidence.toUpperCase()}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-xl border flex flex-col justify-between ${badgeColor}`}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider opacity-75">Analysis Confidence</div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 border border-current shadow-2xs">
            {confidence.toUpperCase()}
          </span>
        </div>
        <div className="mt-2 text-xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-current shrink-0" />
          <span>{confidence} Confidence</span>
        </div>
        {explanation && (
          <p className="mt-2 text-xs opacity-90 leading-relaxed font-sans border-t border-current/15 pt-2">
            {explanation}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}>
        <span className={`w-2 h-2 rounded-full ${indicatorColor}`}></span>
        <span>Confidence: <strong className="font-bold">{confidence.toUpperCase()}</strong></span>
      </div>
      {showExplanation && explanation && (
        <p className="text-[11px] text-slate-500 leading-snug">
          {explanation}
        </p>
      )}
    </div>
  );
};
