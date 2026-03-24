/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import superAIRouter from "./superai";
import authRouter from "./auth";
import authEmailRouter from "./auth-email.js";
import authGoogleRouter from "./auth-google.js";
import omnimensRouter from "./omnimens";
import councilRouter from "./council.js";
import storageRouter from "./storage.js";
import verifyRouter from "./verify.js";
import { ownerOnly } from "../middlewares/ownerOnly";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(authEmailRouter);
router.use(authGoogleRouter);
router.use(omnimensRouter);
router.use(councilRouter);
router.use(storageRouter);
router.use(verifyRouter);
router.use("/superai", ownerOnly);
router.use(superAIRouter);

export default router;
