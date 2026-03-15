import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateSuperAISession } from "@workspace/api-client-react";
import { ArrowRight, BrainCircuit, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [, setLocation] = useLocation();
  const { mutateAsync, isPending } = useCreateSuperAISession();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    try {
      const session = await mutateAsync({ data: { topic } });
      setLocation(`/session/${session.id}`);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto relative">
       {/* Decorative backdrop elements */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[400px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
       
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ duration: 1, ease: "easeOut" }}
         className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-accent to-destructive p-[2px] mb-10 shadow-[0_0_60px_hsl(var(--primary)/0.3)] z-10"
       >
         <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
           <BrainCircuit className="w-14 h-14 text-white relative z-10" />
           <div className="absolute inset-0 bg-primary/20 animate-pulse" />
           <Activity className="absolute bottom-4 right-4 w-6 h-6 text-primary opacity-50" />
         </div>
       </motion.div>
       
       <motion.h1 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, delay: 0.2 }}
         className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/40 z-10"
       >
         PROJECT <span className="text-primary glow-text">SUPER AI</span>
       </motion.h1>
       
       <motion.p 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, delay: 0.4 }}
         className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl font-light z-10"
       >
         Initialize a secure collaboration channel. Our triad of specialized neural networks will 
         debate, challenge, and synthesize a radically superior architecture for any given domain.
       </motion.p>
       
       <motion.form 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, delay: 0.6 }}
         onSubmit={handleStart} 
         className="w-full max-w-2xl relative group z-10"
       >
         <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
         <div className="relative flex items-center bg-black/80 rounded-2xl border border-white/10 p-2 backdrop-blur-2xl shadow-2xl">
           <input 
             type="text" 
             value={topic}
             onChange={(e) => setTopic(e.target.value)}
             placeholder="Enter target domain (e.g. Quantum Neural Networks)..."
             className="flex-1 bg-transparent text-lg md:text-xl text-white placeholder:text-white/30 px-6 py-4 focus:outline-none font-display tracking-wide"
             disabled={isPending}
           />
           <button 
             type="submit"
             disabled={isPending || !topic.trim()}
             className="p-4 mr-1 bg-white/5 rounded-xl border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
           >
             {isPending ? (
               <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
             ) : (
               <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
             )}
           </button>
         </div>
       </motion.form>
    </div>
  )
}
