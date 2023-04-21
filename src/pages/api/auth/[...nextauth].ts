import NextAuth from "next-auth";
import { authOptions } from "~/server/auth/auth-options";

export default NextAuth(authOptions);
