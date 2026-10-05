import React, { useEffect, useState } from 'react';
import { Calculator, Layers, Filter } from 'lucide-react';

const ProblemLandscape = () => {
  const [clusters, setClusters] = useState([]);
  const [activeTab, setActiveTab] = useState('in_scope');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/clusters`)
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(err => console.error(err));
  }, []);

  // For this demo, all our generated clusters are IN_SCOPE.
  // In a real scenario, the API would return the scope of each cluster.
  const getFilteredClusters = () => {
    if (activeTab === 'in_scope') return clusters;
    if (activeTab === 'adjacent') return []; // Demo: no adjacent clusters
    if (activeTab === 'out_of_scope') return []; // Demo: no out of scope clusters
    return clusters;
  };

  const sortedClusters = [...getFilteredClusters()].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Layers color="#4285F4" size={32} />
        Problem Landscape
      </h1>
      <p className="text-slate-900 font-medium mb-6 text-lg">Semantically clustered problem areas derived from user feedback.</p>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('in_scope')}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'in_scope' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          In-Scope Retrieval Problems
        </button>
        <button 
          onClick={() => setActiveTab('adjacent')}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'adjacent' ? 'border-amber-600 text-amber-700 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Adjacent Problems
        </button>
        <button 
          onClick={() => setActiveTab('out_of_scope')}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'out_of_scope' ? 'border-rose-600 text-rose-700 bg-rose-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Out-of-Scope Audit
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Calculator size={18} className="text-teal-600" /> Transparent Problem Prioritization Score
        </h3>
        <p className="text-sm text-slate-700 mb-3">
          To ensure problem prioritization is driven by validated user pain points rather than frequency bias, the AI Discovery Engine calculates a weighted 1-5 priority score based on:
        </p>
        <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc mb-3">
          <li><strong>Evidence Weight:</strong> 0.6 * log10(Total Evidence Count + 1)</li>
          <li><strong>Source Diversity:</strong> 0.4 * (Unique Platforms / 4.0)</li>
        </ul>
        <div className="bg-white border border-slate-200 p-3 rounded-lg text-sm text-slate-700 font-mono mb-3 shadow-inner">
          <strong>Example Calculation:</strong><br/>
          Cluster: "Temporal Ambiguity in Queries"<br/>
          Evidence Count (E) = 124 instances<br/>
          Unique Platforms (S) = 3 sources<br/>
          <strong>Priority Score: (0.6 * log10(125)) + (0.4 * 0.75) = (0.6 * 2.09) + 0.3 = 1.25 + 0.3 = 1.55</strong>
        </div>
        <div className="text-xs text-slate-500 italic">* Priority Score is a heuristic guide, not a mathematically rigorous business forecast.</div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sortedClusters.map(cluster => (
          <div key={cluster.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{cluster.title}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">📊 Evidence: <strong>{cluster.evidence_count} observations</strong></span>
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">🌐 Users: <strong>{cluster.independent_source_count}</strong></span>
                <span className="flex items-center gap-1 bg-teal-50 text-teal-800 font-bold px-2 py-1 rounded border border-teal-200">
                  Priority Score: {cluster.priority_score}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4 text-sm flex-1">
              <div>
                <h4 className="font-semibold text-slate-500 uppercase text-xs tracking-wider mb-1">Problem Statement</h4>
                <p className="text-slate-800 font-medium">{cluster.statement}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 uppercase text-xs tracking-wider mb-1">Remembered</h4>
                  <p className="text-emerald-900">{cluster.remembered_info}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <h4 className="font-semibold text-amber-800 uppercase text-xs tracking-wider mb-1">Missing</h4>
                  <p className="text-amber-900">{cluster.missing_info}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-auto">
                <h4 className="font-semibold text-slate-600 uppercase text-xs tracking-wider mb-2">Retrieval Mechanism</h4>
                <p className="text-slate-700 mb-2"><span className="font-bold text-slate-900 bg-white px-1 border border-slate-200 rounded text-xs mr-2">ATTEMPT</span> {cluster.typical_attempt}</p>
                <p className="text-slate-700"><span className="font-bold text-rose-700 bg-rose-50 px-1 border border-rose-200 rounded text-xs mr-2">FAILURE</span> {cluster.typical_failure}</p>
              </div>
            </div>
          </div>
        ))}
        {sortedClusters.length === 0 && (
          <div className="text-slate-500 col-span-full text-center py-12 bg-white border border-slate-200 border-dashed rounded-xl">
            No clusters available in this tab.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemLandscape;
