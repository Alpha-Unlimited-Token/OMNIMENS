import { Router, type IRouter } from "express";
import healthRouter from "./health";
import superAIRouter from "./superai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(superAIRouter);

export default router;
