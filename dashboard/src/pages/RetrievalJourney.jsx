import React from 'react';
import { Search, ArrowDown, HelpCircle, FileSearch, EyeOff, RefreshCcw, CheckCircle } from 'lucide-react';

export default function RetrievalJourney() {
  const steps = [
    {
      title: "1. Vague Memory Trigger",
      icon: <HelpCircle className="text-purple-500" size={24} />,
      behavior: "User realizes they need a photo from the past but only remembers contextual fragments.",
      failure: "If memory is too degraded, they may abandon the search before even opening the app.",
      color: "border-purple-200 bg-purple-50"
    },
    {
      title: "2. Clue Recall",
      icon: <Search className="text-blue-500" size={24} />,
      behavior: "User tries to combine Person + Place + Event in their head.",
      failure: "They remember the place, but forget the exact date, making timeline scrolling impossible.",
      color: "border-blue-200 bg-blue-50"
    },
    {
      title: "3. Query Formulation",
      icon: <FileSearch className="text-teal-500" size={24} />,
      behavior: "User translates their contextual memory into a searchable keyword.",
      failure: "MEMORY -> QUERY TRANSLATION FAILURE. They type 'Goa trip' but the photos aren't tagged 'Goa'.",
      color: "border-teal-200 bg-teal-50"
    },
    {
      title: "4. Result Recognition",
      icon: <EyeOff className="text-amber-500" size={24} />,
      behavior: "User scans the grid of results returned by the search.",
      failure: "RETRIEVAL -> RECOGNITION FAILURE. The system returned relevant results, but the user couldn't spot the exact photo in a grid of hundreds.",
      color: "border-amber-200 bg-amber-50"
    },
    {
      title: "5. Search Refinement",
      icon: <RefreshCcw className="text-orange-500" size={24} />,
      behavior: "User alters the keyword or switches to timeline scrolling.",
      failure: "SEARCH RECOVERY FAILURE. The first search fails, and they don't know what else to try. They abandon.",
      color: "border-orange-200 bg-orange-50"
    },
    {
      title: "6. Retrieval Outcome",
      icon: <CheckCircle className="text-emerald-500" size={24} />,
      behavior: "User either finds the photo, finds it using an external workaround, or abandons the task.",
      failure: "Total abandonment affects retention and trust in Google Photos.",
      color: "border-emerald-200 bg-emerald-50"
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Search color="#10b981" size={32} />
          Retrieval Journey
        </h1>
        <p className="text-slate-900 font-medium mt-2 text-lg">The step-by-step breakdown of how a vague memory translates to retrieval failure or success.</p>
      </div>

      <div className="space-y-4 relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 z-0 hidden md:block"></div>

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6">
            <div className={`w-full md:w-[600px] bg-white p-6 rounded-xl border ${step.color} shadow-sm relative`}>
              <div className="flex items-center gap-3 mb-3">
                {step.icon}
                <h2 className="text-xl font-bold text-slate-800">{step.title}</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Typical Behavior</h3>
                  <p className="text-slate-700 bg-white p-3 rounded border border-slate-100">{step.behavior}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Common Failure Point</h3>
                  <p className="text-slate-700 bg-rose-50 p-3 rounded border border-rose-100 italic">{step.failure}</p>
                </div>
              </div>
            </div>
            
            {idx < steps.length - 1 && (
              <div className="hidden md:flex flex-col items-center justify-center absolute -bottom-10 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                  <ArrowDown className="text-slate-400" size={20} />
                </div>
              </div>
            )}
            
            {idx < steps.length - 1 && (
              <div className="md:hidden flex justify-center py-2">
                <ArrowDown className="text-slate-300" size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
