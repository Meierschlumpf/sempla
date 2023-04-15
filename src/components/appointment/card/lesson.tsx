import {
  useMantineTheme,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
  ThemeIcon,
  ActionIcon,
  Button,
  Menu,
} from "@mantine/core";
import {
  IconAddressBook,
  IconHome,
  IconChecklist,
  IconMath,
  IconDots,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconTrash,
  IconClock,
} from "@tabler/icons-react";
import { generateTimeRange } from "~/helpers/time";
import { type AppointmentWithType } from "./type";
import { AppointmentCheckbox } from "./content/checkbox";

interface AppointmentLessonCardProps {
  item: AppointmentWithType<"lesson">;
  mode: "edit" | "display";
  showSubject: boolean;
}

export const AppointmentLessonCard = ({
  item,
  mode,
  showSubject,
}: AppointmentLessonCardProps) => {
  const { colors } = useMantineTheme();

  return (
    <Card>
      <Group position="apart">
        <Group>
          {mode === "edit" ? (
            <AppointmentCheckbox id={item.id} />
          ) : showSubject ? (
            <LessonIcon />
          ) : null}

          <Stack spacing={0}>
            <Title order={4} weight={500}>
              {showSubject ? item.data.subject.name : item.data.topic.name}
            </Title>
            {showSubject ? (
              <Group spacing={4}>
                <Tooltip label="Thema">
                  <IconAddressBook size={16} color={colors.dark[3]} />
                </Tooltip>
                <Text size="sm" color={colors.dark[3]}>
                  {item.data.topic.name}
                </Text>
              </Group>
            ) : mode === "edit" ? (
              <Group spacing={4}>
                <Tooltip label="Zeit">
                  <IconClock size={16} color={colors.dark[3]} />
                </Tooltip>
                <Text size="sm" color={colors.dark[3]}>
                  {generateTimeRange(item.start, item.end)}
                </Text>
              </Group>
            ) : null}
          </Stack>
          <Stack spacing={0} ml="xl">
            <Title order={5} weight={400}>
              Hausaufgaben und Aufträge
            </Title>
            <Group>
              <UnstyledButton>
                <Group spacing={4}>
                  <Tooltip label="Hausaufgaben">
                    <IconHome size={16} color={colors.dark[3]} />
                  </Tooltip>
                  <Text size="sm" color={colors.dark[3]}>
                    0 offen
                  </Text>
                </Group>
              </UnstyledButton>
              <UnstyledButton>
                <Group spacing={4}>
                  <Tooltip label="Aufträge">
                    <IconChecklist size={16} color={colors.dark[3]} />
                  </Tooltip>
                  <Text size="sm" color={colors.dark[3]}>
                    0 offen
                  </Text>
                </Group>
              </UnstyledButton>
            </Group>
          </Stack>
        </Group>
        <Group>
          {mode === "edit" ? (
            <LessonMenu />
          ) : (
            <Text size="sm" weight={500}>
              {generateTimeRange(item.start, item.end)}
            </Text>
          )}
        </Group>
      </Group>
    </Card>
  );
};

const LessonIcon = () => {
  return (
    <ThemeIcon variant="light">
      <IconMath />
    </ThemeIcon>
  );
};

const LessonMenu = () => {
  return (
    <Group spacing={4}>
      <Button
        size="xs"
        variant="light"
        px="sm"
        leftIcon={<IconPencil size={16} />}
      >
        Bearbeiten
      </Button>
      <Menu withinPortal position="bottom-end">
        <Menu.Target>
          <ActionIcon radius="md">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => []}
            rightSection={
              false ? (
                <IconPinnedOff style={{ marginLeft: 8 }} size={16} />
              ) : (
                <IconPin style={{ marginLeft: 8 }} size={16} />
              )
            }
          >
            Termin anpinnen
          </Menu.Item>
          <Menu.Item
            onClick={() => []}
            rightSection={<IconTrash style={{ marginLeft: 8 }} size={16} />}
            color="red"
          >
            Termin entfernen
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};
