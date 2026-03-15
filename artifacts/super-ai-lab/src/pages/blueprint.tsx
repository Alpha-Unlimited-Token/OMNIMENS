import { useParams, Link } from "wouter";
import { useGetSuperAIBlueprint } from "@workspace/api-client-react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Download, Share2, FileCode2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BlueprintPage() {
  const params = useParams();
  const sessionId = parseInt(params.id || "0");
  const { data: blueprint, isLoading } = useGetSuperAIBlueprint(sessionId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <FileCode2 className="w-16 h-16 text-white/20 mb-6" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">Blueprint Not Ready</h2>
        <p className="text-white/50 mb-8">The collaboration session has not yet synthesized a final document or the sector was purged.</p>
        <Link href={`/session/${sessionId}`} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-display tracking-widest text-sm">
          RETURN TO SESSION
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link href={`/session/${sessionId}`} className="inline-flex items-center font-display tracking-widest text-sm text-white/40 hover:text-white mb-10 transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:border-white/20">
        <ArrowLeft className="w-4 h-4 mr-2" /> RETURN TO SESSION
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative rounded-[2rem] border border-accent/30 bg-black/60 backdrop-blur-2xl p-8 md:p-14 shadow-[0_0_80px_-15px_hsl(var(--accent)/0.3)]"
      >
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
         
         <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 border-b border-white/10 pb-10">
           <div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-accent to-primary mb-6 leading-tight tracking-tighter">
               {blueprint.title}
             </h1>
             <div className="flex items-center gap-4">
               <span className="text-accent bg-accent/10 px-3 py-1 rounded-md font-mono text-xs tracking-widest uppercase border border-accent/20">
                 SYNTHESIZED BLUEPRINT
               </span>
               <span className="text-white/30 font-mono text-xs tracking-wider">
                 {new Date(blueprint.createdAt).toUTCString()}
               </span>
             </div>
           </div>
           <div className="flex gap-3 shrink-0">
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-accent/20 hover:text-accent hover:border-accent/30 transition-all group">
                <Download className="w-5 h-5 text-white/50 group-hover:text-accent transition-colors" />
              </button>
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all group">
                <Share2 className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
              </button>
           </div>
         </div>
         
         <div className="prose prose-invert prose-headings:font-display prose-headings:font-bold prose-h1:text-white prose-h2:text-accent prose-h3:text-primary prose-a:text-primary prose-pre:bg-[#0a0a0c] prose-pre:border prose-pre:border-white/10 prose-code:text-accent max-w-none text-white/80 leading-relaxed">
           <ReactMarkdown>{blueprint.content}</ReactMarkdown>
         </div>
      </motion.div>
    </div>
  )
}
