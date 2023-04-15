import superjson from "superjson";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import {
  type GetServerSidePropsContext,
  type NextApiRequest,
  type NextApiResponse,
} from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export const createSsgHelper = async (context: GetServerSidePropsContext) =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: context.req as unknown as NextApiRequest,
      res: context.res as unknown as NextApiResponse,
    }),
    transformer: superjson,
  });
