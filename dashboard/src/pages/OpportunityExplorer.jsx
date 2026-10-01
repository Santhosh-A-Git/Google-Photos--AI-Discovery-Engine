import React, { useEffect, useState } from 'react';
import { Lightbulb, ArrowDown, Activity, Users, LayoutList } from 'lucide-react';

const OpportunityExplorer = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/opportunities`)
      .then(res => res.json())
      .then(data => setOpportunities(data))
      .catch(err => console.error(err));
      
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/clusters`)
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Lightbulb color="#EA4335" size={32} />
        Opportunity Explorer
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">Traceable opportunities mapped directly to evidence-backed retrieval failures.</p>
      
      <div className="space-y-12">
        {opportunities.map(opp => {
          // Find the parent cluster to show traceability
          const parentCluster = clusters.find(c => c.id === opp.cluster_id) || {};
          
          return (
            <div key={opp.id} className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-50 to-orange-50 px-8 py-6 border-b border-rose-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-black text-rose-500 tracking-widest uppercase mb-2">Opportunity Hypothesis</div>
                    <h2 className="text-2xl font-black text-slate-900">{opp.opportunity_area}</h2>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Users size={14} className="shrink-0" /> Affected: {opp.affected_users}
                    </span>
                    <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Activity size={14} /> Relevance: {opp.retrieval_relevance}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Side: The Opportunity Hypothesis */}
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Core Hypothesis</h3>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {opp.core_hypothesis || "If we address this problem cluster, users will experience a significant drop in query abandonment."}
                    </p>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                    <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wider mb-2">Proposed Solution</h3>
                    <p className="text-emerald-900 leading-relaxed">
                      {opp.proposed_solution || "Develop a feature that targets the exact memory mismatch identified in the cluster."}
                    </p>
                  </div>
                  
                  <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                    <h3 className="text-sm font-black text-rose-800 uppercase tracking-wider mb-2">Risks & Caveats</h3>
                    <p className="text-rose-900 leading-relaxed">
                      {opp.risks || "Requires high engineering effort and complex UI changes."}
                    </p>
                  </div>
                </div>

                {/* Right Side: Traceability Tree */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <LayoutList size={18} /> Evidence Traceability
                  </h3>
                  
                  <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    
                    {/* Problem */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        1
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Statement</div>
                        <div className="text-sm font-bold text-slate-800">{parentCluster.title || "Loading..."}</div>
                      </div>
                    </div>

                    {/* Evidence */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        2
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Direct Evidence</div>
                        <div className="text-sm font-bold text-slate-800">{parentCluster.evidence_count} observations across {parentCluster.independent_source_count} sources</div>
                      </div>
                    </div>

                    {/* Clues */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        3
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Memory vs Missing</div>
                        <div className="text-sm text-slate-800"><span className="font-bold text-emerald-600">Has:</span> {parentCluster.remembered_info?.substring(0,40)}</div>
                        <div className="text-sm text-slate-800 mt-1"><span className="font-bold text-rose-600">Missing:</span> {parentCluster.missing_info?.substring(0,40)}</div>
                      </div>
                    </div>

                    {/* Search Attempt */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        4
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Search Attempt & Failure</div>
                        <div className="text-sm text-slate-800 font-medium">{parentCluster.typical_attempt}</div>
                        <div className="text-sm text-slate-600 mt-1">{parentCluster.typical_failure}</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          );
        })}
        {opportunities.length === 0 && <div className="text-slate-500">No opportunities generated yet.</div>}
      </div>
    </div>
  );
};

export default OpportunityExplorer;
