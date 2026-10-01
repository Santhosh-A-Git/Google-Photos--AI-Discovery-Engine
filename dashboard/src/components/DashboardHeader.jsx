import React, { useEffect, useState } from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, XCircle, FileSearch, Users, List, Compass, Focus } from 'lucide-react';

export default function DashboardHeader() {
  const [stats, setStats] = useState({
    total_raw: 0,
    total_insights: 0,
    in_scope: 0,
    adjacent: 0,
    out_of_scope: 0,
    direct_evidence: 0,
    directional_evidence: 0,
    unique_authors: 0,
    independent_source_types: 0,
    found_immediately: 0,
    found_after_refinement: 0,
    found_via_workaround: 0,
    not_found: 0,
    abandoned: 0,
    unknown: 0
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
    
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const MetricItem = ({ icon: Icon, title, value, colorClass, bgClass, borderClass }) => (
    <div className={`flex items-center gap-2 ${bgClass} px-3 py-2 rounded-lg border ${borderClass} whitespace-nowrap`}>
      <Icon size={16} className={colorClass} />
      <div className="text-xs">
        <div className={`${colorClass} font-bold uppercase tracking-wide text-[10px]`}>{title}</div>
        <div className={`font-bold ${colorClass.replace('text-', 'text-').replace('500', '900')} text-lg leading-none`}>{value || 0}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 w-full">
      <div className="p-3 w-full">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full justify-between lg:justify-start">
          {/* Base */}
          <MetricItem icon={Database} title="Raw Records" value={stats.total_raw} colorClass="text-slate-500" bgClass="bg-slate-50" borderClass="border-slate-200" />
          <MetricItem icon={Activity} title="AI Extracted Evidence" value={stats.total_insights} colorClass="text-blue-500" bgClass="bg-blue-50" borderClass="border-blue-100" />
          
          <div className="h-8 w-px bg-slate-200 self-center"></div>

          {/* Scope */}
          <MetricItem icon={CheckCircle2} title="In-Scope" value={stats.in_scope} colorClass="text-emerald-500" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
          <MetricItem icon={AlertTriangle} title="Adjacent" value={stats.adjacent} colorClass="text-amber-500" bgClass="bg-amber-50" borderClass="border-amber-100" />
          <MetricItem icon={XCircle} title="Out-of-Scope" value={stats.out_of_scope} colorClass="text-rose-500" bgClass="bg-rose-50" borderClass="border-rose-100" />
          
          <div className="h-8 w-px bg-slate-200 self-center"></div>

          {/* Evidence Quality */}
          <MetricItem icon={Focus} title="Direct Evidence" value={stats.direct_evidence} colorClass="text-purple-500" bgClass="bg-purple-50" borderClass="border-purple-100" />
          <MetricItem icon={Compass} title="Directional" value={stats.directional_evidence} colorClass="text-indigo-500" bgClass="bg-indigo-50" borderClass="border-indigo-100" />
          
          <div className="h-8 w-px bg-slate-200 self-center"></div>

          {/* Sources */}
          <MetricItem icon={Users} title="Unique Authors" value={stats.unique_authors} colorClass="text-cyan-500" bgClass="bg-cyan-50" borderClass="border-cyan-100" />
          <MetricItem icon={List} title="Source Types" value={stats.independent_source_types} colorClass="text-teal-500" bgClass="bg-teal-50" borderClass="border-teal-100" />
        </div>
      </div>
      
      {/* Outcomes Row */}
      <div className="px-3 pb-3 border-t border-slate-100/50 bg-slate-50/30 pt-2 w-full">
         <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Retrieval Outcomes
         </div>
         <div className="flex flex-wrap gap-2 lg:gap-3">
           <MetricItem icon={FileSearch} title="Found Immediately" value={stats.found_immediately} colorClass="text-green-500" bgClass="bg-green-50" borderClass="border-green-100" />
           <MetricItem icon={FileSearch} title="Found After Refinement" value={stats.found_after_refinement} colorClass="text-blue-500" bgClass="bg-blue-50" borderClass="border-blue-100" />
           <MetricItem icon={FileSearch} title="Found via Workaround" value={stats.found_via_workaround} colorClass="text-orange-500" bgClass="bg-orange-50" borderClass="border-orange-100" />
           <MetricItem icon={FileSearch} title="Not Found" value={stats.not_found} colorClass="text-red-500" bgClass="bg-red-50" borderClass="border-red-100" />
           <MetricItem icon={FileSearch} title="Abandoned" value={stats.abandoned} colorClass="text-pink-500" bgClass="bg-pink-50" borderClass="border-pink-100" />
           <MetricItem icon={FileSearch} title="Unknown" value={stats.unknown} colorClass="text-slate-400" bgClass="bg-slate-100" borderClass="border-slate-200" />
         </div>
         <div className="text-[10px] text-slate-400 italic mt-3 pl-1">
           * Counts are evidence observations unless explicitly labelled as users/authors.
         </div>
      </div>
    </div>
  );
}
