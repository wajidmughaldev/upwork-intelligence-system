import React from 'react';
import { Star, DollarSign, Briefcase, MapPin, MessageSquareText } from 'lucide-react';
import { ClientInfo } from '../types';

interface ClientSummaryProps {
  client: ClientInfo;
  compact?: boolean;
}

export const ClientSummary: React.FC<ClientSummaryProps> = ({ client, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1 font-semibold text-slate-900">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          {client.rating.toFixed(1)}
        </span>
        <span>•</span>
        <span className="font-medium text-slate-700">{client.totalSpent} spent</span>
        <span>•</span>
        <span>{client.location}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        Client Intelligence
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
          Verified Payment
        </span>
      </h4>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded bg-amber-50 text-amber-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{client.rating.toFixed(1)} / 5.0</div>
            <div className="text-[11px] text-slate-500">{client.reviewsCount} reviews</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded bg-emerald-50 text-emerald-600">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{client.totalSpent}</div>
            <div className="text-[11px] text-slate-500">Total Spend</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded bg-blue-50 text-blue-600">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{client.hireRate} Hire Rate</div>
            <div className="text-[11px] text-slate-500">{client.jobsPosted} jobs posted</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded bg-slate-100 text-slate-600">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{client.location}</div>
            <div className="text-[11px] text-slate-500">Location</div>
          </div>
        </div>
      </div>

      {client.feedbackSummary && (
        <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded">
          <MessageSquareText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="italic">"{client.feedbackSummary}"</p>
        </div>
      )}
    </div>
  );
};
