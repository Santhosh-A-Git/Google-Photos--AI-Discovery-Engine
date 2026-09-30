import React, { useEffect, useState } from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, XCircle, LayoutDashboard } from 'lucide-react';

export default function DashboardHeader() {
  const [stats, setStats] = useState({
    total_raw_records: 0,
    total_insights_extracted: 0,
    scopes: [],
    outcomes: [],
    failures: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
    
    // Refresh stats every 10 seconds during extraction phase
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const getScopeCount = (status) => {
    const scope = (stats.scopes || []).find(s => s.name === status);
    return scope ? scope.value : 0;
  };

  const getOutcomeCount = (outcome) => {
    const out = (stats.outcomes || []).find(o => o.name === outcome);
    return out ? out.value : 0;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm p-4 sticky top-0 z-10 flex gap-4 overflow-x-auto">
      <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 whitespace-nowrap">
        <Database size={16} className="text-slate-500" />
        <div className="text-xs">
          <div className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Total Raw Records</div>
          <div className="font-bold text-slate-800 text-lg leading-none">{stats.total_raw_records}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 whitespace-nowrap">
        <Activity size={16} className="text-blue-500" />
        <div className="text-xs">
          <div className="text-blue-600 font-bold uppercase tracking-wide text-[10px]">AI Extracted Evidence</div>
          <div className="font-bold text-blue-900 text-lg leading-none">{stats.total_insights_extracted}</div>
        </div>
      </div>
      
      <div className="h-10 w-px bg-slate-200 mx-2 self-center"></div>

      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 whitespace-nowrap">
        <CheckCircle2 size={16} className="text-emerald-500" />
        <div className="text-xs">
          <div className="text-emerald-600 font-bold uppercase tracking-wide text-[10px]">In-Scope</div>
          <div className="font-bold text-emerald-900 text-lg leading-none">{getScopeCount("IN_SCOPE")}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 whitespace-nowrap">
        <AlertTriangle size={16} className="text-amber-500" />
        <div className="text-xs">
          <div className="text-amber-600 font-bold uppercase tracking-wide text-[10px]">Adjacent</div>
          <div className="font-bold text-amber-900 text-lg leading-none">{getScopeCount("ADJACENT")}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 whitespace-nowrap">
        <XCircle size={16} className="text-rose-500" />
        <div className="text-xs">
          <div className="text-rose-600 font-bold uppercase tracking-wide text-[10px]">Out of Scope</div>
          <div className="font-bold text-rose-900 text-lg leading-none">{getScopeCount("OUT_OF_SCOPE")}</div>
        </div>
      </div>
      
      <div className="h-10 w-px bg-slate-200 mx-2 self-center"></div>

      <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 whitespace-nowrap">
        <LayoutDashboard size={16} className="text-indigo-500" />
        <div className="text-xs">
          <div className="text-indigo-600 font-bold uppercase tracking-wide text-[10px]">Found after refinement</div>
          <div className="font-bold text-indigo-900 text-lg leading-none">{getOutcomeCount("FOUND_AFTER_REFINEMENT")}</div>
        </div>
      </div>
    </div>
  );
}
