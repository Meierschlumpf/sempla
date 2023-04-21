import { createTRPCRouter } from "~/server/api/trpc";
import { appointmentsRouter } from "~/server/api/routers/appointments";
import { subjectsRouter } from "./routers/subjects";
import { topicsRouter } from "./routers/topics";
import { planRouter } from "./routers/plans";
import { areaRouter } from "./routers/areas";
import { timeSpanRouter } from "./routers/timeSpans";
import { classRouter } from "./routers/classes";
import { templateRouter } from "./routers/templates";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  appointment: appointmentsRouter,
  subject: subjectsRouter,
  topic: topicsRouter,
  plan: planRouter,
  area: areaRouter,
  timeSpan: timeSpanRouter,
  class: classRouter,
  template: templateRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
