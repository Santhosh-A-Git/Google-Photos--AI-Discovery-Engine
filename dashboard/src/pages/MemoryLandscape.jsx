import React, { useEffect, useState } from 'react';
import { GitMerge, Users, MapPin, Calendar, CalendarRange, Box, Image as ImageIcon, Type, Link2 } from 'lucide-react';

const MemoryLandscape = () => {
  const [data, setData] = useState({
    people_remembered: [],
    place_remembered: [],
    time_remembered: [],
    event_remembered: [],
    object_remembered: [],
    visuals_remembered: [],
    text_remembered: [],
    relationship_remembered: [],
    total_in_scope: 0
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/landscape`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  const DimensionCard = ({ title, icon, items, colorClass }) => (
    <div className={`bg-white rounded-xl p-6 border shadow-sm ${colorClass}`}>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Remembered Details ({items?.length || 0})</div>
      <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 mb-4" style={{maxHeight: '120px'}}>
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-2 rounded-lg text-sm border border-slate-100 text-slate-700">
              "{item}"
            </div>
          ))
        ) : (
          <div className="text-slate-400 text-sm italic">No data extracted yet.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <GitMerge color="#FBBC05" size={32} />
        Memory Landscape
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">What Users Remember vs What They Forget</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DimensionCard 
          title="People" 
          icon={<Users size={20} className="text-blue-500" />} 
          items={data.people_remembered} 
          colorClass="border-blue-200" 
        />
        <DimensionCard 
          title="Place / Location" 
          icon={<MapPin size={20} className="text-rose-500" />} 
          items={data.place_remembered} 
          colorClass="border-rose-200" 
        />
        <DimensionCard 
          title="Time" 
          icon={<Calendar size={20} className="text-amber-500" />} 
          items={data.time_remembered} 
          colorClass="border-amber-200" 
        />
        <DimensionCard 
          title="Event / Occasion" 
          icon={<CalendarRange size={20} className="text-emerald-500" />} 
          items={data.event_remembered} 
          colorClass="border-emerald-200" 
        />
        <DimensionCard 
          title="Object" 
          icon={<Box size={20} className="text-indigo-500" />} 
          items={data.object_remembered} 
          colorClass="border-indigo-200" 
        />
        <DimensionCard 
          title="Visual" 
          icon={<ImageIcon size={20} className="text-pink-500" />} 
          items={data.visuals_remembered} 
          colorClass="border-pink-200" 
        />
        <DimensionCard 
          title="Text" 
          icon={<Type size={20} className="text-cyan-500" />} 
          items={data.text_remembered} 
          colorClass="border-cyan-200" 
        />
        <DimensionCard 
          title="Relationship / Context" 
          icon={<Link2 size={20} className="text-violet-500" />} 
          items={data.relationship_remembered} 
          colorClass="border-violet-200" 
        />
      </div>

      <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>⚠️</span> Recurring Missing Retrieval Clues
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700">Exact Dates</h3>
            <p className="text-sm text-slate-500 mt-1">Users rarely remember the exact month or year, leading to failure when scrolling timeline or using time constraints.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700">Specific Albums</h3>
            <p className="text-sm text-slate-500 mt-1">Users forget if the photo was ever added to a named album, rendering album navigation useless.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700">Filenames / Searchable Tags</h3>
            <p className="text-sm text-slate-500 mt-1">Users do not know the exact textual tags the system requires (e.g. "Receipt" vs "Bill").</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryLandscape;
