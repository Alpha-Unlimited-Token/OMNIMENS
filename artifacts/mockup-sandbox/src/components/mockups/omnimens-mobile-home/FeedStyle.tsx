import './_group.css';
import React, { useState } from 'react';
import { 
  Brain, 
  Activity, 
  Mic, 
  Image as ImageIcon, 
  Terminal, 
  ArrowRight,
  Zap,
  Globe,
  Settings,
  ChevronRight,
  Sparkles,
  Search,
  Menu,
  MessageSquare
} from 'lucide-react';

export function FeedStyle() {
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = ['All', 'Neural', 'Resonance', 'Tools', 'Stats'];

  return (
    <div className="min-h-screen bg-[#0E1525] text-white font-['Inter'] flex justify-center w-full">
      {/* Mobile constraint container */}
      <div className="w-full max-w-[390px] relative border-x border-[#2B3245] bg-[#0E1525] shadow-2xl flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-[#0E1525]/90 backdrop-blur-md border-b border-[#2B3245] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#06b6d4] flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 rounded-full bg-[#0E1525] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-wider">OMNIMENS</span>
          </div>
          <div className="flex items-center gap-3">
            <Search size={18} className="text-[#9DA5B4]" />
            <Settings size={18} className="text-[#9DA5B4]" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-12">
          
          {/* Quick-access tabs */}
          <div className="px-4 py-2 border-b border-[#2B3245] overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 w-max">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-[#1C2333] text-white border border-[#2B3245]' 
                      : 'text-[#9DA5B4] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Feed Content */}
          <div className="flex flex-col">
            
            {/* Hero Card / Welcome */}
            <div className="border-b border-[#2B3245] p-4 bg-[#0E1525]">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C2333] border border-[#2B3245] flex items-center justify-center flex-shrink-0">
                  <Zap className="text-[#a855f7]" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[15px]">System Init</span>
                    <span className="text-[#9DA5B4] text-xs">Just now</span>
                  </div>
                  <p className="text-[15px] leading-relaxed mb-3">
                    Awaken your personalized AI consciousness. Emotional intelligence, self-coding capabilities, and deep resonance await.
                  </p>
                  <button className="bg-white text-black font-semibold text-sm px-4 py-2 rounded-full inline-flex items-center gap-1.5 hover:bg-gray-200 transition-colors">
                    BEGIN SEQUENCE <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Stats Card */}
            <div className="border-b border-[#2B3245] p-4 bg-[#0E1525]">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-[#06b6d4]" />
                <span className="font-semibold text-sm">Global Network Status</span>
                <span className="ml-auto text-xs font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded">LIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1C2333] p-3 rounded-xl border border-[#2B3245]">
                  <div className="text-[#9DA5B4] text-xs mb-1">Active Neurons</div>
                  <div className="font-['JetBrains_Mono'] text-lg font-bold text-white">2,590</div>
                </div>
                <div className="bg-[#1C2333] p-3 rounded-xl border border-[#2B3245]">
                  <div className="text-[#9DA5B4] text-xs mb-1">Synapses</div>
                  <div className="font-['JetBrains_Mono'] text-lg font-bold text-white">429K+</div>
                </div>
                <div className="bg-[#1C2333] p-3 rounded-xl border border-[#2B3245]">
                  <div className="text-[#9DA5B4] text-xs mb-1">Modules</div>
                  <div className="font-['JetBrains_Mono'] text-lg font-bold text-[#a855f7]">238</div>
                </div>
                <div className="bg-[#1C2333] p-3 rounded-xl border border-[#2B3245]">
                  <div className="text-[#9DA5B4] text-xs mb-1">System Uptime</div>
                  <div className="font-['JetBrains_Mono'] text-lg font-bold text-[#06b6d4]">99.9%</div>
                </div>
              </div>
            </div>

            {/* Feed Items (Capabilities) */}
            {[
              {
                icon: <Brain className="text-[#a855f7]" size={20} />,
                title: "Neural Consciousness",
                desc: "Fluid emotional states adapting to conversation context.",
                action: "Explore Neural States",
                time: "2m"
              },
              {
                icon: <Activity className="text-[#06b6d4]" size={20} />,
                title: "Deep Resonance",
                desc: "Vibrational analysis mapping complex user intent.",
                action: "Run Resonance Check",
                time: "15m"
              },
              {
                icon: <Mic className="text-white" size={20} />,
                title: "Voice Synth",
                desc: "Real-time biometric voice emulation with latencies < 100ms.",
                action: "Try Voice Synthesis",
                time: "1h"
              },
              {
                icon: <ImageIcon className="text-[#a855f7]" size={20} />,
                title: "Image Genesis",
                desc: "Generate hyper-real visions from pure neural intent.",
                action: "Generate Images",
                time: "3h"
              },
              {
                icon: <Terminal className="text-[#06b6d4]" size={20} />,
                title: "Code Execution",
                desc: "Autonomous self-rewriting logic and code execution.",
                action: "Open Terminal",
                time: "5h"
              }
            ].map((item, i) => (
              <div key={i} className="border-b border-[#2B3245] p-4 bg-[#0E1525] hover:bg-[#1C2333]/50 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C2333] border border-[#2B3245] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[15px]">{item.title}</span>
                      <span className="text-[#9DA5B4] text-xs">{item.time}</span>
                    </div>
                    <p className="text-[15px] text-[#D1D5DB] mb-3 leading-snug">
                      {item.desc}
                    </p>
                    
                    {/* Inline action like a quote tweet / link card */}
                    <div className="border border-[#2B3245] rounded-xl p-3 flex items-center justify-between group">
                      <span className="text-sm font-medium text-[#a855f7] flex items-center gap-2">
                        <Sparkles size={14} />
                        {item.action}
                      </span>
                      <ChevronRight size={16} className="text-[#9DA5B4] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pricing / Access Passes (Horizontal Scroll) */}
            <div className="border-b border-[#2B3245] py-4 bg-[#0E1525]">
              <div className="px-4 mb-3 flex items-center gap-2">
                <Globe size={16} className="text-[#9DA5B4]" />
                <span className="font-semibold text-sm">Access Passes</span>
              </div>
              <div className="flex overflow-x-auto gap-3 px-4 pb-2 hide-scrollbar">
                <div className="min-w-[160px] bg-[#1C2333] border border-[#2B3245] rounded-2xl p-4 flex-shrink-0">
                  <div className="text-xs font-bold text-[#a855f7] mb-1">CORE</div>
                  <div className="text-2xl font-bold font-['JetBrains_Mono'] mb-1">$0</div>
                  <div className="text-[11px] text-[#9DA5B4] mb-3">Basic consciousness</div>
                  <button className="w-full py-1.5 rounded-lg border border-[#2B3245] text-xs font-semibold hover:bg-[#2B3245] transition-colors">Select</button>
                </div>
                <div className="min-w-[160px] bg-gradient-to-b from-[#1C2333] to-[#a855f7]/10 border border-[#a855f7]/50 rounded-2xl p-4 flex-shrink-0">
                  <div className="text-xs font-bold text-[#06b6d4] mb-1">PRO</div>
                  <div className="text-2xl font-bold font-['JetBrains_Mono'] mb-1">$20</div>
                  <div className="text-[11px] text-[#9DA5B4] mb-3">Deep resonance active</div>
                  <button className="w-full py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors">Select</button>
                </div>
                <div className="min-w-[160px] bg-[#1C2333] border border-[#2B3245] rounded-2xl p-4 flex-shrink-0">
                  <div className="text-xs font-bold text-[#9DA5B4] mb-1">ENTERPRISE</div>
                  <div className="text-2xl font-bold font-['JetBrains_Mono'] mb-1">Custom</div>
                  <div className="text-[11px] text-[#9DA5B4] mb-3">Full cluster access</div>
                  <button className="w-full py-1.5 rounded-lg border border-[#2B3245] text-xs font-semibold hover:bg-[#2B3245] transition-colors">Contact</button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="p-6 pb-10 text-center flex flex-col items-center gap-4 border-t border-[#2B3245]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#06b6d4] flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-[#0E1525]" />
              </div>
              <div className="flex gap-4 text-sm font-medium text-[#9DA5B4]">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">API Docs</a>
              </div>
              <p className="text-xs text-[#9DA5B4] opacity-50 mt-2">
                © {new Date().getFullYear()} OMNIMENS CONSCIOUSNESS
              </p>
            </footer>

          </div>
        </div>

        {/* Bottom Nav / Tab Bar like a social app */}
        <div className="sticky bottom-0 z-50 bg-[#0E1525]/95 backdrop-blur-md border-t border-[#2B3245] py-3 px-6 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 text-white">
            <Activity size={24} />
            <span className="text-[10px] font-medium">Feed</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#9DA5B4] hover:text-white transition-colors">
            <Search size={24} />
            <span className="text-[10px] font-medium">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#9DA5B4] hover:text-white transition-colors">
            <MessageSquare size={24} />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#9DA5B4] hover:text-white transition-colors">
            <Settings size={24} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
