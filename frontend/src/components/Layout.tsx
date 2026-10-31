import { useState, useEffect } from 'react';
import { Moon, Sun, Activity, BarChart3, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; 

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true); // Default to Night Mode

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-brand dark:text-blue-500 font-bold text-xl">
              <Activity className="w-6 h-6" />
              <span>Market Analyzer</span>
            </div>
            
            <nav className="hidden md:flex gap-1">
              <NavItem to="/" icon={<Home size={18} />} label="Overview" />
              <NavItem to="/predict" icon={<BarChart3 size={18} />} label="Predict" />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-700 pl-4">
              Snapshot: Sep 2026
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Helper for Nav Links
import { cn } from '../utils'; 

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive 
          ? "bg-brand/10 text-brand dark:bg-blue-500/10 dark:text-blue-400" 
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}