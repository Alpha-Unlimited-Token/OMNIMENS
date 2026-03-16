import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight } from "lucide-react";

const QUICK_TEMPLATES = [
  { category: "Writing", emoji: "✍️", items: [
    { label: "Blog Post", prompt: "Write a comprehensive, SEO-optimized blog post about [topic]. Include an engaging introduction, 5-7 main sections, key takeaways, and a strong conclusion." },
    { label: "Email Draft", prompt: "Write a professional email to [recipient] about [subject]. Key points: [points]. Include a clear call to action." },
    { label: "Cover Letter", prompt: "Write a compelling cover letter for a [position] role at [company]. My background: [background]. Highlight my key relevant skills." },
    { label: "Press Release", prompt: "Write a professional press release announcing [news]. Include headline, opening paragraph (who/what/when/where/why), details, boilerplate, and contact info." },
    { label: "Executive Summary", prompt: "Write a concise executive summary for [document/project]. Audience: executives. Include key findings, recommendations, financial impact, timeline. Max 1 page." },
  ]},
  { category: "Coding", emoji: "💻", items: [
    { label: "Code Review", prompt: "Review this code for bugs, security vulnerabilities, performance issues, and best practices. Provide specific improvement suggestions:\n\n[paste code]" },
    { label: "Debug This", prompt: "I'm getting this error: [error message]. Here's my code:\n\n[paste code]\n\nExplain the cause and provide the fix with explanation." },
    { label: "Write Tests", prompt: "Write comprehensive unit tests for this function/class. Cover: happy path, edge cases, error conditions, boundary values. Framework: [testing framework]\n\n[paste code]" },
    { label: "Refactor", prompt: "Refactor this code to improve readability, performance, and maintainability while keeping functionality identical. Explain each major change:\n\n[paste code]" },
    { label: "API Docs", prompt: "Write comprehensive API documentation for this endpoint. Include: overview, parameters (types, required/optional, examples), return values, error codes, and usage examples:\n\n[paste spec]" },
  ]},
  { category: "Research", emoji: "🔬", items: [
    { label: "Research Brief", prompt: "Create a comprehensive research brief on [topic]. Include: background, key stakeholders, current state, major findings, controversies, and knowledge gaps. Cite sources." },
    { label: "Competitive Analysis", prompt: "Conduct a competitive analysis of [company/product] vs [competitors]. Include: market positioning, feature comparison, pricing, strengths/weaknesses, and strategic recommendations." },
    { label: "SWOT Analysis", prompt: "Perform a detailed SWOT analysis for [company/project/idea]. For each quadrant, provide 5-7 specific items with supporting reasoning and strategic implications." },
    { label: "Market Research", prompt: "Research the [market/industry]. Include: market size, growth rate, key players, trends, customer segments, pain points, and opportunities." },
    { label: "Literature Review", prompt: "Write a literature review on [topic] covering the last 5 years. Synthesize key themes, methodologies, findings, consensus views, and future research directions." },
  ]},
  { category: "Analysis", emoji: "📊", items: [
    { label: "Data Analysis", prompt: "Analyze this data and provide insights:\n\n[paste data]\n\nInclude: summary statistics, key trends, anomalies, patterns, recommendations, and suggested visualizations." },
    { label: "Root Cause Analysis", prompt: "Perform a root cause analysis for: [describe problem]. Use the 5 Whys method. Identify primary, secondary, and contributing causes. Recommend preventive actions." },
    { label: "Risk Assessment", prompt: "Conduct a risk assessment for [project/decision]. For each risk: likelihood (1-5), impact (1-5), risk score, mitigation strategy, and contingency plan. Prioritize by risk score." },
    { label: "Decision Matrix", prompt: "Help me decide: [decision]. Options: [list options]. Factors: [factors]. Create a weighted decision matrix, score each option, and provide a recommendation." },
    { label: "Business Case", prompt: "Build a business case for [proposal]. Include: problem statement, proposed solution, costs, benefits, ROI calculation, risks, and recommendation." },
  ]},
  { category: "Creative", emoji: "🎨", items: [
    { label: "Story Starter", prompt: "Write the opening chapter (1500 words) of a [genre] story set in [setting]. Protagonist: [character]. Establish the world, voice, and central conflict. End on a hook." },
    { label: "Brainstorm", prompt: "Generate 20 creative ideas for [topic/problem]. Think across domains, challenge assumptions, combine unexpected elements. Include conventional, unconventional, and wild ideas." },
    { label: "Character Profile", prompt: "Create a deep character profile for [name], a [age]-year-old [description]. Include: backstory, motivations, fears, relationships, speech patterns, strengths/flaws, and character arc." },
    { label: "World Building", prompt: "Build a detailed fictional world for [genre/setting]. Include: geography, history, political systems, cultures, technology/magic systems, economy, and social structures." },
    { label: "Brand Name Ideas", prompt: "Generate 15 creative brand name ideas for [business/product description]. Include: meaning, memorability, domain availability considerations, and why each name fits." },
  ]},
  { category: "Business", emoji: "💼", items: [
    { label: "Business Plan", prompt: "Create a comprehensive business plan for [idea]. Include: executive summary, problem/solution, market opportunity, business model, competitive advantage, go-to-market strategy, and financial projections." },
    { label: "Product Roadmap", prompt: "Create a 12-month product roadmap for [product]. Include: quarterly goals, feature priorities with rationale, success metrics, dependencies, and resource requirements. Format as table." },
    { label: "Meeting Agenda", prompt: "Create a structured meeting agenda for a [type] meeting with [attendees] lasting [duration]. Include: goals, time blocks, discussion questions, decision points, and action item section." },
    { label: "User Stories", prompt: "Write user stories for [feature]. Format: As a [user], I want [goal] so that [benefit]. Include acceptance criteria and edge cases for each story." },
    { label: "OKRs", prompt: "Help me write OKRs (Objectives & Key Results) for [team/role] for Q[quarter]. Our main goals are: [goals]. Make them ambitious but achievable, with measurable key results." },
  ]},
  { category: "Learning", emoji: "🎓", items: [
    { label: "Explain Simply", prompt: "Explain [complex topic] as if I'm [background/level]. Use analogies, real-world examples, no jargon. Break into digestible steps. End with 3 key things to remember." },
    { label: "Study Guide", prompt: "Create a comprehensive study guide for [subject/exam]. Include: key concepts, formulas/rules, common patterns, memory tricks, practice questions with answers, and resources." },
    { label: "Lesson Plan", prompt: "Create a detailed lesson plan for teaching [topic] to [audience]. Include: objectives, materials, introduction, main activity, practice, assessment, and differentiation strategies." },
    { label: "Concept Map", prompt: "Create a concept map for [topic]. Show the main concept, related sub-concepts, and how they interconnect. Describe the relationships between each node." },
    { label: "Quiz Me", prompt: "Create a challenging 10-question quiz on [topic]. Include: mix of multiple choice, short answer, and application questions. Provide answers with explanations." },
  ]},
  { category: "Personal", emoji: "🏠", items: [
    { label: "Goal Plan", prompt: "Help me plan to achieve: [goal]. Timeline: [timeframe]. Current situation: [context]. Include: milestone breakdown, obstacles and solutions, daily/weekly habits, success metrics." },
    { label: "Resume Bullets", prompt: "Rewrite these job experience bullet points to be more impactful. Use strong action verbs, quantify achievements, focus on impact:\n\n[paste bullet points]" },
    { label: "Travel Itinerary", prompt: "Create a detailed [duration] itinerary for [destination]. Style: [style]. Budget: [budget]. Include: daily schedule with times, attractions, restaurants, local tips, transportation." },
    { label: "Meal Plan", prompt: "Create a [duration] meal plan for [dietary preference]. Include: all meals, snacks, shopping list by category, prep tips, and approximate calorie/macro estimates." },
    { label: "Budget Plan", prompt: "Help me create a monthly budget for income of $[amount]. My fixed expenses are: [expenses]. Goals: [financial goals]. Suggest a realistic budget allocation and savings strategy." },
  ]},
];

