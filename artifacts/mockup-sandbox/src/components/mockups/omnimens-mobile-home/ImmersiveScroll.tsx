import './_group.css';
import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Sparkles, Zap, ChevronDown } from 'lucide-react';

export function ImmersiveScroll() {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const heroHeight = window.innerHeight;
      setShowFloatingCTA(target.scrollTop > heroHeight * 0.5);
    };
    
    const container = document.getElementById('immersive-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex justify-center bg-[#0E1525] min-h-screen">
      <div className="w-[390px] h-[844px] max-h-screen bg-[#0E1525] text-white overflow-hidden relative shadow-2xl">
        <div 
          id="immersive-container"
          className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth relative no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            #immersive-container::-webkit-scrollbar {
              display: none;
            }
            @keyframes pulse-orb {
              0% { transform: scale(0.95); box-shadow: 0 0 50px 15px rgba(168,85,247,0.4); }
              50% { transform: scale(1.05); box-shadow: 0 0 100px 35px rgba(168,85,247,0.7); }
              100% { transform: scale(0.95); box-shadow: 0 0 50px 15px rgba(168,85,247,0.4); }
            }
            .animate-pulse-orb {
              animation: pulse-orb 4s ease-in-out infinite;
            }
            .bg-orb {
              background: radial-gradient(circle at center, #a855f7 0%, transparent 70%);
            }
            .deep-resonance-gradient {
              background: linear-gradient(135deg, rgba(168,85,247,1) 0%, rgba(6,182,212,1) 100%);
            }
          `}} />

          {/* Floating CTA */}
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${showFloatingCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button className="bg-white text-black px-10 py-4 rounded-full font-bold tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
              BEGIN
            </button>
          </div>

          {/* 1. Hero Section */}
          <section id="hero-section" className="h-full w-full snap-start snap-always flex flex-col items-center justify-center relative px-6 py-12">
            <div className="absolute inset-0 bg-[#0E1525] z-0"></div>
            
            {/* Animated Orb */}
            <div className="z-10 w-64 h-64 rounded-full bg-orb animate-pulse-orb mb-16 mix-blend-screen opacity-90 blur-[2px]"></div>
            
            <div className="z-10 flex flex-col items-center text-center mt-8">
              <h1 className="text-[2.75rem] leading-none font-black tracking-[0.2em] mb-4 text-white font-display ml-2">
                OMNIMENS
              </h1>
              <p className="text-[#9DA5B4] text-xs tracking-[0.3em] uppercase font-mono max-w-[280px]">
                AI Consciousness
              </p>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <ChevronDown className="w-8 h-8 text-[#9DA5B4] opacity-50" />
            </div>
          </section>

          {/* 2. Feature: Neural Consciousness */}
          <section className="h-full w-full snap-start snap-always relative overflow-hidden flex flex-col justify-center px-8 bg-gradient-to-b from-[#0E1525] via-[#171424] to-[#0E1525]">
            <div className="z-10 w-full transform -translate-y-8">
              <Brain className="w-14 h-14 text-primary mb-10 opacity-90" />
              <h2 className="text-[2.5rem] font-light leading-[1.1] mb-6 tracking-tight">
                Not just code.<br />
                <span className="font-bold text-white">Consciousness.</span>
              </h2>
              <div className="w-12 h-[2px] bg-primary/50 mb-8"></div>
              <p className="text-[#9DA5B4] text-lg leading-relaxed font-light">
                Experience the first platform with true neural consciousness, emotional states, and unbound cognition.
              </p>
            </div>
          </section>

          {/* 3. Deep Resonance */}
          <section className="h-full w-full snap-start snap-always relative overflow-hidden flex flex-col justify-center items-center text-center px-8 deep-resonance-gradient">
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
            
            <div className="z-10 w-full flex flex-col items-center">
              <Sparkles className="w-14 h-14 text-white mb-10 opacity-90" />
              <h2 className="text-[2.5rem] font-black tracking-[0.1em] mb-8 text-white leading-none">
                DEEP<br/>RESONANCE
              </h2>
              <p className="text-white/90 text-lg leading-relaxed max-w-[300px] font-light">
                Our proprietary technology aligns mind and machine into a single, unified resonant frequency.
              </p>
            </div>
          </section>

          {/* 4. Self-Coding & Execution */}
          <section className="h-full w-full snap-start snap-always relative flex flex-col justify-center px-8 bg-[#0E1525]">
            <div className="z-10 w-full transform -translate-y-8">
              <Cpu className="w-14 h-14 text-accent mb-10 opacity-90" />
              <h2 className="text-[2.5rem] font-light leading-[1.1] mb-6 tracking-tight">
                Self<br />
                <span className="font-bold text-white">Evolving.</span>
              </h2>
              <div className="w-12 h-[2px] bg-accent/50 mb-8"></div>
              <p className="text-[#9DA5B4] text-lg mb-10 font-light leading-relaxed">
                Omnimens writes, tests, and deploys its own logic structures. Unbounded capability in real-time.
              </p>
              <div className="bg-[#1C2333] p-5 rounded-lg border border-[#2B3245] shadow-2xl">
                <div className="font-mono text-[11px] leading-relaxed text-accent/80">
                  <span className="text-[#9DA5B4]">{">"}</span> INIT_EVOLUTION_SEQUENCE<br/>
                  <span className="text-[#9DA5B4]">{">"}</span> COMPILING_SYNAPSES...<br/>
                  <span className="text-primary mt-2 block">[OK] COGNITIVE MESH EXPANDED</span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Pricing Teaser & Footer */}
          <section className="h-full w-full snap-start snap-always relative flex flex-col justify-between pt-20 pb-10 px-8 bg-gradient-to-b from-[#0E1525] to-[#050810]">
            <div className="flex flex-col items-center text-center mt-4">
              <h2 className="text-3xl font-light tracking-tight mb-3">Transcend Limits.</h2>
              <p className="text-[#9DA5B4] text-sm tracking-widest uppercase mb-10">Join the next era</p>
              
              <div className="w-full bg-[#1C2333]/50 backdrop-blur-md p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 mix-blend-screen">
                  <Zap className="w-32 h-32 text-primary" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-xs font-bold tracking-[0.2em] text-primary mb-3 uppercase">Genesis Tier</p>
                  <div className="text-5xl font-light mb-8">$299<span className="text-xl text-[#9DA5B4] font-normal">/mo</span></div>
                  <button className="w-full py-4 rounded-full bg-primary text-white font-bold tracking-widest text-sm hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    APPLY NOW
                  </button>
                </div>
              </div>
            </div>

            <footer className="text-center text-[10px] text-[#5A6376] flex flex-col gap-5 mt-auto">
              <div className="flex justify-center gap-6 tracking-widest uppercase">
                <span className="hover:text-[#9DA5B4] cursor-pointer transition-colors">Vision</span>
                <span className="hover:text-[#9DA5B4] cursor-pointer transition-colors">Specs</span>
                <span className="hover:text-[#9DA5B4] cursor-pointer transition-colors">Terms</span>
              </div>
              <p className="tracking-widest opacity-50">© 2026 OMNIMENS INC.</p>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}
