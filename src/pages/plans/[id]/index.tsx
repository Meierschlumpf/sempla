import {
  ActionIcon,
  Button,
  Center,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { type Plan } from "@prisma/client";
import { IconBooks, IconPhoto, IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import React from "react";
import { z } from "zod";
import { AppointmentCard } from "~/components/appointment/card/main";
import { useOpenCreateAppointmentModal } from "~/components/appointment/create-appointment-modal";
import {
  ManyAppointmentSelectedActions,
  useAppointmentStore,
} from "~/components/appointment/many-appointment-selected-actions";
import { ButtonGroupButton } from "~/components/button/button-group-button";
import { Layout } from "~/components/layout/layout";
import { createSsgHelper } from "~/helpers/createSsgHelper";
import { api } from "~/utils/api";

const Page: NextPage<{ plan: Plan }> = ({ plan }) => {
  const title = "Plan bearbeiten";

  const { primaryColor } = useMantineTheme();
  const openCreateModal = useOpenCreateAppointmentModal({
    planId: plan.id,
  });

  const setAllAppointmentIds = useAppointmentStore(
    (x) => x.setAllAppointmentIds
  );

  const { data: appointments } = api.appointment.byPlan.useQuery(
    { planId: plan.id },
    {
      onSuccess: (data) => {
        setAllAppointmentIds(data.map((x) => x.id));
      },
    }
  );
  const { data: topicCount } = api.topic.countByPlan.useQuery({
    planId: plan.id,
  });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Layout>
        <Container>
          <Title>Termine bearbeiten</Title>
          <Group position="apart" mb="sm">
            <ManyAppointmentSelectedActions />

            <Group>
              <Button.Group>
                <ButtonGroupButton
                  href={`/plans/${plan.id}/topics`}
                  icon={IconPhoto}
                  count={topicCount}
                >
                  Themen
                </ButtonGroupButton>
                <ButtonGroupButton
                  href={`/plans/${plan.id}/materials`}
                  icon={IconBooks}
                  count={0}
                >
                  Materialien
                </ButtonGroupButton>
              </Button.Group>
              <Button onClick={openCreateModal}>Neuer Termin</Button>
            </Group>
          </Group>

          <Stack spacing="xs">
            {appointments?.map((item) => (
              <React.Fragment key={item.id}>
                <Stack spacing={0}>
                  <Text size="sm">
                    {dayjs(item.start).format("DD.MM.YYYY")}
                  </Text>
                  <AppointmentCard item={item} mode="edit" />
                </Stack>

                {true ? (
                  <Center>
                    <Tooltip label="Termin hinzufügen" position="right">
                      <ActionIcon
                        radius="xl"
                        variant="light"
                        color={primaryColor}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Center>
                ) : null}
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
  id: z.string().cuid(),
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

  const plan = await ssg.plan.byId.fetch(result.data);

  if (!plan) {
    return {
      notFound: true,
    };
  }

  await ssg.appointment.byPlan.prefetch({ planId: plan.id });
  await ssg.topic.countByPlan.prefetch({ planId: plan.id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      plan,
    },
  };
};
