import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Mail,
  ExternalLink,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { TeamMember, TeamCategory } from '../types';
import { LAB_TEAM } from '../data/labData';
import { TeamMemberDetailModal } from '../components/TeamMemberDetailModal';

const ALL_CATEGORIES: Array<{ key: 'ALL' | TeamCategory; label: string }> = [
  { key: 'ALL', label: 'All Personnel' },
  { key: 'Faculty', label: 'Faculty & PIs' },
  { key: 'Researchers', label: 'Research Scientists & Postdocs' },
  { key: 'PhD Scholars', label: 'PhD Scholars' },
  { key: 'Students', label: 'Graduate Students' },
  { key: 'Alumni', label: 'Alumni' },
  { key: 'Collaborators', label: 'Clinical Collaborators' },
];

export const TeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(LAB_TEAM);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Filtering & search
  const [activeCategory, setActiveCategory] = useState<'ALL' | TeamCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.team) && data.team.length > 0) {
          setTeam(data.team);
        } else {
          setTeam(LAB_TEAM);
        }
      } else {
        setTeam(LAB_TEAM);
      }
    } catch (err) {
      console.warn('Could not fetch team from /api/team, using local seed fallback:', err);
      setTeam(LAB_TEAM);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Filtered list
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      // Obey isPublic
      if (member.isPublic === false) return false;

      // Category filter
      if (activeCategory !== 'ALL' && member.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesRole = member.role.toLowerCase().includes(q);
        const matchesBio = member.bio.toLowerCase().includes(q);
        const matchesFocus = member.focus.some((f) => f.toLowerCase().includes(q));
        const matchesSkills = member.skills?.some((s) => s.toLowerCase().includes(q));
        return matchesName || matchesRole || matchesBio || matchesFocus || matchesSkills;
      }

      return true;
    });
  }, [team, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: team.filter((m) => m.isPublic !== false).length };
    team.forEach((m) => {
      if (m.isPublic !== false && m.category) {
        counts[m.category] = (counts[m.category] || 0) + 1;
      }
    });
    return counts;
  }, [team]);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Faculty':
        return 'bg-maroon-50 text-maroon-800 dark:bg-maroon-950/80 dark:text-maroon-300 border-maroon-200 dark:border-maroon-800';
      case 'Researchers':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PhD Scholars':
        return 'bg-sky-50 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'Students':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#120609] pt-24 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
          <Link
            to="/"
            className="hover:text-maroon-800 dark:hover:text-maroon-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Laboratory Team</span>
        </nav>

        {/* Page Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-50 dark:bg-maroon-950/70 text-maroon-800 dark:text-maroon-300 border border-maroon-200/80 dark:border-maroon-800/80 text-xs font-bold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Investigators & Scholars</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Faculty, Researchers & Personnel
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Our interdisciplinary team bridges cardiology, intensive care medicine, biomedical instrumentation, stochastic signal processing, and machine learning foundation models.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-maroon-800 hover:bg-maroon-900 text-white shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Join the Laboratory</span>
            </Link>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-slate-50 dark:bg-[#18080e] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-10 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search researchers by name, clinical focus, algorithms, or degrees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-maroon-600 dark:focus:ring-maroon-500 shadow-xs"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {ALL_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              const count = categoryCounts[cat.key] || 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-maroon-800 text-white shadow-sm ring-2 ring-maroon-800/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-maroon-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-2 border-maroon-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading laboratory roster...
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No personnel found matching the specified search parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeam.map((member) => (
              <div
                key={member.id}
                id={`member-${member.id}`}
                onClick={() => setSelectedMember(member)}
                className="group cursor-pointer rounded-3xl p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-maroon-400 dark:hover:border-maroon-800 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Avatar & Category Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:border-maroon-300 transition-colors shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(
                        member.category
                      )}`}
                    >
                      {member.category}
                    </span>
                  </div>

                  {/* Name & Credentials */}
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-maroon-800 dark:group-hover:text-maroon-400 transition-colors">
                    {member.name}
                  </h3>
                  <div className="text-xs font-semibold text-maroon-800 dark:text-maroon-400 mt-0.5">
                    {member.role}
                  </div>
                  {member.credentials && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {member.credentials}
                    </div>
                  )}

                  {/* Short Bio */}
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Research Focus Chips */}
                  {member.focus && member.focus.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {member.focus.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {f}
                        </span>
                      ))}
                      {member.focus.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                          +{member.focus.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-maroon-800 dark:text-maroon-400 group-hover:underline flex items-center gap-1">
                    <span>Full Profile & Research</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-2 text-slate-400" onClick={(e) => e.stopPropagation()}>
                    {member.email && member.showEmail !== false && (
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:text-maroon-800 dark:hover:text-maroon-400 p-1"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.scholarUrl && (
                      <a
                        href={member.scholarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-maroon-800 dark:hover:text-maroon-400 p-1"
                        title="Google Scholar"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join our laboratory callout banner */}
        <div className="mt-14 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-maroon-800 dark:text-maroon-400 text-xs font-mono uppercase font-bold tracking-wider">
              Career & Training Opportunities
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Interested in Joining MINDH Laboratory?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              We continually seek postdoctoral fellows, PhD students, medical informatics trainees, and visiting clinicians eager to advance physiological AI and zero-contact vital sensing.
            </p>
          </div>

          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <span>Inquire About Positions</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <TeamMemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default TeamPage;
