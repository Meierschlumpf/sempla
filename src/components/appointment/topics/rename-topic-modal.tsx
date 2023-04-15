import {
  Button,
  Grid,
  Group,
  HoverCard,
  Menu,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { type ContextModalProps } from "@mantine/modals";
import {
  IconCheck,
  IconChevronDown,
  IconFile,
  IconFiles,
  IconInfoCircle,
  IconSquare,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { openContextModal } from "~/components/modals";
import { api } from "~/utils/api";

type ModalInnerProps = {
  topicId: string | null;
  name: string | null;
  start: Date;
  end: Date;
  planId: string;
};

type FormType = {
  name: string;
};

export const RenameTopicModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<ModalInnerProps>) => {
  const [scope, setScope] = useState<OptionsValue>(options[0].value);
  const utils = api.useContext();
  const { mutateAsync } = api.topic.rename.useMutation();
  const form = useForm<FormType>({
    validateInputOnChange: true,
    initialValues: {
      name: innerProps.name ?? "",
    },
    validate: undefined, // TODO: add validation with zod
  });

  const handleSubmit = async (values: FormType) => {
    await mutateAsync({
      id: innerProps.topicId,
      name: values.name,
      scope: {
        type: scope,
        planId: innerProps.planId,
        start: innerProps.start,
        end: innerProps.end,
      },
    });
    await utils.topic.byPlan.invalidate();
    context.closeModal(id);
  };

  return (
    <form onSubmit={form.onSubmit((v: FormType) => void handleSubmit(v))}>
      <Grid>
        <Grid.Col>
          <TextInput
            data-autoFocus
            required
            label="Name"
            {...form.getInputProps("name")}
          />
        </Grid.Col>
        <Grid.Col>
          <Group position="right">
            <Button
              variant="outline"
              color="gray"
              onClick={() => context.closeModal(id)}
            >
              Abbrechen
            </Button>
            <SubmitSelectionButton selected={scope} setSelected={setScope} />
          </Group>
        </Grid.Col>
      </Grid>
    </form>
  );
};

export const useOpenRenameTopicModal = (props: ModalInnerProps) => {
  return () => {
    openContextModal({
      modal: "renameTopic",
      innerProps: props,
      title: <Title order={4}>Thema umbenennen</Title>,
      size: "md",
    });
  };
};

const SubmitSelectionButton = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (value: OptionsValue) => void;
}) => {
  const { colors } = useMantineTheme();

  const selectedItem = options.find((o) => o.value === selected) ?? options[0];

  return (
    <Button.Group>
      <HoverCard withArrow withinPortal shadow="md" openDelay={250}>
        <HoverCard.Target>
          <Button leftIcon={<selectedItem.icon size={16} />} type="submit">
            Thema umbenennen
          </Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm" weight={500}>
            {selectedItem.label}
          </Text>
          <Group spacing={4}>
            <IconInfoCircle color={colors.gray[6]} size={12} stroke={1.5} />
            <Text size="xs" color="dimmed">
              Die Änderungsart kann über das Dropdown geändert werden.
            </Text>
          </Group>
        </HoverCard.Dropdown>
      </HoverCard>

      <Menu
        transitionProps={{ transition: "pop" }}
        position="bottom-end"
        withinPortal
      >
        <Menu.Target>
          <Button px="xs" ml={1} variant="filled">
            <IconChevronDown size="1rem" stroke={1.5} />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {options.map((option, index) => (
            <React.Fragment key={option.value}>
              {index > 0 && <Menu.Divider />}
              <Menu.Item
                icon={<option.icon size={16} stroke={1.5} />}
                rightSection={
                  selected === option.value ? (
                    <IconCheck size={16} stroke={1.5} />
                  ) : null
                }
                maw={400}
                onClick={() => setSelected(option.value)}
              >
                <Stack spacing={0}>
                  <Text>{option.label}</Text>
                  <Text size="xs" color="dimmed">
                    {option.description}
                  </Text>
                </Stack>
              </Menu.Item>
            </React.Fragment>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Button.Group>
  );
};

const options = [
  {
    label: "Im Block ändern",
    description: "Nur das Thema von diesem Block wird angepasst.",
    icon: IconSquare,
    value: "block",
  },
  {
    label: "Im Plan ändern",
    description:
      "Alle Blöcke welche in diesem Semesterplan vorhanden sind werden angepasst.",
    icon: IconFile,
    value: "plan",
  },
  {
    label: "In aktuellen Plänen ändern",
    description:
      "Es werden alle Themen mit dem gleichen Namen in deinen aktuellen Plänen angepasst.",
    icon: IconFiles,
    value: "all",
  },
] as const;

type OptionsValue = typeof options[number]["value"];
