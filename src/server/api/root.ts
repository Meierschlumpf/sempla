import { createTRPCRouter } from "~/server/api/trpc";
import { appointmentsRouter } from "~/server/api/routers/appointments";
import { subjectsRouter } from "./routers/subjects";
import { topicsRouter } from "./routers/topics";
import { planRouter } from "./routers/plans";
import { areaRouter } from "./routers/areas";

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
});

// export type definition of API
export type AppRouter = typeof appRouter;
