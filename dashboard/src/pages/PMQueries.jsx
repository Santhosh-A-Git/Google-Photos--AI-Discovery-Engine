import React, { useState } from 'react';
import { Search, Loader2, BookOpen, Bot, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PMQueries() {
  const [query, setQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle'); // idle, loading, success, error
  const [ragAnswer, setRagAnswer] = useState('');
  const [sources, setSources] = useState([]);
  
  const [reportStatus, setReportStatus] = useState('idle');
  const [globalReport, setGlobalReport] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearchStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, limit: 10 })
      });
      if (!res.ok) throw new Error("Backend search failed");
      const data = await res.json();
      setRagAnswer(data.ai_answer || "Sorry, the AI encountered an error and could not synthesize an answer.");
      setSources(data.results || []);
      setSearchStatus('success');
    } catch (error) {
      console.error(error);
      setSearchStatus('error');
    }
  };

  const generateReport = async () => {
    setReportStatus('loading');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/global-report?t=${Date.now()}`);
      if (!res.ok) throw new Error("Backend global report failed");
      const data = await res.json();
      setGlobalReport(data || null);
      setReportStatus('success');
    } catch (error) {
      console.error(error);
      setReportStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bot color="#4285F4" size={32} />
            AI PM Assistant
          </h1>
          <p className="text-slate-900 font-medium mt-2 text-lg">Query the entire feedback dataset focusing on vague-memory retrieval scenarios.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Ask a specific question</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'What do users remember when they cannot find a photo?'"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow text-slate-900 placeholder-slate-400 shadow-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={searchStatus === 'loading'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {searchStatus === 'loading' ? <Loader2 className="animate-spin text-white" size={18} /> : 'Ask AI'}
            </button>
          </form>

          <div className="mt-5">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Required Suggested Queries:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "What kinds of old photos do users struggle to retrieve?",
                "What information do people actually remember about a photo?",
                "What information have they forgotten?",
                "How do users formulate searches when their memory is incomplete?",
                "How do users formulate their first search when they only remember context?",
                "What happens after the first search fails?",
                "What clues do users add during search refinement?",
                "Which retrieval problems are caused by query formulation rather than retrieval relevance?",
                "Which retrieval problems are caused by poor result recognition?",
                "Which users rely on timeline scrolling instead of search?",
                "Which users use external tools or other people to recover photos?",
                "What combinations of clues appear most often?",
                "Where does retrieval break most often for incomplete memories?",
                "Which reported problems are OUT OF SCOPE because they are actually backup, deletion or storage issues?"
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setQuery(q); }}
                  className="text-xs font-medium bg-white border border-slate-300 text-slate-900 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 px-4 py-2 rounded-full transition-all text-left shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchStatus === 'loading' && (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Loader2 className="animate-spin text-teal-500" size={48} />
            <p className="font-medium">Synthesizing context from vector database...</p>
          </div>
        )}

        {searchStatus === 'success' && (
          <div className="p-0 border-t border-slate-200">
            <div className="p-6 bg-blue-50 border-b border-blue-100">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Bot size={20} /> AI Synthesis Answer
              </h3>
              <div className="text-slate-800 text-sm bg-white p-6 rounded-xl border border-blue-200 shadow-sm prose prose-sm max-w-none prose-slate prose-headings:text-blue-800 prose-headings:mb-2 prose-p:mb-4 prose-ul:my-2 prose-li:my-0 prose-strong:text-slate-900">
                <ReactMarkdown>{ragAnswer}</ReactMarkdown>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-slate-500" /> Traceable Evidence Sources
              </h3>
              <div className="space-y-3">
                {sources.map((src, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 text-sm shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-mono font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Evidence ID: {src.id}</div>
                      <div className="text-xs font-mono text-slate-500">Distance: {src.distance?.toFixed(3) || 'N/A'}</div>
                    </div>
                    <p className="text-slate-700 italic border-l-4 border-slate-300 pl-3 my-2">"{src.document}"</p>
                    <div className="mt-3 flex gap-4 text-xs font-medium text-slate-600">
                      <div><span className="text-slate-400">Outcome:</span> {src.metadata?.retrieval_outcome || 'Unknown'}</div>
                      <div><span className="text-slate-400">Failure:</span> {src.metadata?.failure_type || 'Unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-10 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={28} />
              Global Executive Report
            </h2>
            <p className="text-slate-900 font-medium mt-1">Synthesize all structured insights into a top-level summary.</p>
          </div>
          <button 
            onClick={generateReport}
            disabled={reportStatus === 'loading'}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 hover:border-blue-300 px-5 py-2.5 rounded-xl shadow-sm font-bold transition-all disabled:opacity-50"
          >
            {reportStatus === 'loading' ? <Loader2 className="animate-spin text-blue-600" size={18} /> : <FileText size={18} />}
            {reportStatus === 'loading' ? 'Synthesizing...' : 'Generate Report'}
          </button>
        </div>

        {reportStatus === 'success' && globalReport && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl shadow-inner border border-slate-100 md:col-span-2">
                <h3 className="font-bold text-blue-700 mb-2">1. In-Scope Scenarios</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{globalReport.in_scope_scenarios || "Data unavailable"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl shadow-inner border border-slate-100">
                <h3 className="font-bold text-blue-700 mb-2">2. Memory Landscape (Remembered)</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{globalReport.remembered_landscape || "Data unavailable"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl shadow-inner border border-slate-100">
                <h3 className="font-bold text-blue-700 mb-2">3. Memory Landscape (Forgotten)</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{globalReport.forgotten_landscape || "Data unavailable"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl shadow-inner border border-slate-100">
                <h3 className="font-bold text-blue-700 mb-2">4. Search Behaviors</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{globalReport.search_behaviors || "Data unavailable"}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl shadow-inner border border-slate-100">
                <h3 className="font-bold text-blue-700 mb-2">5. Retrieval Failures</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{globalReport.retrieval_failures || "Data unavailable"}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl shadow-inner border border-blue-200 md:col-span-2">
                <h3 className="font-bold text-blue-800 mb-2">Identified Opportunities</h3>
                <ul className="text-slate-800 text-sm leading-relaxed font-medium list-disc pl-5">
                  {(globalReport.opportunities || "Data unavailable").split('\n').filter(Boolean).slice(0, 5).map((opp, idx) => {
                    const cleanOpp = opp.replace(/^-\s*/, '');
                    // Basic bold parser for **text**
                    const parts = cleanOpp.split(/(\*\*.*?\*\*)/g);
                    return (
                      <li key={idx} className="mb-2">
                        {parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
