import { useState } from 'react'
import VideoGenerator from './components/VideoGenerator'
import AvatarGenerator from './components/AvatarGenerator'
import GoldenDust from './components/GoldenDust'
import HolidayPromo from './components/HolidayPromo'
import AuthModal from './components/AuthModal'
import CompactHeaderInfo from './components/CompactHeaderInfo'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { Video, Sparkles, User, LogOut, Sun, Moon } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'


function AppContent() {
  const [activeTab, setActiveTab] = useState<'video' | 'avatar'>('video');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
  });

  // Sync Theme
  useState(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Listen for tab switch events from children
  useState(() => {
    const handleTabSwitch = (e: CustomEvent) => {
      if (e.detail && (e.detail === 'video' || e.detail === 'avatar')) {
        setActiveTab(e.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('switch-tab', handleTabSwitch as EventListener);
    return () => window.removeEventListener('switch-tab', handleTabSwitch as EventListener);
  });

  return (
    <div className={`min-h-screen flex flex-col text-[var(--text-primary)] selection:bg-[var(--text-secondary)] selection:text-black relative overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-pattern-deco' : 'bg-[var(--bg-primary)]'}`}>
      <PWAInstallPrompt />
      <GoldenDust theme={theme} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Texture Overlay for that 'Velvet' feel - Only in Dark Mode */}
      <div className={`fixed inset-0 pointer-events-none z-0 ${theme === 'dark' ? 'bg-black/80' : 'hidden'}`}></div>

      {/* Navigation - Strict Deco Style */}
      <nav className="w-full bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-40 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-24 py-2 md:py-0 gap-3 md:gap-0">
            {/* Logo Section */}
            <div className="flex items-center gap-2 md:gap-3 group cursor-pointer mb-2 md:mb-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-primary)] border border-[var(--text-secondary)] rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(210,172,71,0.2)] group-hover:shadow-[0_0_25px_rgba(210,172,71,0.4)] transition-all duration-500 animate-pulse">
                <Video className="text-[var(--text-secondary)] -rotate-45 group-hover:scale-110 transition-transform duration-500" size={18} />
              </div>
              <div className="ml-3 md:ml-4 flex flex-col">
                <span className="font-serif text-xl md:text-2xl tracking-[0.2em] text-[var(--text-primary)] uppercase font-bold drop-shadow-lg">AI Girls <span className="text-gold-luxury text-2xl md:text-3xl">Studio</span></span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-[1px] w-8 bg-[var(--text-secondary)]"></div>
                  <span className="text-[0.6rem] tracking-[0.4em] text-[var(--text-secondary)] uppercase font-bold">Infinity Avatars</span>
                  <div className="h-[1px] w-8 bg-[var(--text-secondary)]"></div>
                </div>
              </div>
            </div>

            {/* TAB SWITCHER - Art Deco Pill */}
            <div className="flex items-center p-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full shadow-inner relative w-full md:w-auto justify-center mx-4 md:mx-0 order-3 md:order-2">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-6 md:px-8 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-300 ${activeTab === 'video' ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)]' : 'text-[#d2ac47]/50 hover:text-[#d2ac47]'}`}
              >
                <Sparkles size={14} /> Cinematic Video
              </button>
              <button
                onClick={() => setActiveTab('avatar')}
                className={`px-6 md:px-8 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-300 ${activeTab === 'avatar' ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)]' : 'text-[#d2ac47]/50 hover:text-[#d2ac47]'}`}
              >
                <User size={14} /> Create Avatar
              </button>
            </div>

            {/* Auth / Profile Section */}
            <div className="flex items-center gap-4 order-2 md:order-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              <CompactHeaderInfo />
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden md:inline text-[10px] uppercase tracking-widest text-[#d2ac47]/80 font-bold">{user.email?.split('@')[0]}</span>
                  <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 border border-[#d2ac47]/30 rounded-full text-[#d2ac47] text-[10px] uppercase tracking-widest hover:bg-[#d2ac47] hover:text-black transition-all">
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#d2ac47]/10 border border-[#d2ac47] rounded-full text-[#d2ac47] text-[10px] uppercase tracking-widest hover:bg-[#d2ac47] hover:text-black hover:shadow-[0_0_20px_rgba(210,172,71,0.4)] transition-all"
                >
                  <User size={14} /> Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center relative z-20">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={activeTab === 'video' ? 'block' : 'hidden'}>
            <VideoGenerator />
          </div>
          <div className={activeTab === 'avatar' ? 'block' : 'hidden'}>
            <AvatarGenerator />
          </div>
        </div>
      </main>

      {/* Global Promo - Inserted in Flow for Mobile, Fixed for Desktop */}
      <div className="relative z-50 md:fixed md:bottom-8 md:right-8 pointer-events-none">
        {activeTab === 'avatar' && <HolidayPromo />}
      </div>

      {/* Simple Footer */}
      <footer className="bg-[var(--glass-bg)] backdrop-blur-md border-t border-[var(--border-color)] py-12 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[var(--text-secondary)]/60 text-xs tracking-[0.3em] uppercase">© 2026 AI Girls Studio. Strict Luxury.</p>
          <div className="flex items-center gap-8 text-xs text-[var(--text-secondary)]/80 uppercase tracking-[0.25em]">
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-1">Privacy</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-1">Terms</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-1">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
