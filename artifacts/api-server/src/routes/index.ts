import { Router, type IRouter } from "express";
import healthRouter from "./health";
import superAIRouter from "./superai";
import authRouter from "./auth";
import omnimensRouter from "./omnimens";
import councilRouter from "./council.js";
import { ownerOnly } from "../middlewares/ownerOnly";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(omnimensRouter);
router.use(councilRouter);
router.use("/superai", ownerOnly);
router.use(superAIRouter);

export default router;
