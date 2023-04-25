import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

type SupportedGraphApiImageSizes =
  | 48
  | 64
  | 96
  | 120
  | 240
  | 360
  | 432
  | 504
  | 648;

const getGraphApiProfileImage = (
  accessToken: string,
  size: SupportedGraphApiImageSizes = 64
) =>
  new Promise<string | null>((resolve, reject) => {
    fetch(`https://graph.microsoft.com/v1.0/me/photos/${size}x${size}/$value`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) resolve(null);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const imagePrefix = "data:image/png;base64,";
        const buffer = Buffer.from(arrayBuffer);
        resolve(imagePrefix + buffer.toString("base64"));
      })
      .catch((err) => reject(err));
  });

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
  byId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        size: z
          .union([z.literal("sm"), z.literal("md"), z.literal("lg"), z.null()])
          .default(null),
      })
    )
    .query(async ({ ctx, input }) => {
      const [user, image] = await ctx.prisma.$transaction([
        ctx.prisma.user.findFirst({
          where: { id: input.id },
        }),
        ctx.prisma.profileImage.findFirst({
          where: { userId: input.id, size: input.size ?? "sm" },
        }),
      ]);
      return {
        ...user,
        image: image?.url ?? null,
      };
    }),
  syncProfileImage: protectedProcedure.mutation(async ({ ctx }) => {
    const account = await ctx.prisma.account.findFirst({
      where: { userId: ctx.session.user.id },
      select: { access_token: true },
    });

    if (!account?.access_token) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Account not found",
      });
    }

    const sizes = [48, 96, 240, 360] as const;

    const access_token = account.access_token;
    const data = await Promise.all(
      sizes.map((size) => getGraphApiProfileImage(access_token, size))
    );

    await ctx.prisma.profileImage.deleteMany({
      where: { userId: ctx.session.user.id },
    });

    const getHighestSize = (index: number): string => {
      const item = data[index];
      if (!!item) return item;
      if (index === 0) return "";
      return getHighestSize(index - 1);
    };

    await ctx.prisma.$transaction([
      ctx.prisma.profileImage.create({
        data: {
          size: "sm",
          url: getHighestSize(0),
          userId: ctx.session.user.id,
        },
      }),
      ctx.prisma.profileImage.create({
        data: {
          size: "md",
          url: getHighestSize(1),
          userId: ctx.session.user.id,
        },
      }),
      ctx.prisma.profileImage.create({
        data: {
          size: "lg",
          url: getHighestSize(3),
          userId: ctx.session.user.id,
        },
      }),
      ctx.prisma.profileImage.deleteMany({
        where: { url: "" },
      }),
    ]);
  }),
});
