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

  const googleBlue = { text: "text-[#4285F4]", bg: "bg-[#E8F0FE]", border: "border-[#4285F4]/20" };
  const googleRed = { text: "text-[#EA4335]", bg: "bg-[#FCE8E6]", border: "border-[#EA4335]/20" };
  const googleYellow = { text: "text-[#FBBC05]", bg: "bg-[#FEF7E0]", border: "border-[#FBBC05]/20" };
  const googleGreen = { text: "text-[#34A853]", bg: "bg-[#E6F4EA]", border: "border-[#34A853]/20" };

  const MetricItem = ({ icon: Icon, title, value, googleColor }) => {
    const { text, bg, border } = googleColor;
    return (
      <div className={`flex items-center gap-1.5 ${bg} px-2 py-1.5 rounded-md border ${border} whitespace-nowrap`}>
        <Icon size={14} className={text} />
        <div>
          <div className={`${text} font-bold uppercase tracking-wider text-[8px] leading-tight`}>{title}</div>
          <div className={`font-bold ${text} text-sm leading-none mt-0.5`}>{value || 0}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 w-full overflow-hidden">
      <div className="p-2 w-full">
        <div className="flex items-center justify-between w-full overflow-hidden">
          {/* Base */}
          <MetricItem icon={Database} title="Raw Records" value={stats.total_raw} googleColor={googleBlue} />
          <MetricItem icon={Activity} title="AI Evidence" value={stats.total_insights} googleColor={googleGreen} />
          
          <div className="h-6 w-px bg-slate-200 shrink-0 hidden lg:block"></div>

          {/* Scope */}
          <MetricItem icon={CheckCircle2} title="In-Scope" value={stats.in_scope} googleColor={googleGreen} />
          <MetricItem icon={AlertTriangle} title="Adjacent" value={stats.adjacent} googleColor={googleYellow} />
          <MetricItem icon={XCircle} title="Out-Scope" value={stats.out_of_scope} googleColor={googleRed} />
          
          <div className="h-6 w-px bg-slate-200 shrink-0 hidden lg:block"></div>

          {/* Evidence Quality */}
          <MetricItem icon={Focus} title="Direct" value={stats.direct_evidence} googleColor={googleBlue} />
          <MetricItem icon={Compass} title="Directional" value={stats.directional_evidence} googleColor={googleYellow} />
          
          <div className="h-6 w-px bg-slate-200 shrink-0 hidden lg:block"></div>

          {/* Sources */}
          <MetricItem icon={Users} title="Authors" value={stats.unique_authors} googleColor={googleGreen} />
          <MetricItem icon={List} title="Sources" value={stats.independent_source_types} googleColor={googleBlue} />
        </div>
      </div>
      
      {/* Outcomes Row */}
      <div className="px-3 pb-3 border-t border-slate-100/50 bg-slate-50/30 pt-2 w-full">
         <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
            Retrieval Outcomes
         </div>
         <div className="flex flex-wrap gap-2 lg:gap-3">
           <MetricItem icon={FileSearch} title="Found Immediately" value={stats.found_immediately} googleColor={googleGreen} />
           <MetricItem icon={FileSearch} title="Found After Refinement" value={stats.found_after_refinement} googleColor={googleBlue} />
           <MetricItem icon={FileSearch} title="Found via Workaround" value={stats.found_via_workaround} googleColor={googleYellow} />
           <MetricItem icon={FileSearch} title="Not Found" value={stats.not_found} googleColor={googleRed} />
           <MetricItem icon={FileSearch} title="Abandoned" value={stats.abandoned} googleColor={googleRed} />
           <MetricItem icon={FileSearch} title="Unknown" value={stats.unknown} googleColor={googleBlue} />
         </div>
         <div className="text-[10px] text-slate-400 italic mt-3 pl-1">
           * Counts are evidence observations unless explicitly labelled as users/authors.
         </div>
      </div>
    </div>
  );
}
