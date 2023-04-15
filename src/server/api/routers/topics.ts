import { type PrismaClient, type Topic } from "@prisma/client";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

type TopicOverviewReducer = {
  topics: {
    id: string;
    topicId: string | null;
    name: string | null;
    start: Date;
    end: Date;
    duration: number;
  }[];
  lastTopicId: string | null | undefined;
};

const renameScopeSchema = z
  .object({
    type: z.literal("all"),
  })
  .or(
    z.object({
      type: z.literal("plan"),
      planId: z.string(),
    })
  )
  .or(
    z.object({
      type: z.literal("block"),
      start: z.date(),
      end: z.date(),
    })
  );

export const topicsRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.topic.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
  byPlan: publicProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lessons = await ctx.prisma.lessonAppointment.findMany({
        include: {
          parent: true,
          topic: true,
        },
        orderBy: {
          parent: {
            start: "asc",
          },
        },
        where: {
          parent: {
            planId: input.planId,
          },
        },
      });

      return lessons.reduce(
        (prev: TopicOverviewReducer, curr) => {
          if (prev.lastTopicId === undefined) {
            prev.topics.push({
              id: randomUUID(),
              topicId: curr.topicId,
              name: curr.topic === null ? null : curr.topic.name,
              duration: 1,
              start: curr.parent.start,
              end: curr.parent.end,
            });
            prev.lastTopicId = curr.topicId;

            return prev;
          }

          if (prev.lastTopicId === curr.topicId) {
            prev.topics[prev.topics.length - 1]!.duration++;
            prev.topics[prev.topics.length - 1]!.end = curr.parent.end;

            return prev;
          }

          prev.topics.push({
            id: randomUUID(),
            topicId: curr.topicId,
            name: curr.topic === null ? null : curr.topic.name,
            start: curr.parent.start,
            end: curr.parent.end,
            duration: 1,
          });
          prev.lastTopicId = curr.topicId;

          return prev;
        },
        {
          topics: [],
          lastTopicId: undefined,
        }
      ).topics;
    }),

  countByPlan: publicProcedure
    .input(
      z.object({
        planId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const lessons = await ctx.prisma.lessonAppointment.findMany({
        where: {
          parent: {
            planId: input.planId,
          },
        },
        select: {
          topicId: true,
          parent: {
            select: {
              planId: true,
            },
          },
        },
        distinct: ["topicId"],
      });

      return lessons.length;
    }),

  move: publicProcedure
    .input(
      z.object({
        from: z.object({
          id: z.string().nullable(),
          start: z.date(),
          end: z.date(),
        }),
        to: z.object({
          id: z.string().nullable(),
          start: z.date(),
          end: z.date(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subsequentAppointments =
        await ctx.prisma.lessonAppointment.findMany({
          include: {
            parent: true,
          },
          where: {
            parent: {
              OR: [
                {
                  start: {
                    gte: input.from.start,
                  },
                },
                {
                  start: {
                    gte: input.to.start,
                  },
                },
              ],
            },
          },
          orderBy: {
            parent: {
              start: "asc",
            },
          },
        });

      const toIndex = subsequentAppointments.findIndex((appointment) => {
        return (
          appointment.parent.start >= input.to.start &&
          appointment.topicId === input.to.id
        );
      });

      const fromIndex = subsequentAppointments.findIndex((appointment) => {
        return (
          appointment.parent.start >= input.from.start &&
          appointment.topicId === input.from.id
        );
      });

      const fromFilter = fromIndex > toIndex ? "from" : "to";

      const fromSpan = subsequentAppointments.filter((appointment) => {
        return (
          appointment.parent.start >= input[fromFilter].start &&
          appointment.parent.end <= input[fromFilter].end &&
          appointment.topicId === input[fromFilter].id
        );
      });

      const toFilter = fromIndex > toIndex ? "to" : "from";

      const toSpan = subsequentAppointments.filter((appointment) => {
        return (
          appointment.parent.start >= input[toFilter].start &&
          appointment.parent.end <= input[toFilter].end &&
          appointment.topicId === input[toFilter].id
        );
      });

      const beforeSpan = subsequentAppointments.slice(
        0,
        Math.min(toIndex, fromIndex)
      );

      const betweenSpan = subsequentAppointments.slice(
        Math.min(
          toIndex + (fromIndex > toIndex ? toSpan : fromSpan).length,
          fromIndex + (fromIndex < toIndex ? toSpan : fromSpan).length
        ),
        Math.max(toIndex, fromIndex)
      );

      const afterSpan = subsequentAppointments.slice(
        Math.max(
          toIndex + (fromIndex > toIndex ? toSpan : fromSpan).length,
          fromIndex + (fromIndex < toIndex ? toSpan : fromSpan).length
        )
      );

      const newSpan: typeof subsequentAppointments = [];
      beforeSpan.forEach((appointment) => newSpan.push(appointment));
      if (fromIndex < toIndex) {
        betweenSpan.forEach((appointment) => newSpan.push(appointment));
      }
      fromSpan.forEach((appointment) => newSpan.push(appointment));
      toSpan.forEach((appointment) => newSpan.push(appointment));
      if (fromIndex > toIndex) {
        betweenSpan.forEach((appointment) => newSpan.push(appointment));
      }
      afterSpan.forEach((appointment) => newSpan.push(appointment));

      for (let i = 0; i < newSpan.length; i++) {
        const appointment = subsequentAppointments[i];
        const newAppointment = newSpan[i];
        if (!newAppointment || !appointment) return;

        await ctx.prisma.lessonAppointment.update({
          where: {
            id: newAppointment.id,
          },
          data: {
            parent: {
              update: {
                start: appointment.parent.start,
                end: appointment.parent.end,
              },
            },
          },
        });
      }
    }),

  rename: publicProcedure
    .input(
      z.object({
        id: z.string().nullable(),
        name: z.string(),
        scope: renameScopeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const topic = await createOrGetTopicByName(ctx.prisma, input.name);

      await ctx.prisma.lessonAppointment.updateMany({
        where: {
          topicId: input.id,
          parent: {
            start: {
              gte: input.scope.type === "block" ? input.scope.start : undefined,
            },
            end: {
              lte: input.scope.type === "block" ? input.scope.end : undefined,
            },
          },
        },
        data: {
          topicId: topic.id,
        },
      });

      const count = await ctx.prisma.lessonAppointment.count({
        where: {
          topicId: input.id,
        },
      });

      if (count > 0 || input.id === null) return;

      await ctx.prisma.topic.delete({
        where: {
          id: input.id,
        },
      });
    }),

  shorten: publicProcedure
    .input(
      z.object({
        topicId: z.string(),
        start: z.date(),
        end: z.date(),
        amount: z.number().negative(),
        newName: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const changeToNewName = await ctx.prisma.lessonAppointment.findMany({
        where: {
          topicId: input.topicId,
          parent: {
            start: {
              gte: input.start,
            },
            end: {
              lte: input.end,
            },
          },
        },
        orderBy: {
          parent: {
            start: "desc",
          },
        },
        take: input.amount * -1,
      });

      const isEmpty = input.newName === null || input.newName.trim() === "";

      for (let i = 0; i < changeToNewName.length; i++) {
        const appointment = changeToNewName[i]!;
        await ctx.prisma.lessonAppointment.update({
          where: {
            id: appointment.id,
          },
          data: {
            topic: {
              connectOrCreate: isEmpty
                ? undefined
                : {
                    where: {
                      name: input.newName!,
                    },
                    create: {
                      name: input.newName!,
                    },
                  },
              disconnect: isEmpty ? true : undefined,
            },
          },
        });
      }
    }),
});

export const createOrGetTopicByName = async (
  prisma: PrismaClient,
  name: string
): Promise<Topic> => {
  const topic = await prisma.topic.findFirst({
    where: {
      name,
    },
  });

  if (topic) return topic;

  return await prisma.topic.create({
    data: {
      name,
    },
  });
};
