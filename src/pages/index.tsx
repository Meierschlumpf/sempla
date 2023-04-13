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
import { IconBooks, IconPhoto, IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { type NextPage } from "next";
import React from "react";
import { AppointmentCard } from "~/components/appointment/card/main";
import { useOpenCreateAppointmentModal } from "~/components/appointment/create-appointment-modal";
import {
  ManyAppointmentSelectedActions,
  useAppointmentStore,
} from "~/components/appointment/many-appointment-selected-actions";
import { ButtonGroupButton } from "~/components/button/button-group-button";
import { Layout } from "~/components/layout/layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { primaryColor } = useMantineTheme();
  const openCreateModal = useOpenCreateAppointmentModal();

  const setAllAppointmentIds = useAppointmentStore(
    (x) => x.setAllAppointmentIds
  );

  const { data: appointments } = api.appointment.all.useQuery(undefined, {
    onSuccess: (data) => {
      setAllAppointmentIds(data.map((x) => x.id));
    },
  });

  return (
    <Layout>
      <Container>
        <Title>Termine</Title>
        <Group position="apart" mb="sm">
          <ManyAppointmentSelectedActions />

          <Group>
            <Button.Group>
              <ButtonGroupButton icon={IconPhoto} count={0}>
                Themen
              </ButtonGroupButton>
              <ButtonGroupButton icon={IconBooks} count={0}>
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
                <Text size="sm">{dayjs(item.start).format("DD.MM.YYYY")}</Text>
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
  );
};

export default Home;
