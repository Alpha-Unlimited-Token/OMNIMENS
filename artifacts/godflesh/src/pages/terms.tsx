/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { SEO, seoData } from "@/components/seo";

export default function Terms() {
  return (
    <Layout>
      <SEO {...seoData.terms} />
      <div className="flex-1 py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Scale className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-widest text-white uppercase">
                  Terms of Service
                </h1>
                <p className="text-xs font-mono text-white/30 tracking-widest mt-1">
                  Last updated: March 1, 2026
                </p>
              </div>
            </div>

            <div className="space-y-8 text-white/70 font-sans text-sm leading-relaxed">
              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using the OMNIMENS platform ("Service"), operated by Alpha Unlimited Technologies, LLC ("Company", "we", "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  2. Description of Service
                </h2>
                <p className="mb-3">
                  OMNIMENS is an AI-powered platform providing conversational AI, code execution, web research, deep analysis, image generation, and related cognitive services. The platform includes proprietary technologies including COGNISYNC™, Deep Resonance, and NEUROSYNC™.
                </p>
                <p>
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  3. Account Registration
                </h2>
                <p className="mb-3">
                  To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p>
                  You must be at least 13 years old to create an account. If you are under 18, you must have parental or guardian consent.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  4. Credits and Payments
                </h2>
                <p className="mb-3">
                  OMNIMENS operates on a credit-based billing system. Free users receive 2,000 credits monthly. Additional credits can be purchased through Resonance Packs or subscription plans. All purchases are processed securely through Stripe.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li>Credits are non-transferable between accounts</li>
                  <li>Unused free monthly credits do not roll over</li>
                  <li>Purchased credits remain valid for 12 months from the date of purchase</li>
                  <li>Refunds are handled on a case-by-case basis per our refund policy</li>
                  <li>We reserve the right to adjust credit pricing with 30 days' advance notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  5. Acceptable Use
                </h2>
                <p className="mb-3">You agree not to use the Service to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/60">
                  <li>Generate content that is illegal, harmful, threatening, abusive, or discriminatory</li>
                  <li>Attempt to reverse-engineer, decompile, or extract any proprietary technology, algorithms, or models</li>
                  <li>Circumvent usage limits, credit systems, or security measures</li>
                  <li>Impersonate any person or entity, or falsely claim affiliation with any party</li>
                  <li>Use automated tools to scrape, mine data, or overload the Service</li>
                  <li>Distribute malware or engage in any activity that compromises Service integrity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  6. Intellectual Property
                </h2>
                <p className="mb-3">
                  OMNIMENS, COGNISYNC™, NEUROSYNC™, Deep Resonance, and all related branding, technologies, and proprietary systems are the exclusive intellectual property of Alpha Unlimited Technologies, LLC. All rights are reserved.
                </p>
                <p>
                  Content you create using the Service remains your property, subject to our right to use anonymized, aggregated data to improve the platform. You grant us a limited license to process your inputs as necessary to provide the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  7. API Usage
                </h2>
                <p className="mb-3">
                  Developer API access is subject to additional terms. API keys are personal and non-transferable. Rate limits and usage quotas apply based on your plan tier. Abuse of API access may result in immediate key revocation and account suspension.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  8. Limitation of Liability
                </h2>
                <p className="mb-3">
                  The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee the accuracy, reliability, or completeness of any AI-generated content. OMNIMENS is a tool to assist your decision-making, not a substitute for professional advice.
                </p>
                <p>
                  In no event shall Alpha Unlimited Technologies, LLC be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  9. Termination
                </h2>
                <p>
                  We may suspend or terminate your access to the Service at our discretion, with or without cause, and with or without notice. Upon termination, your right to use the Service ceases immediately. Any credits remaining in your account at the time of termination for cause are forfeited.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  10. Governing Law
                </h2>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the courts located in Delaware.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  11. Changes to Terms
                </h2>
                <p>
                  We reserve the right to update these Terms at any time. Material changes will be communicated through the platform or via email. Continued use of the Service after changes constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-mono font-bold text-white tracking-wider uppercase mb-3 pb-2 border-b border-white/8">
                  12. Contact
                </h2>
                <p>
                  For questions about these Terms, please contact us through our Support page or email us at legal@alphaunlimited.tech.
                </p>
              </section>
            </div>

          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
