/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { SEO, seoData } from "@/components/seo";

export default function Privacy() {
  return (
    <Layout>
      <SEO {...seoData.privacy} />
      <div className="flex-1 py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-widest text-white uppercase">
                  Privacy Policy
                </h1>
                <p className="text-xs font-mono text-white/30 tracking-widest mt-1">
                  Last updated: March 1, 2026
                </p>
              </div>
            </div>

            <div className="space-y-8 text-white/70 font-sans text-sm leading-relaxed">
              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  1. Information We Collect
                </h2>
                <p className="mb-3">
                  Alpha Unlimited Technologies, LLC ("Company") collects information to provide, maintain, and improve the OMNIMENS platform. We collect:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li><strong className="text-white/80">Account Information:</strong> Username, email address, and authentication credentials (via Replit OAuth or Google OAuth)</li>
                  <li><strong className="text-white/80">Usage Data:</strong> Conversation history, credit usage, tool interactions, and feature preferences</li>
                  <li><strong className="text-white/80">Technical Data:</strong> Browser type, device information, IP address, and access timestamps</li>
                  <li><strong className="text-white/80">Payment Data:</strong> Processed securely by Stripe — we never store credit card numbers directly</li>
                  <li><strong className="text-white/80">Memory Data:</strong> Facts and context you choose to save to OMNIMENS persistent memory</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  2. How We Use Your Information
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li>To provide and personalize the OMNIMENS AI experience</li>
                  <li>To power COGNISYNC™ adaptive cognitive analysis for tailored responses</li>
                  <li>To maintain persistent memory features you explicitly enable</li>
                  <li>To process payments and manage your credit balance</li>
                  <li>To improve platform performance, safety, and reliability</li>
                  <li>To communicate platform updates, security alerts, and account notifications</li>
                  <li>To detect and prevent fraud, abuse, and Terms of Service violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  3. Data Protection
                </h2>
                <p className="mb-3">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li>Two-factor authentication (TOTP) is available for all accounts</li>
                  <li>API keys use secure hashing and are never stored in plaintext</li>
                  <li>Database access is restricted and monitored</li>
                  <li>Regular security audits and penetration testing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  4. Data Sharing
                </h2>
                <p className="mb-3">
                  We do not sell your personal data. We may share limited information with:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li><strong className="text-white/80">AI Model Providers:</strong> Your prompts are sent to AI providers (OpenAI, Anthropic, Google) to generate responses. We minimize data shared and do not send personally identifiable information with AI requests</li>
                  <li><strong className="text-white/80">Payment Processor:</strong> Stripe processes all financial transactions under their own privacy policy</li>
                  <li><strong className="text-white/80">Legal Requirements:</strong> We may disclose information if required by law, subpoena, or government request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  5. Your Rights
                </h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li>Access and download your personal data</li>
                  <li>Correct inaccurate information in your account</li>
                  <li>Delete your account and associated data</li>
                  <li>Clear your OMNIMENS memory and conversation history</li>
                  <li>Opt out of non-essential data collection</li>
                  <li>Request a copy of all data we hold about you</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  6. Cookies and Tracking
                </h2>
                <p>
                  OMNIMENS uses essential cookies for authentication and session management. We do not use third-party advertising trackers. Analytics cookies, if used, are anonymized and used solely to improve platform performance.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  7. Data Retention
                </h2>
                <p>
                  We retain your data for as long as your account is active. Conversation history is retained for the duration of your account unless you manually delete it. Upon account deletion, all personal data is permanently removed within 30 days. Anonymized, aggregated data may be retained indefinitely for service improvement.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  8. Children's Privacy
                </h2>
                <p>
                  OMNIMENS is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will delete that information promptly.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  9. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of material changes via the platform or email. Your continued use of the Service after updates constitutes acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  10. Contact
                </h2>
                <p>
                  For privacy-related inquiries, please contact us through our Support page or email privacy@alphaunlimited.tech.
                </p>
              </section>
            </div>

          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
