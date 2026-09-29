import React from 'react';
import { GitMerge } from 'lucide-react';

const RetrievalJourney = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <GitMerge color="#FBBC05" size={32} />
        Retrieval Journey
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">Visualization of the memory retrieval funnel and common drop-off points.</p>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          {/* Funnel Steps */}
          <div className="w-full bg-slate-50 py-3 px-4 rounded-lg text-center relative z-10 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-yellow-600 text-lg">Memory Trigger</h3>
            <p className="text-sm text-slate-600 mt-1">User remembers a visual moment but needs the photo.</p>
          </div>
          
          <div className="h-4 w-1 bg-slate-200"></div>
          
          <div className="w-5/6 bg-slate-50 py-3 px-4 rounded-lg text-center relative z-10 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-yellow-600 text-lg">Search Attempt</h3>
            <p className="text-sm text-slate-600 mt-1">User formulates a search based on partial memory (e.g. location, object).</p>
          </div>
          
          <div className="h-4 w-1 bg-slate-200"></div>
          
          <div className="w-4/6 bg-slate-50 py-3 px-4 rounded-lg text-center relative z-10 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-yellow-700 text-lg">Failure Point</h3>
            <p className="text-sm text-slate-600 mt-1">System fails to match the partial memory string to the correct image.</p>
          </div>
          
          <div className="h-4 w-1 bg-slate-200"></div>
          
          <div className="w-3/6 bg-white py-3 px-4 rounded-lg text-center relative z-10 border border-slate-300 shadow-sm">
            <h3 className="font-bold text-yellow-700 text-lg">Outcome: Abandonment</h3>
            <p className="text-sm text-slate-500 mt-1">User gives up scrolling or searching.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetrievalJourney;
