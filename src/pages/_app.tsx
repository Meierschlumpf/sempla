import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import Head from "next/head";
import { modals } from "~/components/modals";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
          primaryColor: "indigo",
        }}
      >
        <ModalsProvider
          modals={modals}
          modalProps={{
            closeButtonProps: { "aria-label": "Close modal" },
          }}
        >
          <SessionProvider session={session}>
            <Notifications position="bottom-center" />
            <Component {...pageProps} />
          </SessionProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
