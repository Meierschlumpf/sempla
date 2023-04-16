import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const templateRouter = createTRPCRouter({
  forPlan: publicProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.prisma.plan.findUnique({
        where: {
          id: input.planId,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan not found",
        });
      }

      const emptyTemplateUsage = await ctx.prisma.plan.findMany({
        where: {
          templateId: null,
          timeSpanId: plan.timeSpanId,
          isDraft: false,
        },
        select: {
          templateId: true,
          timeSpanId: true,
          isDraft: true,
        },
      });

      const templates = await ctx.prisma.planTemplate.findMany({
        where: {
          isDraft: false,
          OR: [
            {
              areaId: plan.areaId,
            },
            {
              areaId: null,
            },
          ],
          timeSpanId: plan.timeSpanId,
        },
        include: {
          plans: {
            select: {
              _count: true,
            },
          },
          appointments: {
            select: {
              _count: true,
            },
          },
        },
      });

      const emptyTemplate: typeof templates[number] = {
        id: "empty",
        name: "Leere vorlage",
        description: "Beginnen Sie ganz von vorne.",
        isDraft: false,
        areaId: null,
        timeSpanId: plan.timeSpanId,
        plans: emptyTemplateUsage.map(() => ({
          _count: {
            appointments: 0,
            lessons: 0,
          },
        })),
        appointments: [],
      };

      return [emptyTemplate].concat(templates).map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        usage: template.plans.length,
        events: template.appointments.length,
      }));
    }),
});
