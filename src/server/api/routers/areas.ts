import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { isCuid } from "~/validations/cuid";

export const areaRouter = createTRPCRouter({
  me: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.area.findMany();
  }),
  bySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.area.findUnique({
        where: {
          id: isCuid(input.slug) ? input.slug : undefined,
          routeName: !isCuid(input.slug) ? input.slug.toLowerCase() : undefined,
        },
      });
    }),
});
