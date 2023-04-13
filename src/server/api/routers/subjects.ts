import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const subjectsRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
});
