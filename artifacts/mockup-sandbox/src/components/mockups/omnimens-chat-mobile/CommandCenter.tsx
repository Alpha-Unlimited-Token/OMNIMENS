import React, { useState } from 'react';
import { 
  Menu, ChevronDown, Coins, BrainCircuit,
  Paperclip, Mic, Camera, Zap, 
  MessageSquare, FolderOpen, Bell, User,
  Copy, Send, MoreVertical
} from 'lucide-react';

export function CommandCenter() {
  const [inputText, setInputText] = useState('Can you make it a bar chart?');
  
  return (
    <div className="w-[390px] h-[844px] mx-auto overflow-hidden relative flex flex-col bg-[#0E1525] text-white font-sans shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-[40px] border-[6px] border-[#1a2133]">
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-[#2B3245] bg-[#1C2333]/90 backdrop-blur-md shrink-0 z-10">
        <button className="p-2 -ml-2 text-[#9DA5B4] hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-[#2B3245] hover:bg-[#3D4659] px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-[#3D4659]">
            <span className="text-[#a855f7] font-semibold">o3</span>
            <span className="text-[#9DA5B4] text-[10px] opacity-50">|</span>
            <span className="text-white text-[13px] tracking-wide uppercase">Command</span>
            <ChevronDown size={14} className="text-[#9DA5B4] ml-0.5" />
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#9DA5B4] bg-[#0E1525] px-2 py-1.5 rounded-md border border-[#2B3245]">
          <Coins size={12} className="text-amber-400" />
          <span>842</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col custom-scrollbar bg-gradient-to-b from-[#0E1525] to-[#121827]">
        <div className="text-center text-[10px] text-[#5A6376] font-semibold my-2 tracking-[0.2em] uppercase">Today 10:24 AM</div>
        
        {/* User Message */}
        <div className="flex flex-col items-end">
          <div className="max-w-[88%] bg-[#1C2333] shadow-md border border-[#2B3245] border-l-[3px] border-l-[#a855f7] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed relative">
            <p>I need to extract the recurring themes from the customer feedback dataset we processed yesterday. Can you run a quick clustering script on the transcript column?</p>
            <div className="text-[9px] text-[#5A6376] font-mono text-right mt-1.5">10:24 AM</div>
          </div>
        </div>

        {/* Assistant Message */}
        <div className="flex gap-2.5 items-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#a855f7] to-[#6b21a8] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(168,85,247,0.25)] border border-[#c084fc]/30">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="bg-[#1C2333] border border-[#2B3245] shadow-sm text-white px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[14px] leading-relaxed">
              <p>I've accessed the dataset. Running a TF-IDF vectorization followed by K-Means clustering on the transcript column yields 4 primary themes.</p>
              <p className="mt-2 text-[13px] text-[#9DA5B4]">Here's the python snippet I used for the extraction:</p>
            </div>
            
            {/* Code Block */}
            <div className="rounded-xl overflow-hidden border border-[#2B3245] bg-[#0A0F1A] shadow-inner">
              <div className="flex items-center justify-between px-3 py-2 bg-[#151B2B] border-b border-[#2B3245]">
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#a855f7] font-semibold">python</span>
                <button className="flex items-center gap-1.5 text-[10px] text-[#9DA5B4] hover:text-white transition-colors bg-[#1C2333] px-2 py-1 rounded border border-[#2B3245]">
                  <Copy size={10} />
                  <span>COPY</span>
                </button>
              </div>
              <div className="p-3.5 overflow-x-auto text-[12px] font-mono leading-[1.6]">
                <span className="text-[#f472b6]">from</span> <span className="text-[#e2e8f0]">sklearn.feature_extraction.text</span> <span className="text-[#f472b6]">import</span> <span className="text-[#e2e8f0]">TfidfVectorizer</span><br/>
                <span className="text-[#f472b6]">from</span> <span className="text-[#e2e8f0]">sklearn.cluster</span> <span className="text-[#f472b6]">import</span> <span className="text-[#e2e8f0]">KMeans</span><br/>
                <br/>
                <span className="text-[#64748b]"># Vectorize transcripts</span><br/>
                <span className="text-[#93c5fd]">vectorizer</span> <span className="text-[#e2e8f0]">= TfidfVectorizer(stop_words=</span><span className="text-[#fde047]">'english'</span><span className="text-[#e2e8f0]">)</span><br/>
                <span className="text-[#93c5fd]">X</span> <span className="text-[#e2e8f0]">= vectorizer.fit_transform(df[</span><span className="text-[#fde047]">'transcript'</span><span className="text-[#e2e8f0]">])</span><br/>
                <br/>
                <span className="text-[#64748b]"># Cluster into 4 themes</span><br/>
                <span className="text-[#93c5fd]">kmeans</span> <span className="text-[#e2e8f0]">= KMeans(n_clusters=</span><span className="text-[#fdba74]">4</span><span className="text-[#e2e8f0]">, random_state=</span><span className="text-[#fdba74]">42</span><span className="text-[#e2e8f0]">)</span><br/>
                <span className="text-[#e2e8f0]">df[</span><span className="text-[#fde047]">'theme_cluster'</span><span className="text-[#e2e8f0]">] = kmeans.fit_predict(X)</span>
              </div>
            </div>
            
            <div className="bg-[#1C2333] border border-[#2B3245] shadow-sm text-white px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed">
              <p>The prominent clusters are: <span className="text-[#c084fc] font-medium bg-[#a855f7]/10 px-1 rounded">1. Pricing</span>, <span className="text-[#c084fc] font-medium bg-[#a855f7]/10 px-1 rounded">2. UI/UX friction</span>, <span className="text-[#c084fc] font-medium bg-[#a855f7]/10 px-1 rounded">3. API requests</span>, and <span className="text-[#c084fc] font-medium bg-[#a855f7]/10 px-1 rounded">4. Support quality</span>.</p>
              <div className="text-[9px] text-[#5A6376] font-mono text-right mt-1.5">10:25 AM</div>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-end">
          <div className="max-w-[88%] bg-[#1C2333] shadow-md border border-[#2B3245] border-l-[3px] border-l-[#a855f7] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed relative">
            <p>Perfect. Let's create a quick visualization of the distribution across those 4 clusters. Use a dark theme to match our deck.</p>
            <div className="text-[9px] text-[#5A6376] font-mono text-right mt-1.5">10:27 AM</div>
          </div>
        </div>
        
        {/* Thinking Indicator */}
        <div className="flex gap-2.5 items-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C2333] to-[#2B3245] border border-[#3D4659] flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-[#a855f7] border-t-transparent animate-spin" />
          </div>
          <div className="bg-[#1C2333]/60 border border-[#2B3245]/60 text-[#9DA5B4] px-3.5 py-2 rounded-2xl rounded-tl-sm text-[13px] italic flex items-center gap-2">
            Generating chart data<span className="flex space-x-0.5"><span className="animate-bounce" style={{animationDelay: '0ms'}}>.</span><span className="animate-bounce" style={{animationDelay: '150ms'}}>.</span><span className="animate-bounce" style={{animationDelay: '300ms'}}>.</span></span>
          </div>
        </div>
        
        <div className="h-2"></div> {/* Bottom padding */}
      </div>

      {/* Input Area */}
      <div className="bg-[#0E1525] border-t border-[#2B3245] px-3 py-3 pb-2 shrink-0 z-10 flex flex-col gap-2.5 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        {/* Quick Toolbar */}
        <div className="flex items-center gap-3.5 px-1.5">
          <button className="text-[#9DA5B4] hover:text-[#a855f7] transition-colors p-1 bg-[#1C2333] rounded-md border border-[#2B3245]"><Paperclip size={16} /></button>
          <button className="text-[#9DA5B4] hover:text-[#a855f7] transition-colors p-1 bg-[#1C2333] rounded-md border border-[#2B3245]"><Mic size={16} /></button>
          <button className="text-[#9DA5B4] hover:text-[#a855f7] transition-colors p-1 bg-[#1C2333] rounded-md border border-[#2B3245]"><Camera size={16} /></button>
          <div className="w-[1px] h-4 bg-[#2B3245] mx-0.5"></div>
          <button className="text-[#9DA5B4] hover:text-[#a855f7] transition-colors p-1 flex items-center gap-1 bg-[#1C2333] rounded-md border border-[#2B3245] px-2">
            <BrainCircuit size={14} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Persona</span>
          </button>
          <button className="text-[#9DA5B4] hover:text-[#eab308] transition-colors p-1 bg-[#1C2333] rounded-md border border-[#2B3245]"><Zap size={16} /></button>
          <div className="flex-1"></div>
        </div>
        
        {/* Text Input */}
        <div className="relative flex items-end bg-[#151B2B] border border-[#2B3245] rounded-xl overflow-hidden focus-within:border-[#a855f7] focus-within:ring-1 focus-within:ring-[#a855f7]/30 transition-all shadow-inner">
          <textarea 
            className="w-full bg-transparent text-white placeholder-[#5A6376] px-3.5 py-3 outline-none resize-none min-h-[46px] max-h-[120px] text-[14px] leading-tight custom-scrollbar"
            placeholder="Command o3..."
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          
          <div className="absolute top-2 right-2 text-[9px] font-mono text-[#5A6376] pointer-events-none opacity-60">
            {inputText.length}/2000
          </div>
          
          <div className="p-1.5 shrink-0 flex items-end">
            <button 
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                inputText.length > 0 
                  ? 'bg-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                  : 'bg-[#2B3245] text-[#5A6376]'
              }`}
            >
              <Send size={16} className={inputText.length > 0 ? 'translate-x-0.5 -translate-y-0.5' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[#0A0F1A] border-t border-[#2B3245] h-[72px] shrink-0 flex items-center justify-around px-2 pb-safe pt-1 z-20">
        <button className="flex flex-col items-center justify-center w-16 gap-1.5 text-[#a855f7]">
          <div className="relative">
            <MessageSquare size={20} className="fill-[#a855f7]/20" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#a855f7] rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)]"></span>
          </div>
          <span className="text-[10px] font-medium tracking-wide">Chat</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 gap-1.5 text-[#5A6376] hover:text-[#9DA5B4] transition-colors">
          <FolderOpen size={20} />
          <span className="text-[10px] font-medium tracking-wide">Projects</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 gap-1.5 text-[#5A6376] hover:text-[#9DA5B4] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-[18px] w-1.5 h-1.5 bg-rose-500 rounded-full border border-[#0A0F1A]"></span>
          <span className="text-[10px] font-medium tracking-wide">Alerts</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 gap-1.5 text-[#5A6376] hover:text-[#9DA5B4] transition-colors">
          <User size={20} />
          <span className="text-[10px] font-medium tracking-wide">Account</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2B3245;
          border-radius: 4px;
        }
        .pb-safe {
          padding-bottom: 20px;
        }
      `}} />
    </div>
  );
}
