import { getSession } from "next-auth/react";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("middleware", req.url);

  const requestForNextAuth = {
    headers: {
      cookie: req.headers.get("cookie"),
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const session = await getSession({ req: requestForNextAuth as any });

  if (session) {
    // validate your session here

    return NextResponse.next();
  } else {
    // the user is not logged in, redirect to the sign-in page
    const signInUrl = new URL("/login", req.nextUrl.origin);
    signInUrl.searchParams.append("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ["/((?!api|static|favicon.ico|_next|login).*)"],
  pages: {
    signIn: "/login",
  },
};
