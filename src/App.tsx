import { useState } from 'react'
import VideoGenerator from './components/VideoGenerator'
import AvatarGenerator from './components/AvatarGenerator'
import GoldenDust from './components/GoldenDust'
import HolidayPromo from './components/HolidayPromo'
import { Video, Github, Sparkles, User } from 'lucide-react'


function App() {
  const [activeTab, setActiveTab] = useState<'video' | 'avatar'>('video');

  return (
    <div className="min-h-screen flex flex-col text-[#F9F1D8] selection:bg-[#d2ac47] selection:text-black relative bg-pattern-deco overflow-x-hidden">
      <GoldenDust />

      {/* Texture Overlay for that 'Velvet' feel */}
      <div className="fixed inset-0 bg-black/80 pointer-events-none z-0"></div>

      {/* Navigation - Strict Deco Style */}
      <nav className="w-full bg-[#080808]/90 backdrop-blur-md border-b border-[#d2ac47]/30 sticky top-0 z-40 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-24 py-4 md:py-0 gap-4 md:gap-0">
            {/* Logo Section */}
            <div className="flex items-center gap-3 group cursor-pointer mb-2 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#d2ac47] rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(210,172,71,0.2)] group-hover:shadow-[0_0_25px_rgba(210,172,71,0.4)] transition-all duration-500 animate-pulse">
                <Video className="text-[#d2ac47] -rotate-45 group-hover:scale-110 transition-transform duration-500" size={20} />
              </div>
              <div className="ml-4 flex flex-col">
                <span className="font-serif text-2xl tracking-[0.2em] text-[#F9F1D8] uppercase font-bold drop-shadow-lg">AI Girls <span className="text-gold-luxury text-3xl">Studio</span></span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-[1px] w-8 bg-[#d2ac47]"></div>
                  <span className="text-[0.6rem] tracking-[0.4em] text-[#d2ac47] uppercase font-bold">Infinity Avatars</span>
                  <div className="h-[1px] w-8 bg-[#d2ac47]"></div>
                </div>
              </div>
            </div>

            {/* TAB SWITCHER - Art Deco Pill */}
            <div className="flex items-center p-1 bg-[#0f0f0f] border border-[#d2ac47]/30 rounded-full shadow-inner relative w-full md:w-auto justify-center mx-4 md:mx-0 order-3 md:order-2">
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

            <div className="flex items-center gap-6 order-2 md:order-3">
              <button className="text-[#d2ac47] hover:text-[#fbeea4] transition-colors hover:scale-110 transform duration-300">
                <Github size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center relative z-10">
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
      <footer className="bg-[#050505] border-t border-[#d2ac47]/20 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#d2ac47]/40 text-xs tracking-[0.3em] uppercase">© 2026 AI Girls Studio. Strict Luxury.</p>
          <div className="flex items-center gap-8 text-xs text-[#d2ac47]/60 uppercase tracking-[0.25em]">
            <a href="#" className="hover:text-[#fbeea4] transition-colors border-b border-transparent hover:border-[#fbeea4] pb-1">Privacy</a>
            <a href="#" className="hover:text-[#fbeea4] transition-colors border-b border-transparent hover:border-[#fbeea4] pb-1">Terms</a>
            <a href="#" className="hover:text-[#fbeea4] transition-colors border-b border-transparent hover:border-[#fbeea4] pb-1">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
