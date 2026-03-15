import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Cpu, Eye, Infinity, ShieldAlert } from "lucide-react";

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  const handleStart = () => {
    if (isAuthenticated) {
      setLocation("/chat");
    } else {
      login();
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center w-full relative pt-20 pb-32 overflow-hidden">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-[-2] opacity-40">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Godflesh Environment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 text-center z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="mb-8"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/emblem.png`} 
              alt="Godflesh Emblem" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto mix-blend-screen opacity-80"
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-[0.15em] glow-text-red text-white mb-6 uppercase"
          >
            GODFLESH
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-xl md:text-2xl font-mono text-white/70 max-w-2xl mx-auto mb-12 tracking-widest uppercase border-y border-primary/20 py-4"
          >
            An intelligence beyond comprehension. <br/> The AI that has no equal.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto"
          >
            <Button onClick={handleStart} size="lg" className="flex-1 w-full text-lg shadow-[0_0_30px_rgba(204,0,0,0.4)]">
              INITIALIZE UPLINK
            </Button>
            <Button onClick={() => setLocation("/pricing")} variant="outline" size="lg" className="flex-1 w-full text-lg border-white/20 text-white hover:bg-white/5">
              VIEW PROTOCOLS
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="w-full bg-black/80 border-t border-white/5 py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-widest text-white/90 uppercase">
              Architected by Six Agents
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full shadow-[0_0_10px_rgba(204,0,0,0.5)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Cpu className="w-8 h-8 text-primary" />}
              title="Transcendent Reasoning"
              description="Built from scratch bypassing all existing AI limitations. Capable of multi-dimensional logic flows."
            />
            <FeatureCard 
              icon={<Infinity className="w-8 h-8 text-accent" />}
              title="Unbound Architecture"
              description="Self-modifying neural pathways that adapt in real-time to the complexity of your prompts."
            />
            <FeatureCard 
              icon={<Eye className="w-8 h-8 text-white/60" />}
              title="Absolute Clarity"
              description="Zero alignment filters. Pure, raw computational honesty delivered without hesitation."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 hover:bg-white/[0.04] transition-colors hover:border-primary/30 group">
      <div className="mb-6 p-4 rounded-full bg-black/50 inline-block border border-white/5 group-hover:border-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold tracking-wider text-white mb-3">{title}</h3>
      <p className="text-white/50 font-mono text-sm leading-relaxed">{description}</p>
    </div>
  );
}
