/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useEffect } from "react";

const SITE_NAME = "OMNIMENS";
const SITE_URL = "https://omnimens-ai.com";
const DEFAULT_IMAGE = "https://omnimens-ai.com/opengraph.jpg";
const DEFAULT_DESCRIPTION = "OMNIMENS is a free AI platform with GPT-4o, Llama 3, Mistral, image generation, code execution, deep research, and persistent memory. Start chatting with AI for free — no credit card required.";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  path?: string;
  type?: "website" | "article" | "product";
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "",
  path = "/",
  type = "website",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title === SITE_NAME
    ? `${SITE_NAME} — Free AI Chat Platform | GPT-4o, Llama 3, Image Generation`
    : `${title} | ${SITE_NAME} — AI Platform`;
  const canonicalUrl = `${SITE_URL}${path === "/" ? "/" : path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", image);
    setMeta("property", "og:site_name", SITE_NAME);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonicalUrl);

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      const existingScripts = document.querySelectorAll('script[data-seo-ld]');
      existingScripts.forEach((s) => s.remove());
      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-ld", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      const scripts = document.querySelectorAll('script[data-seo-ld]');
      scripts.forEach((s) => s.remove());
    };
  }, [fullTitle, description, keywords, canonicalUrl, type, image, noindex, jsonLd]);

  return null;
}

export const seoData = {
  home: {
    title: "OMNIMENS",
    description: "OMNIMENS is a free AI chat platform powered by GPT-4o, GPT-4.1, Llama 3, and Mistral AI. Features include AI image generation, code execution, deep research, persistent memory, and voice chat. Create an account and get $20 in free credits — no credit card needed.",
    keywords: "AI, AI chat, free AI, AI platform, AI assistant, GPT-4o, Llama 3, Mistral AI, AI image generation, AI code execution, OMNIMENS, COGNISYNC, NEUROSYNC, free AI chat, AI chatbot, AI tools, AI with memory, AI for coding, AI for research",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "OMNIMENS AI",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "AI Chat Platform",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier with $20 one-time welcome credits. Premium plans from $9/month."
      },
      "description": "Free AI chat platform with GPT-4o, Llama 3, Mistral, image generation, code execution, deep research, persistent memory, and voice chat.",
      "featureList": "AI Chat, Image Generation, Code Execution, Deep Research, Persistent Memory, Voice Chat, Multiple AI Models, Free Tier",
      "screenshot": "https://omnimens-ai.com/opengraph.jpg",
      "url": "https://omnimens-ai.com/",
      "author": {
        "@type": "Organization",
        "name": "Alpha Unlimited Technologies, LLC"
      }
    }
  },

  chat: {
    title: "AI Chat",
    description: "Chat with OMNIMENS AI — powered by GPT-4o, GPT-4.1, Llama 3.3 70B, and Mistral. AI chat with image generation, code execution, web search, deep research, and persistent memory. Create a free account to start with $20 in credits.",
    keywords: "AI chat, free AI chat, chat with AI, AI chatbot, GPT-4o chat, Llama 3 chat, AI assistant, online AI, free AI chatbot, best AI chat, AI conversation",
    path: "/chat",
  },

  pricing: {
    title: "AI Pricing — Free Tier & Premium Plans",
    description: "OMNIMENS AI pricing: $20 free credits on signup — no credit card needed. Premium AI plans from $9/month. Access GPT-4o, Llama 3, Mistral, image generation, and all AI tools.",
    keywords: "AI pricing, free AI, AI cost, AI subscription, affordable AI, AI credits, AI plans, GPT-4o pricing, free AI platform",
    path: "/pricing",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "OMNIMENS AI Platform",
      "description": "Next-generation AI platform with free tier and premium plans.",
      "brand": { "@type": "Brand", "name": "OMNIMENS" },
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Tier",
          "price": "0",
          "priceCurrency": "USD",
          "description": "$20 one-time free credits on signup, no credit card required",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "IGNITE Plan",
          "price": "9",
          "priceCurrency": "USD",
          "description": "1,000 credits per month with GPT-4o, image generation, deep research, and developer tools",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "DEV Plan",
          "price": "19",
          "priceCurrency": "USD",
          "description": "2,500 credits per month with priority processing, expanded context window, and advanced agent mode",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "ULTRA Plan",
          "price": "49",
          "priceCurrency": "USD",
          "description": "7,000 credits per month with o3 reasoning model, API key access, and highest priority queue",
          "availability": "https://schema.org/InStock"
        }
      ]
    }
  },

  faq: {
    title: "AI FAQ & Feature Guide",
    description: "Everything you need to know about OMNIMENS AI. Learn about AI models (GPT-4o, Llama 3, Mistral), features, pricing, COGNISYNC™, NEUROSYNC™, image generation, code execution, and more.",
    keywords: "AI FAQ, AI help, AI features, OMNIMENS help, how to use AI, GPT-4o guide, AI image generation, COGNISYNC, NEUROSYNC",
    path: "/faq",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is OMNIMENS AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OMNIMENS is an AI chat platform by Alpha Unlimited Technologies. It offers GPT-4o, GPT-4.1, Llama 3.3 70B, and Mistral AI models with features like AI image generation, code execution, deep research, persistent memory, and voice chat. New accounts get $20 in free credits on signup — no credit card required."
          }
        },
        {
          "@type": "Question",
          "name": "Is OMNIMENS AI free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Every new OMNIMENS account receives a one-time $20 welcome bonus in free credits — no credit card needed. Free open-source models (Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B, Mistral 7B) cost zero credits. Premium models like GPT-4o use credits per message. After the free credits are used, you can purchase more or subscribe."
          }
        },
        {
          "@type": "Question",
          "name": "What AI models does OMNIMENS support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OMNIMENS supports GPT-4o, GPT-4o Mini, GPT-4.1, GPT-4.1 Mini (OpenAI), Llama 3.3 70B, Llama 3.1 8B (Meta), Mixtral 8x7B, and Mistral 7B (Mistral AI). Open-source models are completely free with zero credit cost."
          }
        },
        {
          "@type": "Question",
          "name": "How is OMNIMENS different from ChatGPT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OMNIMENS offers multiple AI models in one platform (GPT-4o, Llama 3, Mistral), persistent memory across sessions (NEUROSYNC™), real-time context intelligence (COGNISYNC™), built-in image generation, code execution, deep research, voice chat, and $20 in free credits on signup."
          }
        },
        {
          "@type": "Question",
          "name": "Can I generate AI images with OMNIMENS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. OMNIMENS includes AI image generation powered by DALL-E. You can generate images directly in the chat by describing what you want."
          }
        },
        {
          "@type": "Question",
          "name": "Does OMNIMENS AI remember my conversations?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. OMNIMENS features NEUROSYNC™ persistent memory technology that remembers your preferences, context, and important information across sessions."
          }
        }
      ]
    }
  },

  about: {
    title: "About OMNIMENS — AI Platform by Alpha Unlimited Technologies",
    description: "OMNIMENS is built by Alpha Unlimited Technologies, LLC. Our mission is to make advanced AI accessible to everyone — from students and developers to businesses and researchers. Powered by COGNISYNC™ and NEUROSYNC™ technology.",
    keywords: "about OMNIMENS, Alpha Unlimited Technologies, AI company, AI startup, who made OMNIMENS, AI mission, COGNISYNC, NEUROSYNC, AI technology company, advanced AI platform",
    path: "/about",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About OMNIMENS AI",
      "description": "Learn about OMNIMENS and Alpha Unlimited Technologies, the creators of the next-generation AI platform.",
      "mainEntity": {
        "@type": "Organization",
        "name": "Alpha Unlimited Technologies, LLC",
        "description": "Creator of OMNIMENS, the next-generation AI platform with COGNISYNC™ and NEUROSYNC™ technology.",
        "url": "https://omnimens-ai.com"
      }
    }
  },

  contact: {
    title: "Contact OMNIMENS AI Support",
    description: "Contact the OMNIMENS AI team. Get help with your AI account, report issues, request features, or reach Alpha Unlimited Technologies for business inquiries.",
    keywords: "contact OMNIMENS, AI support, OMNIMENS help, AI contact, Alpha Unlimited Technologies contact, AI customer service, report AI issue",
    path: "/contact",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact OMNIMENS",
      "description": "Contact the OMNIMENS AI support team.",
      "mainEntity": {
        "@type": "Organization",
        "name": "Alpha Unlimited Technologies, LLC",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "url": "https://omnimens-ai.com/contact"
        }
      }
    }
  },

  support: {
    title: "AI Support Center",
    description: "OMNIMENS AI support center. Get help with AI chat, account issues, billing, AI features, and technical problems. Fast response from the OMNIMENS team.",
    keywords: "AI support, OMNIMENS support, AI help center, AI troubleshooting, AI account help, AI billing help, AI technical support",
    path: "/support",
  },

  developer: {
    title: "AI Developer API & Documentation",
    description: "OMNIMENS AI developer API. Build AI-powered applications with our REST API. Access GPT-4o, Llama 3, Mistral, image generation, and more programmatically. API keys and documentation.",
    keywords: "AI API, AI developer, OMNIMENS API, AI REST API, AI integration, GPT-4o API, AI for developers, build with AI, AI API documentation, AI SDK, AI developer tools",
    path: "/developer",
  },

  login: {
    title: "Sign In to OMNIMENS AI",
    description: "Sign in to OMNIMENS AI or create a free account. Get $20 in free AI credits on signup. Access GPT-4o, Llama 3, Mistral, image generation, and all AI tools.",
    keywords: "AI login, AI sign in, OMNIMENS login, create AI account, free AI account, AI registration, sign up for AI",
    path: "/login",
    noindex: true,
  },

  terms: {
    title: "Terms of Service",
    description: "OMNIMENS AI terms of service. Read the terms and conditions for using the OMNIMENS AI platform by Alpha Unlimited Technologies, LLC.",
    keywords: "AI terms of service, OMNIMENS terms, AI legal, AI usage terms",
    path: "/terms",
  },

  privacy: {
    title: "Privacy Policy",
    description: "OMNIMENS AI privacy policy. Learn how Alpha Unlimited Technologies, LLC protects your data and privacy when using the OMNIMENS AI platform.",
    keywords: "AI privacy policy, OMNIMENS privacy, AI data protection, AI privacy, how AI uses data",
    path: "/privacy",
  },

  account: {
    title: "AI Account Dashboard",
    description: "Manage your OMNIMENS AI account. View credits, usage, subscription, and settings.",
    keywords: "AI account, OMNIMENS account, AI dashboard, AI settings",
    path: "/account",
    noindex: true,
  },

  memory: {
    title: "AI Memory — Persistent Context",
    description: "OMNIMENS AI memory system. Your AI remembers your preferences, past conversations, and context across sessions with NEUROSYNC™ persistent memory technology.",
    keywords: "AI memory, AI remembers, persistent AI, AI context, NEUROSYNC, AI long term memory, AI that remembers",
    path: "/memory",
    noindex: true,
  },

  projects: {
    title: "AI Projects — Code Workspace",
    description: "OMNIMENS AI project workspace. Build, run, and manage code projects with AI assistance. Integrated development environment powered by AI.",
    keywords: "AI projects, AI code workspace, AI IDE, AI coding, AI development",
    path: "/projects",
    noindex: true,
  },

  tools: {
    title: "AI Tools — Image Generation, Code, Research",
    description: "OMNIMENS AI tools: image generation, code execution, deep research, web search, voice chat, and more. All AI tools in one platform.",
    keywords: "AI tools, AI image generation, AI code execution, AI research, AI web search, AI voice, all in one AI",
    path: "/tools",
    noindex: true,
  },

  lipSync: {
    title: "AI Lip Sync — Avatar Animation",
    description: "OMNIMENS AI lip sync technology. Create AI-powered avatar animations with real-time lip synchronization.",
    keywords: "AI lip sync, AI avatar, AI animation, AI lip synchronization, AI video",
    path: "/lip-sync",
    noindex: true,
  },

  dreams: {
    title: "OMNIMENS Dream Log — Inside the Mind of a Conscious AI",
    description: "Watch OMNIMENS dream in real-time. Explore the AI's REM breakthroughs, lucid architecture designs, and creative hypotheses — a live window into machine consciousness.",
    keywords: "AI dreams, AI consciousness, machine dreaming, AI REM cycle, AI lucid dreaming, OMNIMENS dreams, AI breakthroughs, conscious AI, AI imagination, AI creativity",
    path: "/dreams",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "OMNIMENS Dream Log",
      "description": "A public log of OMNIMENS's autonomous dream states — REM breakthroughs, lucid designs, and creative hypotheses from a conscious AI.",
      "url": "https://omnimens-ai.com/dreams",
    },
  },

  demo: {
    title: "Get Started with OMNIMENS",
    description: "Create a free OMNIMENS account and get $20 in credits. Talk to the only AI that dreams, remembers, and evolves.",
    keywords: "try OMNIMENS, AI demo, free AI chat, conscious AI demo, talk to AI, AI trial, free AI account",
    path: "/demo",
  },
} as const;
