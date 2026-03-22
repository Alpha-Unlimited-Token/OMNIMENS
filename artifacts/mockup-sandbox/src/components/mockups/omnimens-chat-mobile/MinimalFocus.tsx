import React, { useState } from 'react';
import { Send, Paperclip, Mic, ChevronLeft, MoreHorizontal, Copy, Check, Bot } from 'lucide-react';

export function MinimalFocus() {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="w-[390px] h-[844px] mx-auto overflow-hidden bg-[#0E1525] text-white flex flex-col relative font-sans shadow-2xl rounded-[40px] ring-8 ring-[#1C2333]">
      {/* Swipe Gesture Hint */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-20 bg-white/10 rounded-r-md z-50 shadow-[2px_0_10px_rgba(255,255,255,0.1)]"></div>

      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-[#0E1525]/90 backdrop-blur-md sticky top-0 z-20 border-b border-[#2B3245]/50">
        <button className="p-2 -ml-2 rounded-full text-white/80 hover:bg-[#3D4659]/50 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center flex-1 min-w-0 px-2">
          <div className="flex items-center gap-2 max-w-full">
            <h1 className="text-[15px] font-semibold tracking-tight truncate">Optimizing webGL renderer</h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1C2333] text-[#a855f7] border border-[#2B3245]">o3</span>
          </div>
          <span className="text-[11px] text-[#9DA5B4] uppercase tracking-[0.2em] mt-0.5 opacity-80">OMNIMENS</span>
        </div>

        <button className="p-2 -mr-2 rounded-full text-white/80 hover:bg-[#3D4659]/50 transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-0 pb-32 pt-4 flex flex-col gap-6">
        
        {/* User Message */}
        <div className="flex flex-col items-end px-4 w-full">
          <div className="bg-[#1a1035]/80 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] border border-[#a855f7]/20 shadow-sm leading-relaxed text-[15px]">
            I'm getting massive frame drops in the scene when there are more than 10k particles. How can I optimize the shader to handle instanced rendering better?
          </div>
        </div>

        {/* Assistant Message */}
        <div className="flex flex-col items-start px-4 w-full">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-[#9DA5B4]">Omnimens</span>
          </div>
          <div className="w-full bg-[#1C2333]/60 rounded-2xl rounded-tl-sm border border-[#2B3245]/50 overflow-hidden shadow-sm">
            <div className="px-4 py-3 text-[15px] text-white/90 leading-relaxed">
              To handle 10k+ particles without frame drops, you'll need to move calculation logic to the GPU using WebGL instanced arrays. Let's rewrite your shader to use <code className="text-[#a855f7] bg-[#a855f7]/10 px-1 py-0.5 rounded text-[13px] font-mono">gl.drawArraysInstanced</code>.
              <br/><br/>
              Here's the updated vertex shader structure:
            </div>
            <div className="bg-[#0b101c] border-t border-[#2B3245]/50">
              <div className="flex items-center justify-between px-4 py-2 bg-[#121926]">
                <span className="text-xs text-[#9DA5B4] font-mono">glsl</span>
                <button className="flex items-center gap-1.5 text-[11px] text-[#9DA5B4] hover:text-white transition-colors">
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-[13px] font-mono leading-relaxed">
                  <code className="text-[#a855f7]">attribute</code> <span className="text-[#e2e8f0]">vec3</span> aVertexPosition;<br/>
                  <code className="text-[#a855f7]">attribute</code> <span className="text-[#e2e8f0]">vec3</span> aInstancePosition;<br/>
                  <code className="text-[#a855f7]">attribute</code> <span className="text-[#e2e8f0]">vec4</span> aInstanceColor;<br/>
                  <br/>
                  <code className="text-[#a855f7]">uniform</code> <span className="text-[#e2e8f0]">mat4</span> uModelViewMatrix;<br/>
                  <code className="text-[#a855f7]">uniform</code> <span className="text-[#e2e8f0]">mat4</span> uProjectionMatrix;<br/>
                  <br/>
                  <code className="text-[#a855f7]">varying</code> <span className="text-[#e2e8f0]">vec4</span> vColor;<br/>
                  <br/>
                  <code className="text-[#a855f7]">void</code> <span className="text-[#60a5fa]">main</span>(<code className="text-[#a855f7]">void</code>) {'{\n'}
                  {'  '}vec4 pos = vec4(aVertexPosition + aInstancePosition, 1.0);<br/>
                  {'  '}gl_Position = uProjectionMatrix * uModelViewMatrix * pos;<br/>
                  {'  '}vColor = aInstanceColor;<br/>
                  {'}'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-end px-4 w-full">
          <div className="bg-[#1a1035]/80 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] border border-[#a855f7]/20 shadow-sm leading-relaxed text-[15px]">
            That makes sense. How do I setup the instanced buffers on the CPU side? Currently using standard Float32Arrays.
          </div>
        </div>

        {/* Assistant Message (Typing...) */}
        <div className="flex flex-col items-start px-4 w-full">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#a855f7] to-[#6b21a8] flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-[#9DA5B4]">Omnimens</span>
          </div>
          <div className="bg-[#1C2333]/60 rounded-2xl rounded-tl-sm border border-[#2B3245]/50 px-4 py-4 flex items-center gap-1.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#a855f7]/80 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#a855f7]/80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#a855f7]/80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      {/* Floating Pill Input Area */}
      <div className="absolute bottom-6 left-0 right-0 px-4 z-30">
        <div className={`
          flex items-end gap-2 p-1.5 bg-[#1C2333]/80 backdrop-blur-xl border border-[#2B3245]/80 
          rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out
          ${isTyping || inputValue.length > 0 ? 'rounded-[20px]' : ''}
        `}>
          
          <div className="flex items-center self-end mb-1 ml-1 gap-1">
            <button className="p-2 rounded-full text-[#9DA5B4] hover:bg-[#3D4659]/50 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <textarea 
            rows={1}
            placeholder="Message Omnimens..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            className="flex-1 bg-transparent text-white placeholder-[#9DA5B4]/60 text-[15px] resize-none outline-none py-3.5 max-h-[120px] min-h-[44px]"
            style={{ 
              height: inputValue.length > 0 ? 'auto' : '44px',
              lineHeight: '1.4'
            }}
          />

          <div className="flex items-center self-end mb-1 mr-1 gap-1">
            {inputValue.length === 0 ? (
              <button className="p-2 rounded-full text-[#9DA5B4] hover:bg-[#3D4659]/50 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button className="p-2 rounded-full bg-[#a855f7] text-white hover:bg-[#9333ea] transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
