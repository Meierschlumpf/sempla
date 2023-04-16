import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";
import { timeStringToMinutesFromMidnight } from "~/helpers/time";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const planRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findUnique({
        include: {
          subject: true,
          lessons: true,
        },
        where: {
          id: input.id,
        },
      });
    }),
  draft: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.plan.findFirst({
      where: {
        isDraft: true,
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
          timeSpan: true,
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
          timeSpan: {
            start: {
              lte: dayjs().endOf("date").toDate(),
            },
            end: {
              gte: dayjs().startOf("date").toDate(),
            },
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
          timeSpan: true,
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
          timeSpan: {
            end: {
              lt: dayjs().startOf("date").toDate(),
            },
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
          timeSpan: true,
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
          timeSpan: {
            start: {
              gt: dayjs().endOf("date").toDate(),
            },
          },
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        timeSpanId: z.string(),
        areaId: z.string(),
        classId: z.string(),
        subjectId: z.string(),
        lessons: z.array(
          z.object({
            weekDay: z.number().min(0).max(5),
            startTime: z.string().regex(/^[0-9]{2}:[0-9]{2}$/),
            endTime: z.string().regex(/^[0-9]{2}:[0-9]{2}$/),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: remove as soon as auth is working.

      const firstTeacher = await ctx.prisma.teacher.findFirst();

      if (!firstTeacher)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No creator found. (TODO: remove)",
        });

      return await ctx.prisma.plan.create({
        data: {
          timeSpanId: input.timeSpanId,
          areaId: input.areaId,
          classId: input.classId,
          subjectId: input.subjectId,
          creatorId: firstTeacher?.id,
          lessons: {
            create: input.lessons.map((lesson) => ({
              weekDay: lesson.weekDay,
              startTime: timeStringToMinutesFromMidnight(lesson.startTime),
              endTime: timeStringToMinutesFromMidnight(lesson.endTime),
            })),
          },
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        timeSpanId: z.string(),
        areaId: z.string(),
        classId: z.string(),
        subjectId: z.string(),
        lessons: z.array(
          z.object({
            id: z.string().nullable(),
            weekDay: z.number().min(0).max(5),
            startTime: z.string().regex(/^[0-9]{2}:[0-9]{2}$/),
            endTime: z.string().regex(/^[0-9]{2}:[0-9]{2}$/),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.plan.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan not found.",
        });
      }

      return await ctx.prisma.plan.update({
        where: {
          id: input.id,
        },
        data: {
          timeSpanId: input.timeSpanId,
          areaId: input.areaId,
          classId: input.classId,
          subjectId: input.subjectId,
          lessons: {
            create: input.lessons
              .filter((x) => x.id === null)
              .map((lesson) => ({
                weekDay: lesson.weekDay,
                startTime: timeStringToMinutesFromMidnight(lesson.startTime),
                endTime: timeStringToMinutesFromMidnight(lesson.endTime),
              })),
            update: input.lessons
              .filter((x) => x.id !== null)
              .map((lesson) => ({
                where: {
                  id: lesson.id!,
                },
                data: {
                  weekDay: lesson.weekDay,
                  startTime: timeStringToMinutesFromMidnight(lesson.startTime),
                  endTime: timeStringToMinutesFromMidnight(lesson.endTime),
                },
              })),
          },
        },
      });
    }),
  selectTemplate: publicProcedure
    .input(
      z.object({
        planId: z.string(),
        templateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.plan.findUnique({
        where: {
          id: input.planId,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan not found.",
        });
      }

      if (plan.templateId) {
        // TODO: handle change from previous template to new template
        // Check for appointments that are defined specifically for this plan
      }

      return await ctx.prisma.plan.update({
        where: {
          id: input.planId,
        },
        data: {
          templateId: input.templateId === "empty" ? null : input.templateId,
        },
      });
    }),
  remove: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.plan.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
