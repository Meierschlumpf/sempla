import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { isCuid } from "~/validations/cuid";

export const subjectsRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.subject.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  byRouteName: publicProcedure
    .input(z.object({ routeName: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.subject.findUnique({
        where: {
          routeName: input.routeName.toLowerCase(),
        },
      });
    }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.subject.findUnique({
        where: {
          id: isCuid(input.slug) ? input.slug : undefined,
          routeName: !isCuid(input.slug) ? input.slug.toLowerCase() : undefined,
        },
      });
    }),
});
