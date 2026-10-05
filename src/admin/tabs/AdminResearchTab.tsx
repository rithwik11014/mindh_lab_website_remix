import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Cpu,
  Network,
  HeartPulse,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Sparkles
} from 'lucide-react';
import { ResearchPillar } from '../../types';

export const AdminResearchTab: React.FC = () => {
  const [researchList, setResearchList] = useState<ResearchPillar[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPillar, setEditingPillar] = useState<ResearchPillar | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    technologiesStr: '',
    metric1Label: 'Pulse Accuracy',
    metric1Value: '±1.4 BPM',
    metric2Label: 'Sampling Rate',
    metric2Value: '30 - 120 FPS',
    icon: 'Activity',
    grantNumber: '',
    status: 'Active Clinical Trials',
    published: true,
  });

  const getHeaders = () => {
    const token = localStorage.getItem('mindh_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchResearch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/research', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.research)) {
          setResearchList(data.research);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch research thrusts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  const openAddModal = () => {
    setEditingPillar(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      technologiesStr: 'rPPG Signal Extraction\nSpatial-Temporal Attention\nSub-pixel Motion Magnification',
      metric1Label: 'Accuracy',
      metric1Value: '±1.4 BPM',
      metric2Label: 'Throughput',
      metric2Value: '60 FPS',
      icon: 'Activity',
      grantNumber: 'NIH R01-EB032104',
      status: 'Active Clinical Trials',
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pillar: ResearchPillar) => {
    setEditingPillar(pillar);
    const m1 = pillar.metrics?.[0] || { label: '', value: '' };
    const m2 = pillar.metrics?.[1] || { label: '', value: '' };
    setFormData({
      title: pillar.title,
      subtitle: pillar.subtitle || '',
      description: pillar.description,
      technologiesStr: (pillar.technologies || []).join('\n'),
      metric1Label: m1.label,
      metric1Value: m1.value,
      metric2Label: m2.label,
      metric2Value: m2.value,
      icon: pillar.icon || 'Activity',
      grantNumber: pillar.grantNumber || '',
      status: pillar.status || 'Active',
      published: pillar.published !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required.');
      return;
    }

    setIsSaving(true);
    const technologies = formData.technologiesStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const metrics = [];
    if (formData.metric1Label && formData.metric1Value) {
      metrics.push({ label: formData.metric1Label.trim(), value: formData.metric1Value.trim() });
    }
    if (formData.metric2Label && formData.metric2Value) {
      metrics.push({ label: formData.metric2Label.trim(), value: formData.metric2Value.trim() });
    }

    const payload = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      description: formData.description.trim(),
      technologies,
      metrics,
      icon: formData.icon,
      grantNumber: formData.grantNumber.trim() || undefined,
      status: formData.status.trim() || 'Active',
      published: formData.published,
    };

    try {
      if (editingPillar) {
        const res = await fetch(`/api/research/${editingPillar.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Research thrust updated successfully.');
          setIsModalOpen(false);
          fetchResearch();
        } else {
          alert(data.message || 'Failed to update research thrust.');
        }
      } else {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('Research thrust created successfully.');
          setIsModalOpen(false);
          fetchResearch();
        } else {
          alert(data.message || 'Failed to create research thrust.');
        }
      }
    } catch (err: any) {
      alert(err?.message || 'Error occurred while saving research thrust.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/research/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Research thrust deleted.');
        setDeleteConfirmId(null);
        fetchResearch();
      } else {
        alert(data.message || 'Failed to delete research thrust.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error deleting research thrust.');
    }
  };

  const getPillarIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-maroon-400" />;
      case 'Network':
        return <Network className="w-5 h-5 text-maroon-400" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-maroon-400" />;
      case 'Activity':
      default:
        return <Activity className="w-5 h-5 text-maroon-400" />;
    }
  };

  const filteredResearch = researchList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.description.toLowerCase().includes(q) ||
      (item.grantNumber && item.grantNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl shadow-xl text-xs font-semibold border border-slate-700 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-maroon-500" />
            <span>Research Thrusts & Pillars</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage the core biomedical engineering and clinical informatics pillars displayed on the homepage.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-maroon-800 hover:bg-maroon-700 text-white text-xs font-bold shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Research Thrust</span>
        </button>
      </div>

      {/* Search & Statistics Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search thrusts, grants, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
          Total Thrusts: <span className="text-white font-bold">{filteredResearch.length}</span>
        </div>
      </div>

      {/* Research Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          Loading laboratory research thrusts...
        </div>
      ) : filteredResearch.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
          No research thrusts found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResearch.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                      {getPillarIcon(item.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                      <p className="text-xs text-maroon-400 font-medium">{item.subtitle}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.published !== false
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.published !== false ? 'Live' : 'Draft'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {item.description}
                </p>

                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {item.metrics && item.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-left">
                    {item.metrics.map((m, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-2 rounded-lg">
                        <span className="text-[9px] uppercase font-mono text-slate-400 block">
                          {m.label}
                        </span>
                        <span className="text-xs font-bold text-white">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  {item.grantNumber || item.status || 'Active Lab Thrust'}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Thrust"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1 bg-rose-950/80 px-2 py-1 rounded-lg border border-rose-900">
                      <span className="text-[10px] text-rose-300 font-medium">Delete?</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded hover:bg-rose-900 text-rose-200"
                        title="Confirm Delete"
                      >
                        <Check className="w-3 h-3 text-rose-400" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Thrust"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-maroon-500" />
                  <span>{editingPillar ? 'Edit Research Thrust' : 'Add New Research Thrust'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure translational physiological algorithms, technologies, and benchmark metrics.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Thrust Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Contactless Physiological Sensing"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Thrust Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Video-based rPPG & Thermal Imaging"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain the clinical methodology, sensing modality, and algorithmic aims..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
                  >
                    <option value="Activity">Activity (Pulse/Waveform)</option>
                    <option value="Cpu">Cpu (Processing/DSP)</option>
                    <option value="Network">Network (AI/Foundation)</option>
                    <option value="HeartPulse">HeartPulse (Clinical/Intervention)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Grant / Award</label>
                  <input
                    type="text"
                    value={formData.grantNumber}
                    onChange={(e) => setFormData({ ...formData, grantNumber: e.target.value })}
                    placeholder="e.g. NIH R01-EB032104"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="e.g. Active Clinical Trials"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-maroon-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Technologies & Methods (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.technologiesStr}
                  onChange={(e) => setFormData({ ...formData, technologiesStr: e.target.value })}
                  placeholder="rPPG Signal Extraction&#10;Spatial-Temporal Attention&#10;Sub-pixel Motion Magnification"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-maroon-600"
                />
              </div>

              {/* Metric 1 & Metric 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Key Clinical Performance Metrics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Metric 1 Label</label>
                    <input
                      type="text"
                      value={formData.metric1Label}
                      onChange={(e) => setFormData({ ...formData, metric1Label: e.target.value })}
                      placeholder="e.g. Pulse Accuracy"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Metric 1 Value</label>
                    <input
                      type="text"
                      value={formData.metric1Value}
                      onChange={(e) => setFormData({ ...formData, metric1Value: e.target.value })}
                      placeholder="e.g. ±1.4 BPM"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Metric 2 Label</label>
                    <input
                      type="text"
                      value={formData.metric2Label}
                      onChange={(e) => setFormData({ ...formData, metric2Label: e.target.value })}
                      placeholder="e.g. Sampling Rate"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Metric 2 Value</label>
                    <input
                      type="text"
                      value={formData.metric2Value}
                      onChange={(e) => setFormData({ ...formData, metric2Value: e.target.value })}
                      placeholder="e.g. 30 - 120 FPS"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedPillar"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-maroon-600 focus:ring-maroon-600"
                />
                <label htmlFor="publishedPillar" className="text-xs text-slate-300">
                  Publish publicly on laboratory homepage
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-maroon-800 hover:bg-maroon-700 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-md"
                >
                  {isSaving ? 'Saving...' : editingPillar ? 'Update Thrust' : 'Create Thrust'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
