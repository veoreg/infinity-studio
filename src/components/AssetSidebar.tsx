import React, { useState } from 'react';
import { Image, Clock, User } from 'lucide-react';
import UserGallery from './UserGallery';
// We'll import History or other components here later

interface AssetSidebarProps {
    onSelectImage: (url: string) => void;
}

const AssetSidebar: React.FC<AssetSidebarProps> = ({ onSelectImage }) => {
    const [activeTab, setActiveTab] = useState<'avatars' | 'history'>('avatars');

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] border border-[#d2ac47]/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Sidebar Header / Tabs */}
            <div className="flex border-b border-[#d2ac47]/20">
                <button
                    onClick={() => setActiveTab('avatars')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all
                        ${activeTab === 'avatars'
                            ? 'bg-[#d2ac47]/10 text-[#d2ac47] shadow-[inset_0_-2px_0_#d2ac47]'
                            : 'text-[#d2ac47]/40 hover:text-[#d2ac47]/80 hover:bg-[#d2ac47]/5'
                        }`}
                >
                    <User size={14} /> My Avatars
                </button>
                <div className="w-[1px] bg-[#d2ac47]/20"></div>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all
                        ${activeTab === 'history'
                            ? 'bg-[#d2ac47]/10 text-[#d2ac47] shadow-[inset_0_-2px_0_#d2ac47]'
                            : 'text-[#d2ac47]/40 hover:text-[#d2ac47]/80 hover:bg-[#d2ac47]/5'
                        }`}
                >
                    <Clock size={14} /> History
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {activeTab === 'avatars' && (
                    <div className="space-y-4">
                        {/* Placeholder for UserGallery in minimal mode */}
                        {/* We might need to adjust UserGallery to fit in a sidebar or pass a 'compact' prop */}
                        <div className="text-center py-10 opacity-50">
                            <p className="text-[#d2ac47] text-xs">Your Generations</p>
                        </div>
                        {/* 
                             NOTE: Ideally, UserGallery should be refactored to specific "Sidebar Mode".
                             For now, we place a placeholder or simply reuse UserGallery if it fits. 
                             The user wants "Galleries" here.
                         */}
                        <UserGallery compact={true} onSelect={(item) => onSelectImage(item.url || item.result_url || '')} />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 h-full flex flex-col">
                        <UserGallery compact={true} onSelect={(item) => onSelectImage(item.url || item.result_url || '')} />
                    </div>
                )}
            </div>

            {/* Footer / Upload Quick Action */}
            <div className="p-4 border-t border-[#d2ac47]/20 bg-[#080808]">
                <button className="w-full py-3 border border-dashed border-[#d2ac47]/40 rounded-xl text-[#d2ac47]/60 text-[10px] uppercase tracking-widest hover:bg-[#d2ac47]/5 hover:border-[#d2ac47] transition-all flex items-center justify-center gap-2">
                    <Image size={14} /> Upload Ref
                </button>
            </div>
        </div>
    );
};

export default AssetSidebar;
