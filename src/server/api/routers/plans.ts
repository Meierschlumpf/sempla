import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const planRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  bySubjectAndArea: publicProcedure
    .input(z.object({ subjectId: z.string(), areaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findFirst({
        where: {
          subjectId: input.subjectId,
          areaId: input.areaId,
        },
      });
    }),
  current: publicProcedure
    .input(
      z.object({ search: z.string().nullable(), areaId: z.string().nullable() })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findMany({
        include: {
          subject: true,
          area: true,
          creator: true,
        },
        where: {
          subject: !input.search
            ? undefined
            : {
                name: {
                  contains: input.search,
                },
              },
          area: !input.areaId
            ? undefined
            : {
                id: input.areaId,
              },
        },
      });
    }),
  past: publicProcedure
    .input(
      z.object({ search: z.string().nullable(), areaId: z.string().nullable() })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findMany({
        include: {
          subject: true,
          area: true,
          creator: true,
        },
        where: {
          subject: !input.search
            ? undefined
            : {
                name: {
                  contains: input.search,
                },
              },
          area: !input.areaId
            ? undefined
            : {
                id: input.areaId,
              },
        },
      });
    }),
  future: publicProcedure
    .input(
      z.object({ search: z.string().nullable(), areaId: z.string().nullable() })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findMany({
        include: {
          subject: true,
          area: true,
          creator: true,
        },
        where: {
          subject: !input.search
            ? undefined
            : {
                name: {
                  contains: input.search,
                },
              },
          area: !input.areaId
            ? undefined
            : {
                id: input.areaId,
              },
        },
      });
    }),
});
