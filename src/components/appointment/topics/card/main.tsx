import { type DraggableAttributes } from "@dnd-kit/core";
import { type SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  ActionIcon,
  Card,
  Group,
  Menu,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconClockMinus,
  IconClockPlus,
  IconDots,
  IconGripVertical,
  IconMath,
  IconPencil,
} from "@tabler/icons-react";
import { type RouterOutputs } from "~/utils/api";
import { useOpenRenameTopicModal } from "../rename-topic-modal";
import { useOpenShortenTopicModal } from "../shorten-topic-modal";

type TopicCardProps = {
  item: RouterOutputs["topic"]["byPlan"][number];
  showSubject?: boolean;
} & (
  | {
      mode: "display";
    }
  | {
      mode: "edit";
      setNodeRef: (node: HTMLElement | null) => void;
      style: React.CSSProperties;
      attributes: DraggableAttributes;
      listeners: SyntheticListenerMap | undefined;
    }
);

export const TopicCard = ({ item, showSubject, ...props }: TopicCardProps) => {
  const { colors } = useMantineTheme();

  const cardProps =
    props.mode === "edit"
      ? {
          ref: props.setNodeRef,
          style: props.style,
        }
      : {};

  const handleProps =
    props.mode === "edit"
      ? {
          ...props.attributes,
          ...props.listeners,
        }
      : {};

  return (
    <Card withBorder {...cardProps}>
      <Group position="apart">
        <Group>
          {props.mode === "edit" && (
            <IconGripVertical {...handleProps} color={colors.gray[6]} />
          )}

          {showSubject && (
            <ThemeIcon variant="light">
              <IconMath />
            </ThemeIcon>
          )}
          <Title order={4} weight={500}>
            {item.name}
          </Title>
        </Group>
        <Group>
          <Text color="dimmed">{item.duration} Unterrichtseinheiten</Text>
          {props.mode === "edit" && <EditMenu item={item} />}
        </Group>
      </Group>
    </Card>
  );
};

type EditMenuProps = {
  item: RouterOutputs["topic"]["byPlan"][number];
};

const EditMenu = ({ item }: EditMenuProps) => {
  const isShortenDisabled = item.topicId === null || item.duration === 1;

  const openUpdateModal = useOpenRenameTopicModal({
    ...item,
    planId: "",
  });

  const openShortenTopicModal = useOpenShortenTopicModal({
    ...item,
    topicId: item.topicId!,
    name: item.name!,
  });

  return (
    <Menu withinPortal>
      <Menu.Target>
        <ActionIcon>
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconPencil size={16} />} onClick={openUpdateModal}>
          Umbenennen
        </Menu.Item>
        <Menu.Item
          icon={<IconClockPlus size={16} />}
          disabled={item.topicId === null}
        >
          Thema verlängern
        </Menu.Item>
        <Menu.Item
          icon={<IconClockMinus size={16} />}
          disabled={isShortenDisabled}
          onClick={() => {
            if (isShortenDisabled) return;

            openShortenTopicModal();
          }}
        >
          Thema verkürzen
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
