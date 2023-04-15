import { Container, Stack, Text, Title } from "@mantine/core";
import { type Area } from "@prisma/client";
import dayjs from "dayjs";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import React from "react";
import { z } from "zod";
import { AppointmentCard } from "~/components/appointment/card/main";
import { Layout } from "~/components/layout/layout";
import { createSsgHelper } from "~/helpers/createSsgHelper";
import { api } from "~/utils/api";

const Page: NextPage<{ area: Area }> = ({ area }) => {
  const title = `Termine ${area.name}`;

  const { data: appointments } = api.appointment.byArea.useQuery({
    areaId: area.id,
  });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Layout>
        <Container>
          <Title>{title}</Title>
          <Stack spacing="xs">
            {appointments?.map((item) => (
              <React.Fragment key={item.id}>
                <Stack spacing={0}>
                  <Text size="sm">
                    {dayjs(item.start).format("DD.MM.YYYY")}
                  </Text>
                  <AppointmentCard
                    item={item}
                    mode="display"
                    showSubject={true}
                  />
                </Stack>
              </React.Fragment>
            ))}
          </Stack>
        </Container>
      </Layout>
    </>
  );
};

export default Page;

const querySchema = z.object({
  areaSlug: z.string(),
});

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const result = querySchema.safeParse(context.query);

  if (!result.success) {
    return {
      notFound: true,
    };
  }

  const ssg = await createSsgHelper(context);

  const area = await ssg.area.bySlug.fetch({
    slug: result.data.areaSlug,
  });

  if (!area) {
    return {
      notFound: true,
    };
  }

  await ssg.appointment.byArea.prefetch({
    areaId: area.id,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      area,
    },
  };
};
