import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
              id: z.string(),
              name: z.string(),
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

    return appointments.map((appointment) => {
      if (appointment.type === "lesson") {
        return {
          id: appointment.id,
          type: appointment.type,
          start: appointment.start,
          end: appointment.end,
          data: {
            subject: {
              id: appointment.lessonAppointment!.subject.id,
              name: appointment.lessonAppointment!.subject.name,
            },
            topic: {
              id: appointment.lessonAppointment!.topic.id,
              name: appointment.lessonAppointment!.topic.name,
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
  }),
  create: publicProcedure
    .input(
      z
        .object({
          start: z.date(),
          end: z.date(),
        })
        .and(
          z
            .object({
              type: z.literal("lesson"),
              subjectId: z.string(),
              topicId: z.string(),
            })
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
      const appointment = await ctx.prisma.appointment.create({
        data: {
          type: input.type,
          start: input.start,
          end: input.end,
        },
      });

      if (input.type === "lesson") {
        await ctx.prisma.lessonAppointment.create({
          include: {
            topic: true,
          },
          data: {
            id: appointment.id,
            subjectId: input.subjectId,
            topicId: input.topicId,
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
