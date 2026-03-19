/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { motion, AnimatePresence } from "framer-motion";

interface VoiceIndicatorProps {
  isSpeaking: boolean;
  binaryStream: string;
}

export function VoiceIndicator({ isSpeaking, binaryStream }: VoiceIndicatorProps) {
  return (
    <AnimatePresence>
      {isSpeaking && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          className="inline-flex items-center overflow-hidden ml-2"
        >
          <span
            className="font-mono text-[9px] text-primary/60 tracking-tight leading-none select-none whitespace-nowrap"
            aria-hidden
          >
            {binaryStream}
          </span>
          {/* Three animated bars — a classic waveform indicator */}
          <span className="inline-flex items-end gap-px ml-1.5 h-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="block w-[2px] rounded-full bg-primary"
                animate={{ height: ["4px", "12px", "4px"] }}
                transition={{
                  repeat: 1e9,
                  duration: 0.6,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}
