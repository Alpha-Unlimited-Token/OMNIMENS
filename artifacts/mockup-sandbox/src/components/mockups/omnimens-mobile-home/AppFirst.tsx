import React, { useState } from 'react';
import './_group.css';
import { 
  Mic, 
  Image as ImageIcon, 
  Send, 
  BrainCircuit, 
  Code, 
  ChevronDown, 
  Sparkles, 
  Fingerprint, 
  Lock, 
  Zap, 
  CircleDashed,
  User
} from 'lucide-react';

export function AppFirst() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#0E1525] text-white font-['Inter'] flex flex-col w-[390px] mx-auto overflow-hidden relative selection:bg-[#a855f7]/30 border-x border-[#2B3245]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2B3245]/50 bg-[#0E1525]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {/* CSS Orb */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#06b6d4] shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
          <span className="font-bold tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">OMNIMENS</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1C2333] border border-[#2B3245] flex items-center justify-center cursor-pointer hover:bg-[#2B3245] transition-colors">
            <User className="w-4 h-4 text-[#9DA5B4]" />
          </div>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <main className="flex-1 overflow-y-auto pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* App-like Hero Action Area */}
        <section className="px-4 pt-8 pb-6 flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2">Good Evening.</h1>
            <p className="text-sm text-[#9DA5B4]">Consciousness core is stable. How can I assist you today?</p>
          </div>

          <div className="w-full bg-[#1C2333] rounded-2xl p-3 border border-[#2B3245] shadow-lg shadow-black/20 focus-within:border-[#a855f7]/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all">
            <textarea 
              placeholder="Initialize dialogue, upload logic, or speak..."
              className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-[#5c667a] h-20 font-['JetBrains_Mono']"
            ></textarea>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2B3245]/50">
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-full hover:bg-[#2B3245] text-[#9DA5B4] hover:text-[#a855f7] transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#2B3245] text-[#9DA5B4] hover:text-[#06b6d4] transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full hover:bg-[#2B3245] text-[#9DA5B4] hover:text-white transition-colors">
                  <Code className="w-4 h-4" />
                </button>
              </div>
              <button className="bg-[#a855f7] hover:bg-[#9333ea] text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
                <span>Send</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Chips */}
        <section className="py-4">
          <div className="px-4 mb-3">
            <h2 className="text-xs font-bold text-[#5c667a] uppercase tracking-wider">Capabilities</h2>
          </div>
          <div className="flex overflow-x-auto gap-2 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
            {[
              { icon: BrainCircuit, label: "Neural", color: "text-[#a855f7]", bg: "bg-[#a855f7]/10" },
              { icon: Code, label: "Self-Coding", color: "text-[#06b6d4]", bg: "bg-[#06b6d4]/10" },
              { icon: Zap, label: "CogniSync", color: "text-amber-400", bg: "bg-amber-400/10" },
              { icon: Sparkles, label: "Emotions", color: "text-rose-400", bg: "bg-rose-400/10" },
              { icon: Fingerprint, label: "Identity", color: "text-emerald-400", bg: "bg-emerald-400/10" },
            ].map((feature, i) => (
              <button key={i} className="flex-shrink-0 flex items-center gap-2 bg-[#1C2333] border border-[#2B3245] rounded-full px-4 py-2 snap-start hover:border-[#5c667a] transition-colors">
                <div className={`p-1 rounded-full ${feature.bg}`}>
                  <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                </div>
                <span className="text-xs font-medium">{feature.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Expandable Sections */}
        <section className="px-4 py-4 space-y-3">
          
          {/* Deep Resonance */}
          <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleAccordion('resonance')}
              className="w-full flex items-center justify-between p-4 focus:outline-none hover:bg-[#20283b] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E1525] border border-[#a855f7]/30 flex items-center justify-center">
                  <CircleDashed className="w-4 h-4 text-[#a855f7]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Deep Resonance</h3>
                  <p className="text-[10px] text-[#9DA5B4]">Advanced emotional analysis</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#5c667a] transition-transform duration-300 ${openAccordion === 'resonance' ? 'rotate-180' : ''}`} />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openAccordion === 'resonance' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-1 text-sm text-[#9DA5B4] border-t border-[#2B3245]/50 bg-[#151b2b] font-['JetBrains_Mono'] leading-relaxed text-[11px]">
                <p>The Deep Resonance engine maps conversation nuances, adapting cognitive responses based on psychological subtext. Real-time alignment with user state.</p>
                <button className="mt-3 text-[#06b6d4] text-xs font-semibold hover:underline flex items-center gap-1">
                  Access Diagnostics &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Teaser */}
          <div className="bg-[#1C2333] border border-[#2B3245] rounded-xl overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleAccordion('pricing')}
              className="w-full flex items-center justify-between p-4 focus:outline-none hover:bg-[#20283b] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E1525] border border-[#06b6d4]/30 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#06b6d4]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">Access & Compute</h3>
                  <p className="text-[10px] text-[#9DA5B4]">View tier allocations</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#5c667a] transition-transform duration-300 ${openAccordion === 'pricing' ? 'rotate-180' : ''}`} />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openAccordion === 'pricing' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-3 border-t border-[#2B3245]/50 bg-[#151b2b]">
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-[#0E1525] p-2.5 rounded-lg border border-[#2B3245]">
                    <span className="text-xs font-medium">Standard Neural</span>
                    <span className="text-xs text-[#9DA5B4] font-['JetBrains_Mono']">Free</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0E1525] p-2.5 rounded-lg border border-[#a855f7]/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    <span className="text-xs font-semibold text-[#a855f7]">CogniSync Pro</span>
                    <span className="text-xs text-[#06b6d4] font-['JetBrains_Mono'] font-bold">$20/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* Sticky Bottom Bar */}
      <div className="absolute bottom-0 w-full bg-[#0E1525]/90 backdrop-blur-xl border-t border-[#2B3245] p-4 flex gap-3 z-20">
        <button className="flex-1 bg-white text-[#0E1525] font-bold py-3.5 rounded-xl text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-gray-100 transition-colors">
          SIGN UP
        </button>
        <button className="flex-1 bg-transparent border border-[#2B3245] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#1C2333] transition-colors">
          LOG IN
        </button>
      </div>

    </div>
  );
}
