import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-8xl font-display font-black text-primary mb-6 glow-text tracking-tighter">404</h1>
      <p className="text-xl text-white/60 mb-10 font-light">This dimensional sector does not exist or has been purged.</p>
      <Link href="/" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all font-display tracking-widest text-sm text-white">
        RETURN TO NEXUS
      </Link>
    </div>
  )
}
