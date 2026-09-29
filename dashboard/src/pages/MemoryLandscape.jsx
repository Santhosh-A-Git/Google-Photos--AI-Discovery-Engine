import React, { useEffect, useState } from 'react';
import { GitMerge } from 'lucide-react';

const MemoryLandscape = () => {
  const [data, setData] = useState({ remembered_items: [], forgotten_items: [], total_insights: 0 });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/landscape`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <GitMerge color="#FBBC05" size={32} />
        Memory Landscape
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">What users remember vs. what they forget when retrieving visual memories.</p>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-yellow-600 mb-3">Retrieval Journey (Drop-off Funnel)</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            {/* Funnel Steps */}
            <div className="w-full bg-slate-50 py-2 px-4 rounded-lg text-center relative z-10 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-yellow-600 text-base">Memory Trigger</h3>
              <p className="text-xs text-slate-600">User remembers a visual moment but needs the photo.</p>
            </div>
            
            <div className="h-4 w-1 bg-slate-200"></div>
            
            <div className="w-5/6 bg-slate-50 py-2 px-4 rounded-lg text-center relative z-10 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-yellow-600 text-base">Search Attempt</h3>
              <p className="text-xs text-slate-600">User formulates a search based on partial memory (e.g. location, object).</p>
            </div>
            
            <div className="h-4 w-1 bg-slate-200"></div>
            
            <div className="w-4/6 bg-slate-50 py-2 px-4 rounded-lg text-center relative z-10 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-yellow-700 text-base">Failure Point</h3>
              <p className="text-xs text-slate-600">System fails to match the partial memory string to the correct image.</p>
            </div>
            
            <div className="h-4 w-1 bg-slate-200"></div>
            
            <div className="w-3/6 bg-white py-2 px-4 rounded-lg text-center relative z-10 border border-slate-300 shadow-sm">
              <h3 className="font-bold text-yellow-700 text-base">Outcome: Abandonment</h3>
              <p className="text-xs text-slate-500">User gives up scrolling or searching.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-100 flex flex-col shadow-inner">
          <h2 className="text-2xl font-bold text-teal-700 mb-4 flex items-center gap-2 tracking-wide">
            <span>🧠</span> What Users Remember
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar" style={{maxHeight: '400px'}}>
            {data.remembered_items.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm text-slate-800 border border-slate-200">
                {item}
              </div>
            ))}
            {data.remembered_items.length === 0 && <div className="text-slate-500 font-medium">No data available</div>}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-6 border border-red-100 flex flex-col shadow-inner">
          <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2 tracking-wide">
            <span>❓</span> What Users Forget
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar" style={{maxHeight: '400px'}}>
            {data.forgotten_items.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm text-slate-800 border border-slate-200 hover:border-slate-300 transition-colors">
                {item}
              </div>
            ))}
            {data.forgotten_items.length === 0 && <div className="text-slate-500 font-medium">No data available</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryLandscape;
