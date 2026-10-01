import React from 'react';
import { Search, ArrowDown, HelpCircle, FileSearch, EyeOff, RefreshCcw, CheckCircle } from 'lucide-react';

export default function RetrievalJourney() {
  const steps = [
    {
      title: "1. Vague Memory Trigger",
      icon: <HelpCircle className="text-purple-500" size={24} />,
      behavior: "User realizes they need a photo from the past but only remembers contextual fragments.",
      failure: "Potential early-abandonment hypothesis — insufficient direct evidence in current dataset.",
      evidenceCount: "UNKNOWN",
      confidence: "LOW",
      color: "border-purple-200 bg-purple-50"
    },
    {
      title: "2. Clue Recall",
      icon: <Search className="text-blue-500" size={24} />,
      behavior: "User tries to combine Person + Place + Event in their head while missing precise metadata.",
      failure: "Memory degradation — user forgets exact date, rendering strict timeline scrolling ineffective.",
      evidenceCount: 154,
      confidence: "HIGH",
      color: "border-blue-200 bg-blue-50"
    },
    {
      title: "3. Query Formulation",
      icon: <FileSearch className="text-teal-500" size={24} />,
      behavior: "User translates their contextual memory into a searchable keyword.",
      failure: "Potential memory-to-query mismatch — user-reported evidence confirms failure when searching broad contextual queries.",
      evidenceCount: 124,
      confidence: "HIGH",
      color: "border-teal-200 bg-teal-50"
    },
    {
      title: "4. Result Recognition",
      icon: <EyeOff className="text-amber-500" size={24} />,
      behavior: "User scans the grid of results returned by the search.",
      failure: "System returns relevant results, but user cannot spot the exact photo among visually similar grids.",
      evidenceCount: 28,
      confidence: "MEDIUM",
      color: "border-amber-200 bg-amber-50"
    },
    {
      title: "5. Search Refinement",
      icon: <RefreshCcw className="text-orange-500" size={24} />,
      behavior: "User alters the keyword or switches to timeline scrolling.",
      failure: "Search recovery failure — first search fails and user does not know what clues to add.",
      evidenceCount: 42,
      confidence: "MEDIUM",
      color: "border-orange-200 bg-orange-50"
    },
    {
      title: "6. Retrieval Outcome",
      icon: <CheckCircle className="text-emerald-500" size={24} />,
      behavior: "User either finds the photo, finds it using a workaround, or abandons the task.",
      failure: "Total abandonment affects retention and product trust.",
      evidenceCount: 302,
      confidence: "HIGH",
      color: "border-emerald-200 bg-emerald-50"
    }
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto h-full flex flex-col justify-center">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Search color="#10b981" size={24} />
          Retrieval Journey
        </h1>
        <p className="text-slate-900 font-medium mt-1 text-sm">The step-by-step breakdown of how a vague memory translates to retrieval failure or success.</p>
      </div>

      <div className="space-y-1 relative flex-1 flex flex-col justify-center">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 z-0 hidden md:block"></div>

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-2">
            <div className={`w-full md:w-[700px] bg-white p-3 rounded-xl border ${step.color} shadow-sm relative`}>
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
                <div className="flex items-center gap-2">
                  {React.cloneElement(step.icon, { size: 18 })}
                  <h2 className="text-sm font-bold text-slate-800">{step.title}</h2>
                </div>
                <div className="flex gap-1">
                  <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Confidence: {step.confidence}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Evidence: {step.evidenceCount}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observed Behaviour</h3>
                  <p className="text-xs font-medium text-slate-800 bg-white p-2 rounded-lg border border-slate-100 h-full">{step.behavior}</p>
                </div>
                <div>
                  <h3 className="text-[9px] font-bold text-rose-500 uppercase tracking-wider mb-1">Potential Failure</h3>
                  <p className="text-xs font-medium text-rose-900 bg-rose-50 p-2 rounded-lg border border-rose-100 h-full">{step.failure}</p>
                </div>
              </div>
            </div>
            
            {idx < steps.length - 1 && (
              <div className="hidden md:flex flex-col items-center justify-center absolute -bottom-5 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white p-0.5 rounded-full border border-slate-200 shadow-sm">
                  <ArrowDown className="text-slate-400" size={12} />
                </div>
              </div>
            )}
            
            {idx < steps.length - 1 && (
              <div className="md:hidden flex justify-center py-0.5">
                <ArrowDown className="text-slate-300" size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
