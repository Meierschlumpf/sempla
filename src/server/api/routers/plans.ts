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
      z.object({
        search: z.string().nullable(),
        areaId: z.string().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.plan.findMany({
        include: {
          subject: true,
          area: true,
          creator: true,
          timeSpan: true,
          lessons: true,
          class: true,
        },
        where: {
          OR: !input.search
            ? undefined
            : [
                {
                  subject: {
                    name: {
                      contains: input.search,
                    },
                  },
                },
                {
                  class: {
                    name: {
                      contains: input.search,
                    },
                  },
                },
              ],
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
          lessons: true,
          class: true,
        },
        where: {
          OR: !input.search
            ? undefined
            : [
                {
                  subject: {
                    name: {
                      contains: input.search,
                    },
                  },
                },
                {
                  class: {
                    name: {
                      contains: input.search,
                    },
                  },
                },
              ],
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
          lessons: true,
          class: true,
        },
        where: {
          OR: !input.search
            ? undefined
            : [
                {
                  subject: {
                    name: {
                      contains: input.search,
                    },
                  },
                },
                {
                  class: {
                    name: {
                      contains: input.search,
                    },
                  },
                },
              ],
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
  selectTemplateAndGenerateAppointments: publicProcedure
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
        include: {
          subject: true,
          area: true,
          lessons: true,
          timeSpan: true,
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

      await ctx.prisma.plan.update({
        where: {
          id: input.planId,
        },
        data: {
          templateId: input.templateId === "empty" ? null : input.templateId,
        },
      });

      const template = await ctx.prisma.planTemplate.findUnique({
        where: {
          id: input.templateId,
        },
        include: {
          appointments: {
            include: {
              earlydayAppointments: true,
              eventAppointment: true,
              vacationAppointments: true,
              excursionAppointment: true,
              holidayAppointments: true,
            },
          },
        },
      });

      let date = dayjs(plan.timeSpan.start);

      while (date.isBefore(plan.timeSpan.end)) {
        const lessons = plan.lessons.filter(
          (x) => x.weekDay === date.day() - 1
        );

        if (lessons.length === 0) {
          date = date.add(1, "day");
          continue;
        }

        const isInVacations =
          template !== null &&
          template.appointments.some((appointment) => {
            if (appointment.type !== "vacation") return;

            return (
              dayjs(appointment.start).isBefore(date, "hour") &&
              dayjs(appointment.end).isAfter(date, "hour")
            );
          });

        if (isInVacations) {
          date = date.add(1, "day");
          continue;
        }

        const isOnHoliday =
          template !== null &&
          template.appointments.some((appointment) => {
            if (appointment.type !== "holiday") return;

            return (
              dayjs(appointment.start).isBefore(date, "hour") &&
              dayjs(appointment.end).isAfter(date, "hour")
            );
          });

        if (isOnHoliday) {
          date = date.add(1, "day");
          continue;
        }

        const isOnEventDay =
          template !== null &&
          template.appointments.some((appointment) => {
            if (appointment.type !== "event") return;

            return (
              dayjs(appointment.start).isBefore(date, "hour") &&
              dayjs(appointment.end).isAfter(date, "hour")
            );
          });

        if (isOnEventDay) {
          date = date.add(1, "day");
          continue;
        }

        const isEarlyDay =
          template !== null &&
          template.appointments.some((appointment) => {
            if (appointment.type !== "earlyday") return;

            return dayjs(appointment.start).isSame(date, "day");
          });

        for (const lesson of lessons) {
          if (lesson.endTime / 60 > 16 && isEarlyDay) continue;

          const startOfDay = dayjs(date).startOf("day").add(1, "hour");
          const startTime = dayjs(startOfDay).add(lesson.startTime, "minute");
          const endTime = dayjs(startOfDay).add(lesson.endTime, "minute");

          await ctx.prisma.appointment.create({
            data: {
              start: startTime.toDate(),
              end: endTime.toDate(),
              planId: plan.id,
              type: "lesson",
              lessonAppointment: {
                create: {
                  subjectId: plan.subjectId,
                },
              },
            },
          });
        }

        date = date.add(1, "day");
      }

      return;
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
  test: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.lessonAppointment.deleteMany({
      where: {
        topicId: null,
      },
    });

    await ctx.prisma.appointment.deleteMany({
      where: {
        type: "lesson",
        createdAt: {
          gt: dayjs("2023-04-16T13:40:00.000Z").toDate(),
        },
      },
    });
  }),
  finishCreation: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.plan.update({
        where: {
          id: input.id,
        },
        data: {
          isDraft: false,
        },
      });
    }),
});
