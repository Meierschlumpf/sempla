import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const timeSpanRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.timeSpan.findMany({
      orderBy: {
        start: "desc",
      },
    });
  }),
});
