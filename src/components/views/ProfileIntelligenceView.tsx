import React, { useState } from 'react';
import { UserProfile, PortfolioItem } from '../../types';
import { UserCheck, Sliders, Plus, Trash2, Edit2, Check, Sparkles, X } from 'lucide-react';

interface ProfileIntelligenceViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const ProfileIntelligenceView: React.FC<ProfileIntelligenceViewProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(profile.portfolio);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOutcome, setFormOutcome] = useState('');
  const [showModal, setShowModal] = useState(false);

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormTitle('');
    setFormTech('');
    setFormDesc('');
    setFormOutcome('');
    setShowModal(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormTech(item.technologies.join(', '));
    setFormDesc(item.description);
    setFormOutcome(item.outcome);
    setShowModal(true);
  };

  const handleSavePortfolio = () => {
    if (!formTitle.trim()) return;

    if (modalMode === 'add') {
      const item: PortfolioItem = {
        id: `port-${Date.now()}`,
        title: formTitle,
        technologies: formTech.split(',').map(t => t.trim()).filter(Boolean),
        description: formDesc,
        outcome: formOutcome
      };
      const updated = [item, ...portfolio];
      setPortfolio(updated);
      onUpdateProfile({ portfolio: updated });
    } else if (modalMode === 'edit' && editingId) {
      const updated = portfolio.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            title: formTitle,
            technologies: formTech.split(',').map(t => t.trim()).filter(Boolean),
            description: formDesc,
            outcome: formOutcome
          };
        }
        return p;
      });
      setPortfolio(updated);
      onUpdateProfile({ portfolio: updated });
    }

    setShowModal(false);
  };

  const handleDeletePortfolio = (id: string) => {
    const updated = portfolio.filter(p => p.id !== id);
    setPortfolio(updated);
    onUpdateProfile({ portfolio: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-2 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">Profile Intelligence & Match Engine</h2>
        <p className="text-xs text-slate-500">Configure synced Upwork profile parameters and AI scoring rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Synced Upwork Profile Data */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Synced Upwork Profile Data
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {profile.jss}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Public Headline Title</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{profile.title}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500">Hourly Rate:</span>
                <div className="font-bold text-slate-900">{profile.hourlyRate}</div>
              </div>
              <div>
                <span className="text-slate-500">Hours Billed:</span>
                <div className="font-bold text-slate-900">{profile.totalHours}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-slate-500 font-medium block">Main Categories</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.categories.map((cat, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-slate-500 font-medium block">Synced Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Custom AI Intelligence Profile */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              Custom Intelligence Rules
            </h3>
            <span className="text-xs text-blue-600 font-semibold">Active Engine</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Min Fixed Budget ($)</label>
                <input
                  type="number"
                  value={profile.preferences.minFixedBudget}
                  onChange={(e) => onUpdateProfile({
                    preferences: { ...profile.preferences, minFixedBudget: Number(e.target.value) }
                  })}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Min Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  value={profile.preferences.minHourlyRate}
                  onChange={(e) => onUpdateProfile({
                    preferences: { ...profile.preferences, minHourlyRate: Number(e.target.value) }
                  })}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-slate-500 font-semibold block">Strongest Tech Stack Focus</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferences.strongestSkills.map((st, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-slate-500 font-semibold block">Avoided Job Categories</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferences.avoidedCategories.map((ac, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200">
                    {ac}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Portfolio Case Studies & Proof Items */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Relevant Portfolio Case Studies & Proof</h3>
            <p className="text-xs text-slate-500">AI pulls metric proof from these items for customized proposal generation</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Portfolio Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                      title="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>
                <div className="mt-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100">
                  Outcome: {item.outcome}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {item.technologies.map((t, i) => (
                  <span key={i} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Portfolio Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'add' ? 'Add Portfolio Proof Item' : 'Edit Portfolio Proof Item'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe Payment Integration Suite"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  placeholder="Laravel, React, Stripe API"
                  value={formTech}
                  onChange={(e) => setFormTech(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Built custom billing integration..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quantifiable Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. Handled $1M+ in ARR with 0 billing errors"
                  value={formOutcome}
                  onChange={(e) => setFormOutcome(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePortfolio}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                {modalMode === 'add' ? 'Save Item' : 'Update Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
