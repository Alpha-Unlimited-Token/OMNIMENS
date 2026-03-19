/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Mail, MessageSquare, HelpCircle, Code2, Shield, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { SEO, seoData } from "@/components/seo";

export default function Contact() {
  return (
    <Layout>
      <SEO {...seoData.contact} />
      <div className="flex-1 py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/25 bg-cyan-400/8 mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-400 tracking-[0.35em] uppercase font-bold">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-widest text-white uppercase mb-4">
              Contact Us
            </h1>
            <p className="text-base font-mono text-white/50 tracking-wider max-w-lg mx-auto">
              We are here to help — reach out through any of the channels below
            </p>
            <div className="w-28 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              {
                icon: <MessageSquare className="w-6 h-6 text-violet-400" />,
                title: "General Support",
                desc: "Questions about your account, credits, features, or anything else",
                action: "Visit Support Center",
                href: "/support",
                color: "border-violet-400/20 hover:border-violet-400/40",
                bg: "bg-violet-400/6",
              },
              {
                icon: <HelpCircle className="w-6 h-6 text-cyan-400" />,
                title: "FAQ",
                desc: "Find instant answers to common questions about OMNIMENS and its features",
                action: "Browse FAQ",
                href: "/faq",
                color: "border-cyan-400/20 hover:border-cyan-400/40",
                bg: "bg-cyan-400/6",
              },
              {
                icon: <Code2 className="w-6 h-6 text-emerald-400" />,
                title: "Developer & API",
                desc: "API documentation, SDK support, integration help, and developer resources",
                action: "Developer Portal",
                href: "/developer",
                color: "border-emerald-400/20 hover:border-emerald-400/40",
                bg: "bg-emerald-400/6",
              },
              {
                icon: <Shield className="w-6 h-6 text-yellow-400" />,
                title: "Security & Privacy",
                desc: "Report security vulnerabilities or submit privacy-related requests",
                action: "View Privacy Policy",
                href: "/privacy",
                color: "border-yellow-400/20 hover:border-yellow-400/40",
                bg: "bg-yellow-400/6",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                <Link href={item.href}>
                  <div className={`rounded-2xl border ${item.color} bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all cursor-pointer group h-full`}>
                    <div className={`inline-flex p-3 rounded-xl ${item.bg} mb-4`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-mono font-bold text-white tracking-wider mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-6">{item.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-mono text-primary/80 group-hover:text-primary transition-colors tracking-wider">
                      {item.action}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-mono font-bold text-white tracking-widest uppercase">Email Us Directly</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: "General Inquiries", email: "hello@alphaunlimited.tech" },
                  { label: "Technical Support", email: "support@alphaunlimited.tech" },
                  { label: "Privacy & Legal", email: "legal@alphaunlimited.tech" },
                  { label: "Business & Partnerships", email: "partnerships@alphaunlimited.tech" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm font-mono text-white/60 tracking-wider">{item.label}</span>
                    <span className="text-sm font-mono text-primary/70">{item.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Clock className="w-4 h-4 text-white/30" />
            <p className="text-xs font-mono text-white/30 tracking-wider">
              Response times: Support tickets within 24 hours · Email within 48 hours
            </p>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
