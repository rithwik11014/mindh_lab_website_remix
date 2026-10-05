import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowUpRight,
  Handshake,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Collaborator, CollaboratorCategory } from '../types';
import { LAB_COLLABORATORS } from '../data/labData';
import { CollaboratorDetailModal } from './CollaboratorDetailModal';

interface CollaboratorsSectionProps {
  onOpenCollaborateModal: () => void;
}

const CATEGORIES: { id: 'All' | CollaboratorCategory; label: string }[] = [
  { id: 'All', label: 'All Partners' },
  { id: 'Clinical & Hospital', label: 'Clinical & Hospitals' },
  { id: 'Academic Institution', label: 'Academic Institutions' },
  { id: 'Industry & Technology', label: 'Industry & Tech' },
];

const PARTNER_METRICS: Record<string, { rating: string; badge: string }> = {
  'collab-1': { rating: '9.8', badge: 'MGH' },
  'collab-2': { rating: '9.6', badge: 'JHU' },
  'collab-3': { rating: '9.7', badge: 'STANFORD' },
  'collab-4': { rating: '9.9', badge: 'MIT' },
  'collab-5': { rating: '9.4', badge: 'PHILIPS' },
  'collab-6': { rating: '9.8', badge: 'NVIDIA' },
  'collab-7': { rating: '9.9', badge: 'NIH' },
  'collab-8': { rating: '9.5', badge: 'NSF' },
  'collab-9': { rating: '9.4', badge: 'PHILIPS' },
  'collab-10': { rating: '9.3', badge: 'MEDTRONIC' },
  'collab-11': { rating: '9.2', badge: 'AHA' },
  'collab-12': { rating: '9.5', badge: 'GE' },
  'collab-13': { rating: '9.7', badge: 'WELLCOME' },
};

