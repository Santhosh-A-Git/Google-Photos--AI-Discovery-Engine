import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Database } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DataSources = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        <Database color="#EA4335" size={32} />
        Data Sources
      </h1>
      <p className="text-slate-900 font-medium mb-8 text-lg">Platform breakdown of all ingested raw insights.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Source Distribution</h2>
          {stats ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <Pie
                    data={stats.sources}
                    cx="40%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(stats.sources || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Insights`, 'Volume']} 
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '13px', paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">Loading chart data...</div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
            <h3 className="text-blue-800 font-bold mb-2 uppercase text-xs tracking-widest">Total Conversations Scraped</h3>
            <p className="text-4xl font-black text-blue-600">{stats ? stats.total_conversations : '...'}</p>
          </div>
          
          <div className="bg-teal-50 border border-teal-100 p-6 rounded-xl shadow-sm">
            <h3 className="text-teal-800 font-bold mb-2 uppercase text-xs tracking-widest">Total Valid Insights Extracted</h3>
            <p className="text-4xl font-black text-teal-600">{stats ? stats.total_insights : '...'}</p>
            <p className="text-sm text-teal-700/70 mt-2">Structured retrieval problems parsed by the AI engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSources;
