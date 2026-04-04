import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { customersRouter } from "./customers";
import { followupsRouter } from "./followups";
import { tasksRouter } from "./tasks";
import { poolRouter } from "./pool";
import { opportunitiesRouter } from "./opportunities";
import { statsRouter } from "./stats";
import { aiRouter } from "./ai";
import { ordersRouter } from "./orders";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/followups", followupsRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/pool", poolRouter);
apiRouter.use("/opportunities", opportunitiesRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/orders", ordersRouter);
