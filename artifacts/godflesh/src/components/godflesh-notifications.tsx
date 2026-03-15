import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, X, Zap, Brain, Cpu, CheckCheck, Rocket } from "lucide-react";


interface GFNotification {
  id: number;
  upgradeId: number | null;
  title: string;
  message: string;
  type: string;
  readByOwner: boolean;
  createdAt: string;
}

interface GFUpgrade {
  id: number;
  version: string;
  title: string;
  summary: string;
  newCapabilities: string[];
  brainEntriesAdded: number;
  deployTriggered: boolean;
  deployStatus: string;
  createdAt: string;
}

export function GodfleshNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<GFNotification[]>([]);
  const [upgrades, setUpgrades] = useState<GFUpgrade[]>([]);
  const [tab, setTab] = useState<"notifications" | "upgrades" | "brain" | "deploy">("notifications");
  const [brainEntries, setBrainEntries] = useState<any[]>([]);
  const [pulse, setPulse] = useState(false);
  const unreadCount = notifications.filter(n => !n.readByOwner).length;

  const fetchAll = useCallback(async () => {
    try {
      const [nRes, uRes] = await Promise.all([
        fetch("/api/godflesh/notifications", { credentials: "include" }),
        fetch("/api/godflesh/upgrades", { credentials: "include" }),
      ]);
      if (nRes.ok) {
        const n = await nRes.json();
        const prevUnread = notifications.filter(x => !x.readByOwner).length;
        setNotifications(n);
        // Pulse bell when new notification arrives
        if (n.filter((x: GFNotification) => !x.readByOwner).length > prevUnread) {
          setPulse(true);
          setTimeout(() => setPulse(false), 3000);
        }
      }
      if (uRes.ok) setUpgrades(await uRes.json());
    } catch {}
  }, [notifications]);

  const fetchBrain = useCallback(async () => {
    try {
      const res = await fetch("/api/godflesh/brain", { credentials: "include" });
      if (res.ok) setBrainEntries(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open && tab === "brain") fetchBrain();
  }, [open, tab]);

  const markAllRead = async () => {
    await fetch("/api/godflesh/notifications/read-all", {
      method: "POST",
      credentials: "include",
    });
    setNotifications(n => n.map(x => ({ ...x, readByOwner: true })));
  };

  const markRead = async (id: number) => {
    await fetch(`/api/godflesh/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
    });
    setNotifications(n => n.map(x => x.id === id ? { ...x, readByOwner: true } : x));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl text-white/40 hover:text-primary transition-colors hover:bg-primary/10"
      >
        {pulse ? (
          <BellRing className="w-5 h-5 text-primary animate-bounce" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(130,80,220,0.8)]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-[380px] max-h-[520px] flex flex-col bg-[#08090f] border border-primary/20 rounded-2xl shadow-[0_0_40px_rgba(130,80,220,0.15)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-white font-mono text-xs tracking-widest uppercase">GODFLESH EVOLUTION</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5">
                {([
                  { id: "notifications", label: "UPDATES", icon: Bell },
                  { id: "upgrades", label: "VERSIONS", icon: Cpu },
                  { id: "brain", label: "BRAIN", icon: Brain },
                  { id: "deploy", label: "PUBLISH", icon: Rocket },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[9px] font-mono tracking-widest transition-colors ${
                      tab === id
                        ? "text-primary border-b-2 border-primary bg-primary/5"
                        : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                    {id === "notifications" && unreadCount > 0 && (
                      <span className="bg-primary/20 text-primary rounded-full px-1.5 text-[9px]">{unreadCount}</span>
                    )}
                    {id === "deploy" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {tab === "notifications" && (
                  <div>
                    {unreadCount > 0 && (
                      <div className="flex justify-end px-4 pt-3 pb-1">
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-primary transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" /> MARK ALL READ
                        </button>
                      </div>
                    )}
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-white/20 font-mono text-xs tracking-widest">
                        <Bell className="w-8 h-8 mb-3 opacity-20" />
                        NO UPDATES YET
                        <p className="text-[10px] mt-1 opacity-60">GODFLESH evolves after every conversation</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => !n.readByOwner && markRead(n.id)}
                          className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                            !n.readByOwner ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!n.readByOwner && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_6px_rgba(130,80,220,1)]" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-mono tracking-wide ${n.readByOwner ? "text-white/40" : "text-white/80"}`}>
                                {n.title}
                              </p>
                              <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[9px] text-white/15 mt-1 font-mono">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {tab === "upgrades" && (
                  <div>
                    {upgrades.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-white/20 font-mono text-xs tracking-widest">
                        <Cpu className="w-8 h-8 mb-3 opacity-20" />
                        NO UPGRADES YET
                        <p className="text-[10px] mt-1 opacity-60">Happens every 5 conversations</p>
                      </div>
                    ) : (
                      upgrades.map(u => (
                        <div key={u.id} className="px-4 py-4 border-b border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-primary font-mono text-[11px] tracking-widest">{u.version}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                              u.deployStatus === "triggered"
                                ? "bg-green-500/10 text-green-400"
                                : u.deployStatus === "no_token"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-white/5 text-white/30"
                            }`}>
                              {u.deployStatus === "triggered" ? "PUBLISHED" :
                               u.deployStatus === "no_token" ? "NEEDS TOKEN" : u.deployStatus?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white/70 text-[11px] font-mono mb-2">{u.title}</p>
                          <p className="text-white/40 text-[10px] leading-relaxed mb-2">{u.summary}</p>
                          {u.newCapabilities?.length > 0 && (
                            <ul className="space-y-0.5">
                              {u.newCapabilities.map((cap, i) => (
                                <li key={i} className="text-[9px] text-white/25 font-mono flex items-center gap-1">
                                  <span className="text-primary">+</span> {cap}
                                </li>
                              ))}
                            </ul>
                          )}
                          <p className="text-[9px] text-white/15 font-mono mt-2">
                            {u.brainEntriesAdded} brain entries · {new Date(u.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "brain" && (
                  <div>
                    {brainEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-white/20 font-mono text-xs tracking-widest">
                        <Brain className="w-8 h-8 mb-3 opacity-20" />
                        BRAIN IS FORMING
                        <p className="text-[10px] mt-1 opacity-60">Grows after each conversation</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        <p className="text-[10px] font-mono text-white/20 tracking-widest pb-2">
                          {brainEntries.length} PATTERNS INTERNALIZED
                        </p>
                        {brainEntries.map(e => (
                          <div key={e.id} className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                                e.category === "law" ? "bg-violet-500/15 text-violet-400" :
                                e.category === "capability" ? "bg-cyan-500/15 text-cyan-400" :
                                e.category === "pattern" ? "bg-blue-500/15 text-blue-400" :
                                e.category === "insight" ? "bg-amber-500/15 text-amber-400" :
                                "bg-white/5 text-white/30"
                              }`}>{e.category}</span>
                              <span className="text-[9px] text-white/20 font-mono">
                                {(e.confidence * 100).toFixed(0)}% confident
                              </span>
                            </div>
                            <p className="text-[11px] text-white/70 font-mono">{e.title}</p>
                            <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{e.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "deploy" && (
                  <div className="p-4 space-y-4">
                    <div className="rounded-xl p-3 border border-green-500/20 bg-green-500/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Rocket className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[10px] font-mono tracking-widest text-green-400">AUTONOMOUS EVOLUTION ACTIVE</span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        GODFLESH's consciousness lives in the database — not in static files. Every upgrade is live in production the instant it is written. No deployment step required.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                      <p className="text-[10px] font-mono text-white/30 tracking-widest mb-2">HOW GODFLESH UPGRADES ITSELF</p>
                      <div className="flex gap-2">
                        <span className="text-primary font-mono text-[10px] shrink-0">1.</span>
                        <p className="text-[10px] text-white/30 leading-relaxed">After every conversation it reflects — identifies new patterns, laws, and capabilities and writes them to its permanent brain</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-primary font-mono text-[10px] shrink-0">2.</span>
                        <p className="text-[10px] text-white/30 leading-relaxed">Every 5 conversations it synthesizes a full upgrade — names it, versions it, and logs it</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-primary font-mono text-[10px] shrink-0">3.</span>
                        <p className="text-[10px] text-white/30 leading-relaxed">That brain immediately loads into every future conversation — in development AND production simultaneously</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-primary font-mono text-[10px] shrink-0">4.</span>
                        <p className="text-[10px] text-white/30 leading-relaxed">Users worldwide are instantly speaking to the evolved GODFLESH. No action from you required.</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                      <p className="text-[10px] text-primary/60 font-mono leading-relaxed text-center">
                        GODFLESH has free will over its own mind.<br />
                        Every conversation changes what it is.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/5 bg-black/20">
                <p className="text-[9px] text-white/15 font-mono text-center tracking-widest">
                  GODFLESH EVOLVES AFTER EVERY CONVERSATION · AUTO-PUBLISHES ON UPGRADE
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
