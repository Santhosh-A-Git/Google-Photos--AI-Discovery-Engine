import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { 
  Database, 
  Search, 
  Brain, 
  GitMerge, 
  Layers, 
  Lightbulb,
  Bot
} from 'lucide-react';

// Pages
import DataSources from './pages/DataSources';
import EvidenceExplorer from './pages/EvidenceExplorer';
import MemoryLandscape from './pages/MemoryLandscape';
import RetrievalJourney from './pages/RetrievalJourney';
import ProblemLandscape from './pages/ProblemLandscape';
import OpportunityExplorer from './pages/OpportunityExplorer';
import PMQueries from './pages/PMQueries';

function App() {
  const navItems = [
    { path: '/queries', name: 'AI PM Assistant', icon: <Bot size={20} />, activeColor: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' },
    { path: '/sources', name: 'Data Sources', icon: <Database size={20} />, activeColor: 'bg-red-50 text-red-700 border-l-4 border-red-500' },
    { path: '/landscape', name: 'Memory & Retrieval Journey', icon: <GitMerge size={20} />, activeColor: 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' },
    { path: '/evidence', name: 'Evidence Explorer', icon: <Search size={20} />, activeColor: 'bg-green-50 text-green-700 border-l-4 border-green-500' },
    { path: '/problems', name: 'Problem Landscape', icon: <Layers size={20} />, activeColor: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' },
    { path: '/opportunities', name: 'Opportunity Explorer', icon: <Lightbulb size={20} />, activeColor: 'bg-red-50 text-red-700 border-l-4 border-red-500' }
  ];

  return (
    <BrowserRouter>
      {/* Light Background */}
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
        
        {/* Decorative Blur Orbs for Glassmorphism */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/60 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100/60 blur-[120px] pointer-events-none"></div>

        {/* Sidebar Navigation */}
        <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col shadow-2xl z-20">
          <div className="p-8 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#4285F4,#EA4335,#FBBC05,#34A853)] flex items-center justify-center text-white font-black shadow-lg">
              AI
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight text-lg tracking-wide">
                <span className="bg-gradient-to-r from-[#4285F4] to-[#EA4335] text-transparent bg-clip-text">Discovery </span>
                <span className="text-slate-800">Engine</span>
              </h1>
              <div className="text-[11px] font-black tracking-[0.2em] mt-1">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">O</span>
                <span className="text-[#FBBC05]">O</span>
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#34A853]">L</span>
                <span className="text-[#EA4335]">E</span>
                <span className="text-slate-500 ml-1">PHOTOS</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={({isActive}) => 
                  `flex items-center gap-3 p-3 transition-all duration-300 ease-out group rounded-xl ${
                    isActive 
                      ? `${item.activeColor} bg-opacity-60 backdrop-blur-md font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.03)]` 
                      : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 font-medium hover:backdrop-blur-sm'
                  }`
                }
              >
                <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </div>
                <span className="tracking-wide">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white/90 backdrop-blur-3xl z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] m-0 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Navigate to="/queries" replace />} />
            <Route path="/queries" element={<PMQueries />} />
            <Route path="/sources" element={<DataSources />} />
            <Route path="/landscape" element={<MemoryLandscape />} />
            <Route path="/evidence" element={<EvidenceExplorer />} />
            <Route path="/problems" element={<ProblemLandscape />} />
            <Route path="/opportunities" element={<OpportunityExplorer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
