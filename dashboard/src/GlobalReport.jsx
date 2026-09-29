import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';

const GlobalReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/global-report');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReport(data);
      }
    } catch (err) {
      setError('Failed to fetch AI synthesis report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We could auto-fetch on load, or let the user click a button to save LLM tokens.
    // For now, let's just wait for manual trigger to save API calls during dev.
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-dark-bg/80 border border-indigo-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-2xl shadow-indigo-900/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Global AI Synthesis Report</h2>
            <p className="text-sm text-indigo-300/80">Answers to your 4 core research questions across the entire dataset</p>
          </div>
        </div>
        
        <button 
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Synthesizing...' : (report ? 'Refresh Report' : 'Generate Report')}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-4">
          {error}
        </div>
      )}

      {report && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10 relative">
          
          <div className="bg-dark-bg/60 border border-dark-border/50 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-indigo-400">1.</span> Retrieval Struggles
            </h3>
            <p className="text-dark-text/90 leading-relaxed text-sm whitespace-pre-line">
              {report.struggles}
            </p>
          </div>

          <div className="bg-dark-bg/60 border border-dark-border/50 rounded-xl p-5 hover:border-green-500/30 transition-colors">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-green-400">2.</span> What People Remember
            </h3>
            <p className="text-dark-text/90 leading-relaxed text-sm whitespace-pre-line">
              {report.remembered}
            </p>
          </div>

          <div className="bg-dark-bg/60 border border-dark-border/50 rounded-xl p-5 hover:border-red-500/30 transition-colors">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-red-400">3.</span> What People Forget
            </h3>
            <p className="text-dark-text/90 leading-relaxed text-sm whitespace-pre-line">
              {report.forgotten}
            </p>
          </div>

          <div className="bg-dark-bg/60 border border-dark-border/50 rounded-xl p-5 hover:border-yellow-500/30 transition-colors">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-yellow-400">4.</span> Search Formulations
            </h3>
            <p className="text-dark-text/90 leading-relaxed text-sm whitespace-pre-line">
              {report.search_behavior}
            </p>
          </div>

          <div className="lg:col-span-2 bg-indigo-900/40 border border-indigo-500/50 rounded-xl p-5 hover:border-indigo-400 transition-colors shadow-lg shadow-indigo-900/20 mt-2">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="text-indigo-400 w-5 h-5" /> 5. Opportunity Areas Identified
            </h3>
            <p className="text-indigo-100 leading-relaxed text-sm whitespace-pre-line">
              {report.opportunities}
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default GlobalReport;
