import { useState } from 'react'
import VideoGenerator from './components/VideoGenerator'
import AvatarGenerator from './components/AvatarGenerator'
import GoldenDust from './components/GoldenDust'
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 group cursor-pointer">
              {/* Geometric Logo container */}
              <div className="w-12 h-12 border-2 border-[#d2ac47] rotate-45 flex items-center justify-center bg-black group-hover:bg-[#d2ac47] transition-all duration-300 shadow-[0_0_10px_rgba(210,172,71,0.2)]">
                <div className="w-8 h-8 border border-[#fbeea4] flex items-center justify-center">
                  <Video size={18} className="text-[#fbeea4] -rotate-45 group-hover:text-black transition-colors duration-300" />
                </div>
              </div>
              <div className="flex flex-col ml-3">
                <span className="font-serif text-2xl tracking-[0.2em] text-[#F9F1D8] uppercase font-bold drop-shadow-lg">AI Girls <span className="text-gold-luxury text-3xl">Studio</span></span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-[1px] w-8 bg-[#d2ac47]"></div>
                  <span className="text-[0.6rem] tracking-[0.4em] text-[#d2ac47] uppercase font-bold">Infinity Avatars</span>
                  <div className="h-[1px] w-8 bg-[#d2ac47]"></div>
                </div>
              </div>
            </div>

            {/* TAB SWITCHER - Art Deco Pill */}
            <div className="hidden md:flex items-center p-1 bg-[#0f0f0f] border border-[#d2ac47]/30 rounded-full shadow-inner relative">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-300 ${activeTab === 'video' ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)]' : 'text-[#d2ac47]/50 hover:text-[#d2ac47]'}`}
              >
                <Sparkles size={14} /> Cinematic Video
              </button>
              <button
                onClick={() => setActiveTab('avatar')}
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-300 ${activeTab === 'avatar' ? 'bg-gold-gradient text-black shadow-[0_0_20px_rgba(210,172,71,0.4)]' : 'text-[#d2ac47]/50 hover:text-[#d2ac47]'}`}
              >
                <User size={14} /> Create Avatar
              </button>
            </div>

            <div className="flex items-center gap-6">
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
