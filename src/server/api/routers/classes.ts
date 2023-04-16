import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const classRouter = createTRPCRouter({
  byAreaId: publicProcedure
    .input(z.object({ areaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.class.findMany({
        where: {
          areaId: input.areaId,
        },
      });
    }),
});
