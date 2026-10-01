import React from 'react';
import { Search, ArrowRight, HelpCircle, FileSearch, EyeOff, RefreshCcw, CheckCircle } from 'lucide-react';

export default function RetrievalJourney() {
  const steps = [
    {
      title: "1. Vague Memory Trigger",
      icon: <HelpCircle className="text-purple-500" size={24} />,
      behavior: "User realizes they need a photo from the past but only remembers contextual fragments.",
      failure: "Potential early-abandonment hypothesis — insufficient direct evidence in current dataset.",
      evidenceCount: "UNKNOWN",
      confidence: "LOW",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100"
    },
    {
      title: "2. Clue Recall",
      icon: <Search className="text-blue-500" size={24} />,
      behavior: "User tries to combine Person + Place + Event in their head while missing precise metadata.",
      failure: "Memory degradation — user forgets exact date, rendering strict timeline scrolling ineffective.",
      evidenceCount: 154,
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
      evidenceCount: 124,
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
      evidenceCount: 28,
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
      evidenceCount: 42,
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
      evidenceCount: 302,
      confidence: "HIGH",
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100"
    }
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-full flex flex-col justify-center animate-in fade-in duration-700">
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

      {/* Horizontal Layout Container */}
      <div className="relative w-full flex items-center py-8 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide px-4">
        
        {/* Continuous Horizontal Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-purple-200 via-teal-200 to-emerald-200 -translate-y-1/2 z-0 hidden lg:block rounded-full opacity-50"></div>

        <div className="flex flex-row gap-6 min-w-max mx-auto px-4 z-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center snap-center group">
              <div className={`w-[320px] bg-white/80 backdrop-blur-xl p-6 rounded-3xl border-2 ${step.borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] bg-gradient-to-b ${step.color} overflow-hidden h-[420px]`}>
                
                {/* Header Section */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${step.iconBg} shadow-inner`}>
                      {React.cloneElement(step.icon, { size: 20 })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-slate-900/5 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm">
                      Conf: {step.confidence}
                    </span>
                    <span className="bg-slate-900/5 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest backdrop-blur-sm">
                      Evid: {step.evidenceCount}
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-800 z-10 mt-2">{step.title}</h2>
                
                {/* Content Cards */}
                <div className="flex-1 flex flex-col gap-3 z-10">
                  <div className="flex-1 bg-white/90 rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col group-hover:border-slate-200 transition-colors">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      Observed Behaviour
                    </h3>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{step.behavior}</p>
                  </div>
                  
                  <div className="flex-1 bg-rose-50/90 rounded-2xl p-4 shadow-sm border border-rose-100 flex flex-col group-hover:border-rose-200 transition-colors">
                    <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                      Potential Failure
                    </h3>
                    <p className="text-sm font-medium text-rose-800 leading-relaxed">{step.failure}</p>
                  </div>
                </div>
              </div>
              
              {/* Horizontal Arrow between items */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex w-12 items-center justify-center z-20 shrink-0">
                  <div className="bg-white p-2 rounded-full border border-slate-200 shadow-md transform transition-transform group-hover:scale-110 group-hover:translate-x-1">
                    <ArrowRight className="text-slate-400" size={16} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
