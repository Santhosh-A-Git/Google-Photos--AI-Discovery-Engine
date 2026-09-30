import React, { useState } from 'react';
import { UserCheck, Target, AlertCircle } from 'lucide-react';

export default function InterviewHypotheses() {
  const [hypotheses] = useState([
    {
      id: "H1",
      title: "Users remember event/place/person but forget exact date.",
      evidenceCount: 42,
      diversity: "High (4 Sources)",
      confidence: "HIGH",
      segment: "Occasion-driven retrievers",
      scenario: "Attempting to find photos of a past vacation without knowing the year.",
      question: "Tell me about the last photo you knew existed but couldn't find. What exactly did you remember?"
    },
    {
      id: "H2",
      title: "Users cannot formulate an effective first search using context clues.",
      evidenceCount: 38,
      diversity: "High (3 Sources)",
      confidence: "HIGH",
      segment: "Context-heavy retrievers",
      scenario: "Searching for 'photo I took when I was sick' but the system requires literal object tags.",
      question: "What did you type or say first when you tried to find it?"
    },
    {
      id: "H3",
      title: "Users do not know what to try after the first search fails.",
      evidenceCount: 29,
      diversity: "Medium (2 Sources)",
      confidence: "MEDIUM",
      segment: "Search-recovery users",
      scenario: "Search returns unrelated results and user switches to manual timeline scrolling.",
      question: "What did you do after your first search returned nothing useful?"
    }
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserCheck color="#6366f1" size={32} />
          Interview Hypotheses
        </h1>
        <p className="text-slate-900 font-medium mt-2 text-lg">Targeted primary research questions generated from vague-memory retrieval evidence.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {hypotheses.map((h, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-indigo-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <span className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">{h.id}</span>
                {h.title}
              </h2>
              <div className="flex gap-2">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Confidence: {h.confidence}</span>
                <span className="bg-slate-200 text-slate-800 text-xs font-bold px-2 py-1 rounded">Evidence: {h.evidenceCount}</span>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Target size={16}/> Target Segment</h3>
                <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">{h.segment}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><AlertCircle size={16}/> Retrieval Scenario</h3>
                <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">{h.scenario}</p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-indigo-500 uppercase mb-2 flex items-center gap-2"><UserCheck size={16}/> Primary Interview Question</h3>
                <p className="text-lg font-bold text-indigo-900 bg-indigo-50/50 p-4 rounded-lg border-l-4 border-indigo-400 italic">
                  "{h.question}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
