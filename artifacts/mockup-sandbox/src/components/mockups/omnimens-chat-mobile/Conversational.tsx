import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Mic, 
  Camera, 
  ArrowUp,
  Check,
  CheckCheck
} from 'lucide-react';

export function Conversational() {
  const [isTyping, setIsTyping] = useState(true);

  return (
    <div className="w-[390px] h-[844px] mx-auto overflow-hidden bg-[#0E1525] text-white font-['Inter'] relative flex flex-col shadow-2xl border border-[#2B3245]/50 rounded-[40px] my-10">
      
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-[#0E1525]/80 backdrop-blur-xl z-20 border-b border-[#2B3245]/30">
        <button className="p-2 -ml-2 rounded-full hover:bg-[#1C2333] transition-colors text-[#a855f7]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-widest text-[#9DA5B4] mb-0.5">OMNIMENS</span>
          <h1 className="text-sm font-semibold">Sci-Fi Novel Brainstorm</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#06b6d4] p-[1px]">
          <div className="w-full h-full bg-[#0E1525] rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">O</span>
          </div>
        </div>
      </header>

      {/* Top Gradient Overlay for scroll indication */}
      <div className="absolute top-[88px] left-0 right-0 h-6 bg-gradient-to-b from-[#0E1525] to-transparent z-10 pointer-events-none" />

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-40 flex flex-col gap-5 [&::-webkit-scrollbar]:hidden">
        
        {/* Date Divider */}
        <div className="flex items-center justify-center mt-2 mb-4">
          <span className="text-[10px] font-medium text-[#5c667a] bg-[#1C2333] px-3 py-1 rounded-full border border-[#2B3245]/50">Yesterday</span>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-end">
          <div className="relative max-w-[80%] bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white px-4 py-2.5 rounded-[20px] rounded-br-[4px] shadow-sm shadow-[#7c3aed]/20">
            <p className="text-[15px] leading-relaxed">I'm stuck on chapter 4. The protagonist, Elara, just discovered the alien artifact, but I don't know how she should react.</p>
          </div>
          <div className="flex items-center gap-1 mt-1 pr-1">
            <span className="text-[10px] text-[#5c667a]">8:42 PM</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#a855f7]" />
          </div>
        </div>

        {/* Assistant Message */}
        <div className="flex flex-col items-start mt-2">
          <div className="relative max-w-[85%] bg-[#1C2333] text-white px-4 py-3 rounded-[20px] rounded-bl-[4px] border-l-2 border-l-[#a855f7] shadow-sm">
            <p className="text-[15px] leading-relaxed text-[#D1D5DB]">
              Given Elara's background as a xenobiologist, her first reaction wouldn't be fear—it would be pure, overwhelming curiosity. 
            </p>
            <p className="text-[15px] leading-relaxed text-[#D1D5DB] mt-2">
              What if she notices the artifact is emitting a frequency that matches her own heartbeat?
            </p>
            
            {/* Reactions */}
            <div className="absolute -bottom-3 right-4 flex items-center gap-1 bg-[#2B3245] rounded-full px-1.5 py-0.5 border border-[#3D4659] shadow-md">
              <span className="text-xs">✨</span>
              <span className="text-[10px] text-white font-medium">1</span>
            </div>
          </div>
          <span className="text-[10px] text-[#5c667a] mt-1.5 pl-1">8:43 PM • o3-mini</span>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-end mt-4">
          <div className="relative max-w-[80%] bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white px-4 py-2.5 rounded-[20px] rounded-br-[4px] shadow-sm shadow-[#7c3aed]/20">
            <p className="text-[15px] leading-relaxed">Oh wow, that's brilliant. Then she could realize it's not just a relic, but something active. Can you give me a short descriptive paragraph of what it looks like?</p>
          </div>
          <div className="flex items-center gap-1 mt-1 pr-1">
            <span className="text-[10px] text-[#5c667a]">8:45 PM</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#a855f7]" />
          </div>
        </div>

        {/* Date Divider */}
        <div className="flex items-center justify-center mt-6 mb-4">
          <span className="text-[10px] font-medium text-[#5c667a] bg-[#1C2333] px-3 py-1 rounded-full border border-[#2B3245]/50">Today</span>
        </div>

        {/* Assistant Message */}
        <div className="flex flex-col items-start">
          <div className="relative max-w-[85%] bg-[#1C2333] text-white px-4 py-3 rounded-[20px] rounded-bl-[4px] border-l-2 border-l-[#a855f7] shadow-sm">
            <p className="text-[15px] leading-relaxed text-[#D1D5DB]">
              "The object didn't rest on the pedestal; it hovered a fraction of an inch above it, held by invisible tension. Its surface was a mesmerizing fractal lattice of obsidian and violet, continuously folding in on itself like liquid glass. As Elara stepped closer, the violet veins pulsed—a steady, rhythmic thrum that resonated in the marrow of her bones, syncing perfectly with the frantic drum of her own heart."
            </p>
            
            {/* Reactions */}
            <div className="absolute -bottom-3 right-4 flex items-center gap-1 bg-[#2B3245] rounded-full px-1.5 py-0.5 border border-[#3D4659] shadow-md">
              <span className="text-xs">🔥</span>
            </div>
          </div>
          <span className="text-[10px] text-[#5c667a] mt-1.5 pl-1">10:12 AM • Claude 3.5</span>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-end mt-4">
          <div className="relative max-w-[80%] bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white px-4 py-2.5 rounded-[20px] rounded-br-[4px] shadow-sm shadow-[#7c3aed]/20">
            <p className="text-[15px] leading-relaxed">Perfect. Writing that in now.</p>
          </div>
          <div className="flex items-center gap-1 mt-1 pr-1">
            <span className="text-[10px] text-[#5c667a]">10:15 AM</span>
            <Check className="w-3.5 h-3.5 text-[#5c667a]" />
          </div>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start mt-2 animate-in fade-in duration-300">
            <div className="bg-[#1C2333] px-4 py-3 rounded-[20px] rounded-bl-[4px] border border-[#2B3245] shadow-sm w-16 h-10 flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Peek (Conversations) */}
      <div className="absolute bottom-0 w-full h-16 bg-[#1C2333] border-t border-[#2B3245] rounded-t-[24px] z-20 flex flex-col items-center justify-start pt-2 cursor-pointer hover:bg-[#20283b] transition-colors shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="w-10 h-1 bg-[#3D4659] rounded-full mb-2" />
        <span className="text-xs font-semibold text-[#9DA5B4]">3 Active Conversations</span>
      </div>

      {/* Input Area Overlay */}
      <div className="absolute bottom-16 w-full px-4 pb-4 pt-8 bg-gradient-to-t from-[#0E1525] via-[#0E1525]/90 to-transparent z-10 pointer-events-none" />
      
      <div className="absolute bottom-20 left-0 w-full px-4 z-20">
        <div className="bg-[#1C2333]/90 backdrop-blur-lg border border-[#2B3245] rounded-full pl-3 pr-1.5 py-1.5 flex items-center shadow-lg shadow-black/20 focus-within:border-[#a855f7]/50 focus-within:bg-[#1C2333] transition-all">
          <button className="p-2 text-[#9DA5B4] hover:text-white transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#9DA5B4] hover:text-white transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            placeholder="Message OMNIMENS..." 
            className="flex-1 bg-transparent border-none outline-none px-2 text-[15px] placeholder:text-[#5c667a] text-white"
          />
          
          <button className="w-9 h-9 rounded-full bg-[#a855f7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-[#9333ea] transition-all ml-1">
            <ArrowUp className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>

    </div>
  );
}
