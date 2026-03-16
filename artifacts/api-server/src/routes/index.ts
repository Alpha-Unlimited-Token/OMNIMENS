import { Router, type IRouter } from "express";
import healthRouter from "./health";
import superAIRouter from "./superai";
import authRouter from "./auth";
import omnimensRouter from "./omnimens";
import { ownerOnly } from "../middlewares/ownerOnly";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(omnimensRouter);
router.use("/superai", ownerOnly);
router.use(superAIRouter);

export default router;