export const CollaboratorsSection: React.FC<CollaboratorsSectionProps> = ({
  onOpenCollaborateModal,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(LAB_COLLABORATORS);
  const [selectedCategory, setSelectedCategory] = useState<'All' | CollaboratorCategory>('All');
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch collaborators from API
  useEffect(() => {
    let isMounted = true;
    async function loadCollaborators() {
      try {
        const res = await fetch('/api/collaborators');
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.collaborators) && isMounted) {
            setCollaborators(data.collaborators);
          }
        }
      } catch (err) {
        console.warn('Could not fetch collaborators:', err);
      }
    }
    loadCollaborators();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter logic
  const filteredCollaborators = useMemo(() => {
    return collaborators.filter((collab) => {
      if (collab.published === false) return false;
      if (selectedCategory === 'All') return true;
      return collab.category === selectedCategory;
    });
  }, [collaborators, selectedCategory]);

  const total = filteredCollaborators.length;

  // Reset active index when category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || isHovered || total <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, isHovered, total]);

  const handlePrev = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev <= 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // 3D Arc Positioning for Coverflow layout
  const getCardStyle = (diff: number) => {
    const spacing1 = isMobile ? 130 : isTablet ? 210 : 280;
    const spacing2 = isMobile ? 220 : isTablet ? 370 : 490;

    if (diff === 0) {
      return {
        transform: 'translate(-50%, -50%) translate3d(0, 0, 0) scale(1) rotateY(0deg)',
        zIndex: 30,
        opacity: 1,
        filter: 'blur(0px)',
        boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.95), 0 0 50px rgba(180, 20, 50, 0.45)',
        pointerEvents: 'auto' as const,
      };
    }

    if (diff === -1) {
      return {
        transform: `translate(-50%, -50%) translate3d(-${spacing1}px, 0, -90px) scale(${isMobile ? 0.78 : 0.82}) rotateY(12deg)`,
        zIndex: 20,
        opacity: 0.65,
        filter: 'blur(2px)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'auto' as const,
      };
    }

    if (diff === 1) {
      return {
        transform: `translate(-50%, -50%) translate3d(${spacing1}px, 0, -90px) scale(${isMobile ? 0.78 : 0.82}) rotateY(-12deg)`,
        zIndex: 20,
        opacity: 0.65,
        filter: 'blur(2px)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'auto' as const,
      };
    }

    if (diff === -2) {
      return {
        transform: `translate(-50%, -50%) translate3d(-${spacing2}px, 0, -190px) scale(${isMobile ? 0.6 : 0.68}) rotateY(22deg)`,
        zIndex: 10,
        opacity: isMobile ? 0.15 : 0.35,
        filter: 'blur(4px)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        pointerEvents: 'auto' as const,
      };
    }

    if (diff === 2) {
      return {
        transform: `translate(-50%, -50%) translate3d(${spacing2}px, 0, -190px) scale(${isMobile ? 0.6 : 0.68}) rotateY(-22deg)`,
        zIndex: 10,
        opacity: isMobile ? 0.15 : 0.35,
        filter: 'blur(4px)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        pointerEvents: 'auto' as const,
      };
    }

    // Outside visible arc
    const side = diff > 0 ? 1 : -1;
    return {
      transform: `translate(-50%, -50%) translate3d(${side * 650}px, 0, -300px) scale(0.4)`,
      zIndex: 0,
      opacity: 0,
      filter: 'blur(8px)',
      pointerEvents: 'none' as const,
    };
  };

  const getPartnerMeta = (collab: Collaborator) => {
    if (PARTNER_METRICS[collab.id]) {
      return PARTNER_METRICS[collab.id];
    }
    const cleanName = (collab.shortName || collab.name).replace(/[^a-zA-Z]/g, '');
    const badge = cleanName.slice(0, 6).toUpperCase() || 'LAB';
    const rating = (8.5 + (collab.name.length % 15) * 0.1).toFixed(1);
    return { badge, rating };
  };

  return (
    <section
      id="collaborators"
      className="py-16 sm:py-24 bg-[#0a0204] dark:bg-[#070103] border-t border-slate-900 text-white relative overflow-hidden select-none"
    >
      {/* Cinematic Red/Maroon Ambient Glow Halo behind the Center Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-r from-maroon-700/40 via-rose-600/30 to-maroon-950/50 blur-[100px] opacity-80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-950/80 text-rose-300 border border-maroon-800/80 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Translational Clinical Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Institutional Collaborators & Partners
            </h2>
            <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed">
              Multi-center hospital networks, academic bioengineering institutes, and industry pioneers driving bedside intelligence.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCollaborateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-800 to-rose-700 hover:from-maroon-700 hover:to-rose-600 text-white font-semibold text-xs transition-all shadow-lg shadow-maroon-950/60"
            >
              <Handshake className="w-4 h-4" />
              <span>Propose Collaboration</span>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors shadow-sm"
              title={isPaused ? 'Resume sliding' : 'Pause sliding'}
              aria-label={isPaused ? 'Resume sliding' : 'Pause sliding'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors shadow-sm"
              title="Previous"
              aria-label="Previous Partner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors shadow-sm"
              title="Next"
              aria-label="Next Partner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
          {CATEGORIES.map(({ id, label }) => {
            const count =
              id === 'All'
                ? collaborators.filter((c) => c.published !== false).length
                : collaborators.filter((c) => c.published !== false && c.category === id).length;

            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3D Arc Coverflow Stage */}
        <div
          className="relative w-full h-[460px] sm:h-[530px] md:h-[570px] overflow-hidden my-4"
          style={{ perspective: '1200px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {total === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Building2 className="w-12 h-12 text-slate-500 mb-3" />
              <p className="text-base font-semibold text-slate-300">No collaborators in this category</p>
            </div>
          ) : (
            filteredCollaborators.map((collab, index) => {
              // Calculate circular relative offset from activeIndex
              let diff = (index - activeIndex) % total;
              if (diff < -Math.floor(total / 2)) diff += total;
              if (diff > Math.floor(total / 2)) diff -= total;

              const isCenter = diff === 0;
              const cardStyle = getCardStyle(diff);
              const meta = getPartnerMeta(collab);

              return (
                <div
                  key={collab.id}
                  style={cardStyle}
                  onClick={() => {
                    if (isCenter) {
                      setSelectedCollaborator(collab);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  className={`absolute left-1/2 top-1/2 w-[250px] sm:w-[290px] md:w-[320px] h-[380px] sm:h-[440px] md:h-[480px] rounded-[28px] overflow-hidden cursor-pointer transition-all duration-700 ease-out border ${
                    isCenter
                      ? 'border-rose-500/80 ring-2 ring-rose-500/30'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Poster Image Background */}
                  <img
                    src={
                      collab.logoUrl ||
                      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800'
                    }
                    alt={collab.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800';
                    }}
                  />

                  {/* Gradient Overlays for optimal text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Top Bar: Brand Pill Badge (Left) & Star Rating (Right) */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    {/* Top Left Badge */}
                    <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-black tracking-wider text-white shadow-md">
                      {meta.badge}
                    </div>

                    {/* Top Right Star Rating */}
                    <div className="flex items-center gap-0.5 text-white font-black text-xl sm:text-2xl tracking-tight drop-shadow-md">
                      <span>{meta.rating}</span>
                      <span className="text-xs sm:text-sm text-white/90 ml-0.5">★</span>
                    </div>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-5 left-5 right-5 z-10 space-y-2.5">
                    {/* Title */}
                    <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white leading-tight drop-shadow-md line-clamp-2">
                      {collab.name}
                    </h3>

                    {/* Metadata Chips (Exact styling as reference) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-white">
                        {collab.jointFocus?.[0] ? '2024' : 'Active'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-medium text-white/90 truncate max-w-[150px]">
                        {collab.jointFocus?.[0] || collab.category}
                      </span>
                    </div>

                    {/* Center card action indicator */}
                    {isCenter && (
                      <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-rose-300 group-hover:text-rose-200">
                        <span>Click to view details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Carousel Dots Indicator */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {filteredCollaborators.map((collab, idx) => (
              <button
                key={collab.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? 'w-8 bg-rose-600'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to ${collab.shortName || collab.name}`}
                aria-label={`Go to ${collab.shortName || collab.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for In-depth Institution Details */}
      <CollaboratorDetailModal
        collaborator={selectedCollaborator}
        onClose={() => setSelectedCollaborator(null)}
        onOpenCollab={onOpenCollaborateModal}
      />
    </section>
  );
};

export default CollaboratorsSection;
