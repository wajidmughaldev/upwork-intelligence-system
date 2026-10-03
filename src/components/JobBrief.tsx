import React from 'react';
import { FileText, CheckCircle2, Clock, DollarSign, Briefcase, Zap, Layers } from 'lucide-react';
import { OriginalJobBrief } from '../types';

interface JobBriefProps {
  brief: OriginalJobBrief;
}

export const JobBrief: React.FC<JobBriefProps> = ({ brief }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Original Job Brief (Raw Upwork Posting)
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Source Verification
        </span>
      </div>

      {/* Meta Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Job Type:</span>
          <span className="font-bold text-slate-900">{brief.jobType}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Budget:</span>
          <span className="font-bold text-emerald-700">{brief.budget}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Experience:</span>
          <span className="font-bold text-slate-900">{brief.experienceLevel}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Timeline:</span>
          <span className="font-bold text-slate-900">{brief.timeline || 'Flexible'}</span>
        </div>
      </div>

      {/* Original Description */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-700">Original Job Description</h4>
        <p className="text-xs text-slate-800 leading-relaxed font-sans bg-slate-50/70 p-3.5 rounded border border-slate-200 whitespace-pre-line">
          {brief.description}
        </p>
      </div>

      {/* Deliverables */}
      {brief.deliverables && brief.deliverables.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-700">Specified Deliverables</h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {brief.deliverables.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Skills */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-700">Required Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {brief.requiredSkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
