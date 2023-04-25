import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  TokenSet,
} from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

/**
 * @see https://github.com/nextauthjs/next-auth/issues/5376
 */

export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      }

      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: "azure-ad",
        },
      });

      if (!account) {
        return session;
      }

      if ((account.expires_at ?? 0) * 1000 < Date.now()) {
        try {
          const response = await fetch(
            `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
            {
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: env.AZURE_AD_CLIENT_ID,
                client_secret: env.AZURE_AD_CLIENT_SECRET,
                scope:
                  "openid email profile offline_access User.ReadWrite Calendars.ReadWrite",
                grant_type: "refresh_token",
                refresh_token: account.refresh_token!,
              }),
              method: "POST",
            }
          );

          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          await prisma.account.update({
            data: {
              access_token: tokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
              refresh_token: tokens.refresh_token ?? account.refresh_token,
            },
            where: {
              provider_providerAccountId: {
                provider: "azure-ad",
                providerAccountId: account.providerAccountId,
              },
            },
          });
        } catch (error) {
          console.error("Error refreshing access token", error);
        }
      }

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope:
            "openid email profile offline_access User.ReadWrite Calendars.ReadWrite",
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  events: {
    async signOut({ session, token }) {
      console.log("signout", session, token);
      if (session?.userId) {
        await prisma.account.updateMany({
          where: {
            userId: session.userId,
          },
          data: {
            access_token: null,
            refresh_token: null,
          },
        });
      }
    },
    signIn: async ({ account, user }) => {
      const dbAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: "azure-ad",
        },
      });

      if (dbAccount == null || !account) {
        return;
      }

      await prisma.account.update({
        where: {
          id: dbAccount.id,
        },
        data: {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
        },
      });
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
