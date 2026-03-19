/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { type Request, type Response, type NextFunction } from "express";

export function ownerOnly(req: Request, res: Response, next: NextFunction) {
  const ownerId = process.env.REPL_OWNER_ID;

  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!ownerId) {
    console.error("REPL_OWNER_ID not set — owner protection is disabled");
    next();
    return;
  }

  if (req.user!.id !== ownerId) {
    res.status(403).json({ error: "Forbidden — owner access only" });
    return;
  }

  next();
}
