import { useState, useEffect } from 'react';
import { Moon, Sun, Activity, BarChart3, Home, Menu, X, PieChart, Cpu, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; 
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';


export function Layout({ children }: { children: React.ReactNode }) {
  // Default to Night Mode
  const [isDark, setIsDark] = useState(true); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, t, toggleLanguage } = useLanguage();

  // This useEffect is what actually applies the 'dark' class to the HTML tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Logo and Desktop Nav */}
            <div className="flex min-w-0 items-center gap-8">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex min-w-0 items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl">
                <Activity className="w-6 h-6 shrink-0" />
                <span className="truncate">{t('app_name')}</span>
              </Link>

              <nav className="hidden md:flex gap-1" aria-label={t('aria_primary_navigation')}>
                <NavItem to="/" icon={<Home size={18} />} label={t('nav_overview')} />
                <NavItem to="/predict" icon={<BarChart3 size={18} />} label={t('nav_predict')} />
                <NavItem to="/segments" icon={<PieChart size={18} />} label={t('nav_segments')} />
                <NavItem to="/model" icon={<Cpu size={18} />} label={t('nav_model')} />
                <NavItem to="/data" icon={<Database size={18} />} label={t('nav_data')} />

              </nav>
            </div>
            
            {/* Right-side Controls */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                aria-label={isDark ? t('aria_switch_light') : t('aria_switch_dark')}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                type="button"
                onClick={toggleLanguage}
                className="p-2 rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                aria-label={language === 'en' ? t('aria_switch_turkish') : t('aria_switch_english')}
              >
                {language === 'en' ? 'TR' : 'EN'}
              </button>

              <div className="hidden lg:block text-sm text-slate-600 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-700 pl-4">
                {t('snapshot')}
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                aria-label={isMenuOpen ? t('aria_close_menu') : t('aria_open_menu')}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={cn(
              "md:hidden grid transition-[grid-template-rows,opacity] duration-200 ease-out",
              isMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <nav className="overflow-hidden" aria-label={t('aria_mobile_navigation')}>
              <div className="flex flex-col gap-1 pb-4 pt-1">
                <NavItem to="/" icon={<Home size={18} />} label={t('nav_overview')} onNavigate={() => setIsMenuOpen(false)} />
                <NavItem to="/predict" icon={<BarChart3 size={18} />} label={t('nav_predict')} onNavigate={() => setIsMenuOpen(false)} />
                <NavItem to="/segments" icon={<PieChart size={18} />} label={t('nav_segments')} onNavigate={() => setIsMenuOpen(false)} />
                <NavItem to="/model" icon={<Cpu size={18} />} label={t('nav_model')} onNavigate={() => setIsMenuOpen(false)} />
                <NavItem to="/data" icon={<Database size={18} />} label={t('nav_data')} onNavigate={() => setIsMenuOpen(false)} />
              </div>
            </nav>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Helper for Nav Links
function NavItem({ to, icon, label, onNavigate }: { to: string, icon: React.ReactNode, label: string, onNavigate?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
        isActive 
          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
