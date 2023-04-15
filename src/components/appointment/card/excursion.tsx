import {
  ActionIcon,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconDots,
  IconMapPin,
  IconPencil,
  IconPin,
  IconPinnedOff,
  IconTrash,
  IconTrekking,
} from "@tabler/icons-react";
import { generateTimeRange } from "~/helpers/time";
import { AppointmentCheckbox } from "./content/checkbox";
import { type AppointmentWithType } from "./type";

interface AppointmentExcursionCardProps {
  item: AppointmentWithType<"excursion">;
  mode: "edit" | "display";
}

export const AppointmentExcursionCard = ({
  item,
  mode,
}: AppointmentExcursionCardProps) => {
  const { colors, primaryColor } = useMantineTheme();

  return (
    <Card bg={colors.blue[1]}>
      <Group position="apart">
        <Group>
          {mode === "edit" ? (
            <AppointmentCheckbox id={item.id} />
          ) : (
            <ThemeIcon color="transparent">
              <IconTrekking color={colors[primaryColor]?.[6]} size={24} />
            </ThemeIcon>
          )}
          <Stack spacing={0}>
            <Title order={4} weight={500}>
              {item.data.name}
            </Title>
            <Group spacing={4}>
              <Tooltip label="Ort">
                <IconMapPin size={16} color={colors.dark[3]} />
              </Tooltip>
              <Text size="sm" color={colors.dark[3]}>
                {item.data.location}
              </Text>
            </Group>
          </Stack>
        </Group>
        <Group spacing={4}>
          {mode === "edit" ? (
            <ExcursionMenu />
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

const ExcursionMenu = () => {
  return (
    <>
      <Button
        size="xs"
        variant="subtle"
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
    </>
  );
};
