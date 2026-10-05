import React, { useEffect, useState } from 'react';
import { UserCheck, Target, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function InterviewHypotheses() {
  const [clusters, setClusters] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/clusters`)
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/opportunities`)
      .then(res => res.json())
      .then(data => setOpportunities(data))
      .catch(err => console.error(err));
  }, []);

  // Map clusters and opportunities to hypothesis structure dynamically
  const hypotheses = clusters.map((c, i) => {
    const opp = opportunities.find(o => o.cluster_id === c.id);

    return {
      id: `H${i + 1}`,
      title: c.statement || c.title,
      evidenceCount: c.evidence_count,
      diversity: `${c.independent_source_count} unique sources`,
      confidence: c.confidence_score,
      segment: opp ? opp.affected_users : "Unknown Users",
      scenario: c.situation,
      question: opp ? opp.core_hypothesis : "Hypothesis missing",
      wouldSupport: opp ? opp.proposed_solution : "Solution missing",
      wouldFalsify: opp ? opp.risks : "Risks missing"
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserCheck color="#6366f1" size={32} />
          Interview Hypotheses
        </h1>
        <p className="text-slate-900 font-medium mt-2 text-lg">Targeted primary research questions generated directly from our 1,403 insights.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {hypotheses.map((h, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-indigo-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-3 leading-snug">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm shrink-0 shadow-sm">{h.id}</span>
                {h.title}
              </h2>
              <div className="flex flex-wrap gap-2 shrink-0">
                <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">Confidence: <span className={h.confidence === 'HIGH' ? 'text-teal-600' : 'text-slate-800'}>{h.confidence}</span></span>
                <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">Evidence: {h.evidenceCount}</span>
                <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">Diversity: {h.diversity}</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Target size={14}/> Target Segment</h3>
                  <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{h.segment}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><AlertCircle size={14}/> Retrieval Scenario</h3>
                  <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{h.scenario}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2"><UserCheck size={14}/> Core AI Hypothesis</h3>
                  <p className="text-lg font-bold text-indigo-900 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 italic">
                    "{h.question}"
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800 uppercase mb-1">Proposed Solution</h4>
                      <p className="text-sm text-emerald-900 leading-relaxed">{h.wouldSupport}</p>
                    </div>
                  </div>
                  
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3">
                    <XCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 uppercase mb-1">Execution Risks</h4>
                      <p className="text-sm text-rose-900 leading-relaxed">{h.wouldFalsify}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {hypotheses.length === 0 && <div className="text-slate-500 text-center py-12">No hypotheses generated yet.</div>}
      </div>
    </div>
  );
}
