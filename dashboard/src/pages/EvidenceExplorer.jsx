import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

const EvidenceExplorer = () => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/insights`)
      .then(res => res.json())
      .then(data => setInsights(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching insights:", err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/insights/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pm_status: status, pm_feedback: "" })
      });
      setInsights(insights.map(i => i.id === id ? { ...i, pm_status: status } : i));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Search color="#34A853" size={32} />
        Evidence Explorer
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">Review and validate extracted insights from user feedback.</p>
      
      <div className="space-y-4">
        {insights.map(insight => (
          <div key={insight.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="text-sm text-blue-600 font-bold mb-1 uppercase tracking-widest">{insight.source}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{insight.retrieval_struggle}</h3>
              <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl italic mb-3 border border-slate-200 shadow-inner">
                "{insight.exact_quote}"
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full font-bold">Remembered: {insight.remembered_info || 'None'}</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-full font-bold">Missing: {insight.forgotten_info || 'None'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
              <span className={`text-xs font-bold text-center py-2 rounded-lg border ${insight.pm_status === 'Accepted' ? 'bg-green-100 text-green-800 border-green-300' : insight.pm_status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' : insight.pm_status === 'Needs Research' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {insight.pm_status || 'Needs Review'}
              </span>
              <button onClick={() => updateStatus(insight.id, 'Accepted')} className="px-3 py-2 bg-white text-green-600 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors text-sm font-bold shadow-sm">Accept</button>
              <button onClick={() => updateStatus(insight.id, 'Rejected')} className="px-3 py-2 bg-white text-red-600 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors text-sm font-bold shadow-sm">Reject</button>
              <button onClick={() => updateStatus(insight.id, 'Needs Research')} className="px-3 py-2 bg-white text-yellow-600 rounded-lg border border-slate-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-sm font-bold shadow-sm">Needs Research</button>
            </div>
          </div>
        ))}
        {insights.length === 0 && <div className="text-slate-500 font-medium">No insights found.</div>}
      </div>
    </div>
  );
};

export default EvidenceExplorer;
