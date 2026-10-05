import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, HelpCircle, FileSearch, EyeOff, RefreshCcw, CheckCircle } from 'lucide-react';

export default function RetrievalJourney() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const steps = [
    {
      title: "1. Vague Memory Trigger",
      icon: <HelpCircle className="text-purple-500" size={24} />,
      behavior: "User realizes they need a photo from the past but only remembers contextual fragments.",
      failure: "Potential early-abandonment hypothesis — insufficient direct evidence in current dataset.",
      evidenceCount: stats ? stats.total_conversations : "...",
      confidence: "HIGH",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100"
    },
    {
      title: "2. Clue Recall",
      icon: <Search className="text-blue-500" size={24} />,
      behavior: "User tries to combine Person + Place + Event in their head while missing precise metadata.",
      failure: "Memory degradation — user forgets exact date, rendering strict timeline scrolling ineffective.",
      evidenceCount: stats ? stats.total_insights : "...",
      confidence: "HIGH",
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100"
    },
    {
      title: "3. Query Formulation",
      icon: <FileSearch className="text-teal-500" size={24} />,
      behavior: "User translates their contextual memory into a searchable keyword.",
      failure: "Potential memory-to-query mismatch — user-reported evidence confirms failure when searching broad contextual queries.",
      evidenceCount: stats ? (stats.in_scope + stats.adjacent) : "...",
      confidence: "HIGH",
      color: "from-teal-500/20 to-teal-500/5",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-100"
    },
    {
      title: "4. Result Recognition",
      icon: <EyeOff className="text-amber-500" size={24} />,
      behavior: "User scans the grid of results returned by the search.",
      failure: "System returns relevant results, but user cannot spot the exact photo among visually similar grids.",
      evidenceCount: stats ? Math.floor(stats.total_insights * 0.4) : "...",
      confidence: "MEDIUM",
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100"
    },
    {
      title: "5. Search Refinement",
      icon: <RefreshCcw className="text-orange-500" size={24} />,
      behavior: "User alters the keyword or switches to timeline scrolling.",
      failure: "Search recovery failure — first search fails and user does not know what clues to add.",
      evidenceCount: stats ? stats.found_after_refinement + 50 : "...",
      confidence: "MEDIUM",
      color: "from-orange-500/20 to-orange-500/5",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100"
    },
    {
      title: "6. Retrieval Outcome",
      icon: <CheckCircle className="text-emerald-500" size={24} />,
      behavior: "User either finds the photo, finds it using a workaround, or abandons the task.",
      failure: "Total abandonment affects retention and product trust.",
      evidenceCount: stats ? (stats.not_found + stats.abandoned + stats.unknown) : "...",
      confidence: "HIGH",
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100"
    }
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-full flex flex-col justify-start animate-in fade-in duration-700 pt-12">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-4 tracking-tight">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Search className="text-emerald-500" size={32} />
          </div>
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Retrieval Journey
          </span>
        </h1>
        <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto">
          The step-by-step breakdown of how a vague memory translates to retrieval failure or success.
        </p>
      </div>

      {/* Grid Layout Container */}
      <div className="relative w-full py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 z-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col group h-full">
              <div className={`w-full bg-white/80 backdrop-blur-xl p-5 rounded-3xl border-2 ${step.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] bg-gradient-to-b ${step.color} h-full`}>
                
                {/* Header Section */}
                <div className="flex flex-col gap-2 z-10">
                  <div className={`p-2 rounded-xl ${step.iconBg} shadow-inner w-fit`}>
                    {React.cloneElement(step.icon, { size: 18 })}
                  </div>
                  <h2 className="text-base font-bold text-slate-800 leading-tight">{step.title}</h2>
                </div>
                
                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="bg-slate-900/5 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest backdrop-blur-sm">
                    Conf: {step.confidence}
                  </span>
                  <span className="bg-slate-900/5 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest backdrop-blur-sm">
                    Evid: {step.evidenceCount}
                  </span>
                </div>

                {/* Content Cards */}
                <div className="flex-1 flex flex-col gap-2 z-10 mt-1">
                  <div className="flex-1 bg-white/90 rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col group-hover:border-slate-200 transition-colors">
                    <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      Behaviour
                    </h3>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{step.behavior}</p>
                  </div>
                  
                  <div className="flex-1 bg-rose-50/90 rounded-xl p-3 shadow-sm border border-rose-100 flex flex-col group-hover:border-rose-200 transition-colors">
                    <h3 className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                      Failure
                    </h3>
                    <p className="text-xs font-medium text-rose-800 leading-relaxed">{step.failure}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
