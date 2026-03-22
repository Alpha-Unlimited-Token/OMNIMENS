/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  MessageSquare, CreditCard, Code2, HelpCircle, LifeBuoy,
  Building2, Scale, ShieldCheck, Mail, Zap, Brain, Layers
} from "lucide-react";
import { SEO } from "@/components/seo";

const LINK_SECTIONS = [
  {
    title: "Platform",
    links: [
      { icon: <MessageSquare className="w-4 h-4" />, label: "Chat", href: "/chat", desc: "Start a conversation with OMNIMENS" },
      { icon: <CreditCard className="w-4 h-4" />, label: "Pricing", href: "/pricing", desc: "View plans and credit packs" },
      { icon: <Code2 className="w-4 h-4" />, label: "Developer", href: "/developer", desc: "API access and documentation" },
      { icon: <Layers className="w-4 h-4" />, label: "Projects", href: "/projects", desc: "Your saved projects and files" },
      { icon: <Brain className="w-4 h-4" />, label: "Memory", href: "/memory", desc: "Manage OMNIMENS memory" },
      { icon: <Zap className="w-4 h-4" />, label: "Tools", href: "/tools", desc: "Configure AI tools and features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { icon: <HelpCircle className="w-4 h-4" />, label: "FAQ", href: "/faq", desc: "Frequently asked questions" },
      { icon: <LifeBuoy className="w-4 h-4" />, label: "Support", href: "/support", desc: "Get help with any issue" },
      { icon: <Building2 className="w-4 h-4" />, label: "About", href: "/about", desc: "Learn about Alpha Unlimited Technologies" },
      { icon: <Mail className="w-4 h-4" />, label: "Contact", href: "/contact", desc: "Get in touch with our team" },
    ],
  },
  {
    title: "Legal",
    links: [
      { icon: <Scale className="w-4 h-4" />, label: "Terms of Service", href: "/terms", desc: "Terms and conditions of use" },
      { icon: <ShieldCheck className="w-4 h-4" />, label: "Privacy Policy", href: "/privacy", desc: "How we handle your data" },
    ],
  },
];

export default function FooterLinks() {
  return (
    <Layout>
      <SEO title="Site Map" description="Navigate the OMNIMENS AI platform. Find links to all pages including AI chat, pricing, FAQ, support, developer tools, and more." keywords="OMNIMENS site map, AI platform navigation" path="/footer-links" />
      <div className="flex-1 py-20 relative z-10">
        <div className="container mx-auto px-6 sm:px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-display font-black tracking-widest text-white uppercase mb-3">
              All Links
            </h1>
            <p className="text-sm font-mono text-white/40 tracking-wider">
              Quick access to every page on OMNIMENS
            </p>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-4" />
          </motion.div>

          <div className="space-y-10">
            {LINK_SECTIONS.map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * si, duration: 0.5 }}
              >
                <h2 className="text-sm font-mono font-bold text-white/60 tracking-[0.3em] uppercase mb-4 pb-2 border-b border-white/8">
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/6 bg-white/[0.02] hover:border-primary/25 hover:bg-white/[0.04] transition-all cursor-pointer group">
                        <div className="text-white/40 group-hover:text-primary/70 transition-colors">
                          {link.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-bold text-white/80 tracking-wider group-hover:text-white transition-colors">
                            {link.label}
                          </p>
                          <p className="text-[11px] text-white/35 font-mono">{link.desc}</p>
                        </div>
                        <span className="text-white/20 group-hover:text-white/40 transition-colors text-xs">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}
