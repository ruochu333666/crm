import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { customersRouter } from "./customers";
import { followupsRouter } from "./followups";
import { tasksRouter } from "./tasks";
import { poolRouter } from "./pool";
import { opportunitiesRouter } from "./opportunities";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/followups", followupsRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/pool", poolRouter);
apiRouter.use("/opportunities", opportunitiesRouter);
