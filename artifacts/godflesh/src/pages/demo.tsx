/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO, seoData } from "@/components/seo";
import { Link } from "wouter";

export default function Demo() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/login");
    }, 8000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <Layout>
      <SEO {...seoData.demo} />
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0E1525 0%, #1a1040 50%, #0E1525 100%)" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Account Required
          </h1>

          <p className="text-white/70 mb-2 text-lg">
            OMNIMENS requires an account to use all features.
          </p>

          <p className="text-white/50 mb-8">
            Create a free account and receive <span className="text-emerald-400 font-bold">$20 in free credits</span> — no credit card required. After your free credits are used, you can purchase more or set up auto-pay.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/login">
              <Button
                type="button"
                className="w-full h-12 text-base font-semibold"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base border-white/20 text-white/80 hover:bg-white/10"
              >
                Already have an account? Sign In
              </Button>
            </Link>
          </div>

          <p className="text-white/30 text-xs mt-6">
            Redirecting to sign in automatically...
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
