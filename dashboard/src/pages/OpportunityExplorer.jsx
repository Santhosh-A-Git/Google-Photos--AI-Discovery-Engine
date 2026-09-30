import React, { useState } from 'react';
import { Lightbulb, Calculator, HelpCircle } from 'lucide-react';

const OpportunityExplorer = () => {
  const [opportunities] = useState([
    {
      id: "OPP-1",
      opportunity_area: "Context-Aware Memory Search",
      affected_users: "Users relying on Person + Place combinations without knowing the date.",
      evidence_strength: 5,
      source_diversity: 4,
      retrieval_relevance: 5,
      outcome_impact: 5,
      description: "Allowing users to search using highly vague contextual combinations (e.g., 'Goa trip with brother') without forcing literal image tags."
    },
    {
      id: "OPP-2",
      opportunity_area: "Search Refinement Assistant",
      affected_users: "Users who experience 'Search Recovery Failure' after the first failed query.",
      evidence_strength: 4,
      source_diversity: 3,
      retrieval_relevance: 5,
      outcome_impact: 4,
      description: "A dynamic UI prompt that suggests adding specific clues (like a known person or location) when a vague search returns zero results."
    },
    {
      id: "OPP-3",
      opportunity_area: "Cross-Modal Grid Highlighting",
      affected_users: "Users who face 'Retrieval -> Recognition Failure'.",
      evidence_strength: 3,
      source_diversity: 2,
      retrieval_relevance: 4,
      outcome_impact: 3,
      description: "When a search returns hundreds of photos for 'last summer', visually highlight the ones containing the specified objects or people."
    }
  ]);

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Lightbulb color="#EA4335" size={32} />
        Opportunity Explorer
      </h1>
      <p className="text-slate-900 font-medium mb-6 text-lg">High-level product opportunities mapped to validated retrieval problems.</p>
      
      {/* Prioritization Score Explanation */}
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
          <Calculator size={20} />
          Transparent Problem Prioritization Score
        </h2>
        <p className="text-slate-800 text-sm mb-4">
          A conceptual score used to rank opportunities based on their relevance to the <strong>Vague-Memory Retrieval</strong> problem statement.
        </p>
        <div className="bg-white p-4 rounded-lg border border-red-100 font-mono text-sm font-bold text-red-900 text-center shadow-inner">
          Priority Score = (Evidence Strength) × (Source Diversity) × (Retrieval Relevance) × (Outcome Impact)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Evidence Strength</div>
            <div className="text-xs text-slate-600 mt-1">Direct vs Directional</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Source Diversity</div>
            <div className="text-xs text-slate-600 mt-1">Cross-platform consensus</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Retrieval Relevance</div>
            <div className="text-xs text-slate-600 mt-1">Specific to vague memory</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase">Outcome Impact</div>
            <div className="text-xs text-slate-600 mt-1">Abandonment vs Recovery</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider w-1/3">Opportunity Area</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider text-center">Score Components<br/><span className="text-[10px] font-normal lowercase">(Ev × Src × Rel × Imp)</span></th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider text-center">Priority Score</th>
              <th className="p-5 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {opportunities.map(opp => {
              const score = opp.evidence_strength * opp.source_diversity * opp.retrieval_relevance * opp.outcome_impact;
              return (
                <React.Fragment key={opp.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-slate-900">{opp.opportunity_area}</div>
                      <div className="text-xs text-slate-500 mt-1">{opp.affected_users}</div>
                    </td>
                    <td className="p-5 text-sm text-slate-700 font-mono text-center">
                      {opp.evidence_strength} × {opp.source_diversity} × {opp.retrieval_relevance} × {opp.outcome_impact}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-4 py-2 text-sm rounded-full font-bold tracking-wide border ${score > 300 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                        {score}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => toggleExpand(opp.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-bold tracking-wide transition-colors"
                      >
                        {expandedId === opp.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === opp.id && (
                    <tr className="bg-red-50 border-b border-red-100">
                      <td colSpan="4" className="p-6">
                        <div className="max-w-3xl">
                          <h4 className="font-bold text-red-800 mb-2 uppercase text-xs tracking-widest flex items-center gap-2"><HelpCircle size={14}/> PM Hypothesis Description</h4>
                          <p className="text-slate-800 text-sm leading-relaxed bg-white p-4 rounded border border-red-100">{opp.description}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunityExplorer;
