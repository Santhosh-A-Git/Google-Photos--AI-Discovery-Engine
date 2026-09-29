import React, { useEffect, useState } from 'react';
import { Calculator, Layers } from 'lucide-react';

const ProblemLandscape = () => {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/clusters`)
      .then(res => res.json())
      .then(data => setClusters(data))
      .catch(err => console.error(err));
  }, []);

  const sortedClusters = [...clusters].sort((a, b) => parseFloat(b.priority_score) - parseFloat(a.priority_score));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Layers color="#4285F4" size={32} />
        Problem Landscape
      </h1>
      <p className="text-slate-900 font-medium mb-6">Semantically clustered problem areas derived from user feedback.</p>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Calculator size={18} className="text-teal-600" /> Evidence-Based Priority Formulation
        </h3>
        <p className="text-sm text-slate-900 font-bold mb-3">
          To ensure problem prioritization is driven by validated user pain points rather than frequency bias, the AI Discovery Engine calculates a weighted logarithmic confidence score for each cluster:
        </p>
        <div className="bg-white p-4 rounded-xl font-mono text-xs text-slate-900 font-medium border border-slate-200 mb-3 shadow-inner">
          <span className="text-blue-600 font-bold">Priority Score (C)</span> = (W₁ × log(1 + E)) + (W₂ × (S / S_max)) - Penalty
        </div>
        <ul className="text-xs text-slate-900 font-medium space-y-2 ml-4 list-disc">
          <li><strong>E (Evidence Count)</strong>: Total number of distinct qualitative feedback mentions mapped to this cluster. Logarithmic scaling prevents highly-repeated redundant complaints from skewing the data. (Weight W₁ = 0.6)</li>
          <li><strong>S (Source Diversity)</strong>: Number of independent platforms (e.g. Reddit, Twitter, Forums) validating the problem. (Weight W₂ = 0.4)</li>
          <li><strong>Sample Calculation</strong>: If a problem has E=43 mentions across S=3 platforms: <br/> C = (0.6 × log(44)) + (0.4 × 0.75) ≈ 1.30. Problems with C &gt; 0.65 are marked <strong className="text-blue-600">HIGH Priority</strong>.</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sortedClusters.map(cluster => (
          <div key={cluster.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{cluster.title}</h2>
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">📊 Evidence: <strong>{cluster.evidence_count}</strong></span>
                <span className="flex items-center gap-1">🌐 Sources: <strong>{cluster.independent_source_count}</strong></span>
                <span className={`flex items-center gap-1 font-bold ${cluster.confidence_score === 'HIGH' ? 'text-teal-600' : 'text-slate-600'}`}>
                  Confidence: {cluster.confidence_score} <span className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full ml-1 font-mono border border-slate-200">C = {cluster.priority_score}</span>
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-500 uppercase text-xs tracking-wider mb-1">Problem Statement</h4>
                <p className="text-slate-800">{cluster.statement}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                  <h4 className="font-semibold text-teal-800 uppercase text-xs tracking-wider mb-1">Remembered</h4>
                  <p className="text-slate-800">{cluster.remembered_info}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-800 uppercase text-xs tracking-wider mb-1">Missing</h4>
                  <p className="text-slate-800">{cluster.missing_info}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-600 uppercase text-xs tracking-wider mb-1">Typical Attempt & Failure</h4>
                <p className="text-slate-700"><span className="font-medium text-slate-900">Attempt:</span> {cluster.typical_attempt}</p>
                <p className="text-slate-700 mt-1"><span className="font-medium text-slate-900">Failure:</span> {cluster.typical_failure}</p>
              </div>
            </div>
          </div>
        ))}
        {sortedClusters.length === 0 && <div className="text-slate-500">No clusters generated yet. Run the semantic clustering pipeline first.</div>}
      </div>
    </div>
  );
};

export default ProblemLandscape;
