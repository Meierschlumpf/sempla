import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession as nextAuthGetServerSession } from "next-auth";

import { authOptions } from "./auth-options";

export const getServerSession = async (
  ctx:
    | {
        req: GetServerSidePropsContext["req"];
        res: GetServerSidePropsContext["res"];
      }
    | { req: NextApiRequest; res: NextApiResponse }
) => {
  return await nextAuthGetServerSession(ctx.req, ctx.res, authOptions);
};
