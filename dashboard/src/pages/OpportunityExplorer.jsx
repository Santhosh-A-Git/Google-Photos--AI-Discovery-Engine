import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

const OpportunityExplorer = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/opportunities`)
      .then(res => res.json())
      .then(data => setOpportunities(data))
      .catch(err => console.error(err));
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Lightbulb color="#EA4335" size={32} />
        Opportunity Hypothesis
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">High-level product opportunities mapped to validated problem clusters.</p>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Opportunity Area</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Affected Users</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Prevalence</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Strength</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {opportunities.map(opp => (
              <React.Fragment key={opp.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-5">
                    <div className="font-medium text-slate-900">{opp.opportunity_area}</div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">Cluster ID: {opp.cluster_id}</div>
                  </td>
                  <td className="p-5 text-sm text-slate-700 whitespace-normal">
                    {opp.affected_users}
                  </td>
                  <td className="p-5 text-sm text-slate-700">
                    {opp.prevalence || 'N/A'}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 text-xs rounded-full font-bold tracking-wide border ${opp.evidence_strength === 'HIGH' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {opp.evidence_strength}
                    </span>
                  </td>
                  <td className="p-5">
                    <button 
                      onClick={() => toggleExpand(opp.id)}
                      className="text-teal-600 hover:text-teal-700 text-sm font-bold tracking-wide transition-colors"
                    >
                      {expandedId === opp.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {expandedId === opp.id && (
                  <tr className="bg-teal-50 border-b border-teal-100">
                    <td colSpan="5" className="p-6">
                      <div className="max-w-3xl">
                        <h4 className="font-bold text-teal-800 mb-2 uppercase text-xs tracking-widest">Retrieval Relevance</h4>
                        <p className="text-slate-800 text-sm leading-relaxed">{opp.retrieval_relevance || "No additional details available."}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                  No opportunities generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunityExplorer;
