import {
  type Appointment,
  type LessonAppointment,
  type Subject,
  type Topic,
  type ExcursionAppointment,
  type EventAppointment,
} from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createOrGetTopicByName } from "./topics";
import { TRPCError } from "@trpc/server";

const allOutputSchema = z.array(
  z
    .object({
      id: z.string(),
      start: z.date(),
      end: z.date(),
    })
    .and(
      z
        .object({
          type: z.literal("lesson"),
          data: z.object({
            subject: z.object({
              id: z.string(),
              name: z.string(),
            }),
            topic: z.object({
              id: z.string().nullable(),
              name: z.string().nullable(),
            }),
          }),
        })
        .or(
          z.object({
            type: z.literal("event"),
            data: z.object({
              name: z.string(),
              description: z.string(),
            }),
          })
        )
        .or(
          z.object({
            type: z.literal("excursion"),
            data: z.object({
              name: z.string(),
              description: z.string(),
              location: z.string(),
            }),
          })
        )
    )
);

type AppointmentMappingOutput = z.infer<typeof allOutputSchema>;

export const appointmentsRouter = createTRPCRouter({
  all: publicProcedure.output(allOutputSchema).query(async ({ ctx }) => {
    const appointments = await ctx.prisma.appointment.findMany({
      orderBy: {
        start: "asc",
      },
      include: {
        lessonAppointment: {
          include: {
            subject: true,
            topic: true,
          },
        },
        eventAppointment: true,
        excursionAppointment: true,
      },
    });

    return mapAppointments(appointments);
  }),
  byPlan: publicProcedure
    .input(z.object({ planId: z.string() }))
    .output(allOutputSchema)
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.prisma.appointment.findMany({
        orderBy: {
          start: "asc",
        },
        include: {
          lessonAppointment: {
            include: {
              subject: true,
              topic: true,
            },
          },
          eventAppointment: true,
          excursionAppointment: true,
        },
        where: {
          planId: input.planId,
        },
      });

      return mapAppointments(appointments);
    }),
  bySubjectAndArea: publicProcedure
    .input(
      z.object({
        subjectId: z.string(),
        areaId: z.string(),
      })
    )
    .output(allOutputSchema)
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.prisma.appointment.findMany({
        orderBy: {
          start: "asc",
        },
        include: {
          plan: true,
          lessonAppointment: {
            include: {
              subject: true,
              topic: true,
            },
          },
          eventAppointment: true,
          excursionAppointment: true,
        },
        where: {
          lessonAppointment: {
            subjectId: input.subjectId,
          },
          plan: {
            areaId: input.areaId,
          },
        },
      });

      return mapAppointments(appointments);
    }),
  byArea: publicProcedure
    .input(
      z.object({
        areaId: z.string(),
      })
    )
    .output(allOutputSchema)
    .query(async ({ ctx, input }) => {
      const appointments = await ctx.prisma.appointment.findMany({
        orderBy: {
          start: "asc",
        },
        include: {
          plan: true,
          lessonAppointment: {
            include: {
              subject: true,
              topic: true,
            },
          },
          eventAppointment: true,
          excursionAppointment: true,
        },
        where: {
          plan: {
            areaId: input.areaId,
          },
        },
      });

      return mapAppointments(appointments);
    }),
  create: publicProcedure
    .input(
      z
        .object({
          start: z.date(),
          end: z.date(),
          planId: z.string(),
        })
        .and(
          z
            .object({
              type: z.literal("lesson"),
            })
            .and(
              z
                .object({
                  topicId: z.string(),
                  topicName: z.null(),
                })
                .or(
                  z.object({
                    topicId: z.null(),
                    topicName: z.string(),
                  })
                )
            )
            .or(
              z.object({
                type: z.literal("event"),
                name: z.string(),
                description: z.string(),
              })
            )
            .or(
              z.object({
                type: z.literal("excursion"),
                name: z.string(),
                description: z.string(),
                location: z.string(),
              })
            )
        )
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
          message: "Plan not found",
        });
      }

      const appointment = await ctx.prisma.appointment.create({
        data: {
          type: input.type,
          start: input.start,
          end: input.end,
          planId: input.planId,
        },
      });

      if (input.type === "lesson") {
        let topicId = input.topicId;
        if (!input.topicId && input.topicName) {
          const topic = await createOrGetTopicByName(
            ctx.prisma,
            input.topicName
          );
          topicId = topic.id;
        }

        await ctx.prisma.lessonAppointment.create({
          include: {
            topic: true,
            subject: true,
          },
          data: {
            id: appointment.id,
            topicId: topicId,
            subjectId: plan.subjectId,
          },
        });
        return;
      }

      if (input.type === "event") {
        await ctx.prisma.eventAppointment.create({
          data: {
            id: appointment.id,
            name: input.name,
            description: input.description,
          },
        });
        return;
      }

      if (input.type === "excursion") {
        await ctx.prisma.excursionAppointment.create({
          data: {
            id: appointment.id,
            name: input.name,
            description: input.description,
            location: input.location,
          },
        });
        return;
      }
    }),
});

const mapAppointments = (
  appointments: (Appointment & {
    lessonAppointment:
      | (LessonAppointment & {
          subject: Subject;
          topic: Topic | null;
        })
      | null;
    excursionAppointment: ExcursionAppointment | null;
    eventAppointment: EventAppointment | null;
  })[]
): AppointmentMappingOutput => {
  return appointments.map((appointment) => {
    if (appointment.type === "lesson") {
      return {
        id: appointment.id,
        type: "lesson",
        start: appointment.start,
        end: appointment.end,
        data: {
          subject: {
            id: appointment.lessonAppointment!.subject.id,
            name: appointment.lessonAppointment!.subject.name,
          },
          topic: {
            id: appointment.lessonAppointment!.topic?.id ?? null,
            name: appointment.lessonAppointment!.topic?.name ?? null,
          },
        },
      };
    }

    if (appointment.type === "event") {
      return {
        id: appointment.id,
        type: "event",
        start: appointment.start,
        end: appointment.end,
        data: {
          name: appointment.eventAppointment!.name,
          description: appointment.eventAppointment!.description,
        },
      };
    }

    return {
      id: appointment.id,
      type: "excursion",
      start: appointment.start,
      end: appointment.end,
      data: {
        name: appointment.excursionAppointment!.name,
        description: appointment.excursionAppointment!.description,
        location: appointment.excursionAppointment!.location,
      },
    };
  });
};