export function SmartTemplates({ open, onClose, onUseTemplate }: {
  open: boolean;
  onClose: () => void;
  onUseTemplate: (prompt: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = QUICK_TEMPLATES
    .map(cat => ({
      ...cat,
      items: cat.items.filter(i =>
        !search || i.label.toLowerCase().includes(search.toLowerCase()) || i.prompt.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => (category === null || cat.category === category) && cat.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-xl max-h-[70vh] bg-[#0a0a0f] border border-white/12 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/8 bg-black/40">
              <p className="font-mono text-[11px] font-bold text-white tracking-wider">SMART TEMPLATES</p>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="shrink-0 px-4 pt-3 pb-2 space-y-2">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs font-mono text-white placeholder:text-white/25 outline-none focus:border-primary/30" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button onClick={() => setCategory(null)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-all ${category === null ? "bg-primary/20 text-primary border-primary/40" : "text-white/40 border-white/10 hover:text-white/60"}`}>
                  All
                </button>
                {QUICK_TEMPLATES.map(cat => (
                  <button key={cat.category} onClick={() => setCategory(c => c === cat.category ? null : cat.category)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-all ${category === cat.category ? "bg-primary/20 text-primary border-primary/40" : "text-white/40 border-white/10 hover:text-white/60"}`}>
                    <span>{cat.emoji}</span> {cat.category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto omnimens-scrollbar px-4 pb-4 space-y-4">
              {filtered.map(cat => (
                <div key={cat.category}>
                  <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span>{cat.emoji}</span> {cat.category}
                  </p>
                  <div className="space-y-1">
                    {cat.items.map((item, i) => (
                      <button key={i} onClick={() => { onUseTemplate(item.prompt); onClose(); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/8 bg-white/2 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group">
                        <span className="text-[11px] font-mono text-white/80 group-hover:text-white">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
