import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, X, Check, Zap, FolderOpen, CreditCard, Shield, Star, MessageSquare, Rocket, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  type: "credit" | "project" | "system" | "achievement" | "chat";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  credit: { icon: <CreditCard className="w-3.5 h-3.5" />, color: "text-amber-400 bg-amber-500/15" },
  project: { icon: <FolderOpen className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-500/15" },
  system: { icon: <Shield className="w-3.5 h-3.5" />, color: "text-violet-400 bg-violet-500/15" },
  achievement: { icon: <Star className="w-3.5 h-3.5" />, color: "text-green-400 bg-green-500/15" },
  chat: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-cyan-400 bg-cyan-500/15" },
};

function generateNotifications(): Notification[] {
  const now = Date.now();
  return [
    { id: "1", type: "credit", title: "Monthly Credits Added", message: "2,000 free credits have been added to your account.", time: new Date(now - 3600000).toISOString(), read: false },
    { id: "2", type: "system", title: "OMNIMENS Updated", message: "New features: improved code execution, faster responses.", time: new Date(now - 7200000).toISOString(), read: false },
    { id: "3", type: "achievement", title: "Power User", message: "You've used OMNIMENS for 7 consecutive days!", time: new Date(now - 86400000).toISOString(), read: true },
    { id: "4", type: "project", title: "Build Complete", message: "Your project 'Portfolio Site' has finished building.", time: new Date(now - 172800000).toISOString(), read: true },
    { id: "5", type: "chat", title: "Conversation Saved", message: "Your conversation has been saved to memory.", time: new Date(now - 259200000).toISOString(), read: true },
  ];
}

export function NotificationBell({ expanded }: { expanded: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(generateNotifications());
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`group relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all ${
          open ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
        }`}
      >
        <div className="shrink-0 flex items-center justify-center w-[18px] relative">
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-semibold text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {expanded ? (
          <span className="text-[13px] font-medium truncate">Notifications</span>
        ) : (
          <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[#2B3245] border border-[#3D4659] text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
            Notifications
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute left-full ml-2 bottom-0 w-80 bg-[#1C2333] border border-[#2B3245] rounded-xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3245]">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[#9DA5B4] hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-[#9DA5B4]/30 mx-auto mb-2" />
                  <p className="text-sm text-[#9DA5B4]">No notifications</p>
                </div>
              ) : (
                notifications.map(n => {
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 ${
                        !n.read ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${!n.read ? "text-white" : "text-white/60"}`}>{n.title}</span>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-[#9DA5B4] mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-[#9DA5B4]/60 mt-1 block">{formatTimeAgo(n.time)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
