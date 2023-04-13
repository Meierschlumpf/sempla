import {
  ActionIcon,
  Card,
  Container,
  Group,
  Menu,
  Stack,
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
import { type NextPage } from "next";
import { Layout } from "~/components/layout/layout";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useOpenUpdateTopicModal } from "~/components/appointment/topics/update-topic-modal";
import { type RouterOutputs, api } from "~/utils/api";
import { openConfirmModal } from "@mantine/modals";

const SortableTopicItem = (
  item: RouterOutputs["topic"]["overview"][number]
) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const { colors } = useMantineTheme();
  const openUpdateModal = useOpenUpdateTopicModal({
    ...item,
    planId: "",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card withBorder ref={setNodeRef} style={style}>
      <Group position="apart">
        <Group>
          <IconGripVertical
            {...attributes}
            {...listeners}
            color={colors.gray[6]}
          />

          <ThemeIcon variant="light">
            <IconMath />
          </ThemeIcon>
          <Title order={4} weight={500}>
            {item.name}
          </Title>
        </Group>
        <Group>
          <Text color="dimmed">{item.duration} Wochen</Text>
          <Menu withinPortal>
            <Menu.Target>
              <ActionIcon>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconPencil size={16} />}
                onClick={openUpdateModal}
              >
                Umbenennen
              </Menu.Item>
              <Menu.Item icon={<IconClockPlus size={16} />}>
                Thema verlängern
              </Menu.Item>
              <Menu.Item icon={<IconClockMinus size={16} />}>
                Thema verkürzen
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Card>
  );
};

const TopicList = () => {
  const utils = api.useContext();
  const [topics, setTopics] = useState<RouterOutputs["topic"]["overview"]>([]);
  const { mutateAsync: moveTopicsAsync } = api.topic.move.useMutation();
  api.topic.overview.useQuery(undefined, {
    onSuccess(data) {
      setTopics(data);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={topics} strategy={verticalListSortingStrategy}>
        <Stack spacing="xs">
          {topics.map((item) => (
            <SortableTopicItem key={item.id} {...item} />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    const activeValue = topics.find((item) => item.id === active.id);
    const overValue = topics.find((item) => item.id === over.id);

    console.log(activeValue);
    console.log(overValue);

    if (!activeValue || !overValue) return;

    setTopics((topics) => {
      const oldIndex = topics.findIndex((item) => item.id === active.id);
      const newIndex = topics.findIndex((item) => item.id === over.id);
      return arrayMove(topics, oldIndex, newIndex);
    });

    openConfirmModal({
      title: <Title order={4}>Thema verschieben</Title>,
      children: (
        <Text size="sm">Möchtest du das Thema wirklich verschieben?</Text>
      ),
      labels: {
        confirm: "Verschieben",
        cancel: "Abbrechen",
      },
      confirmProps: {
        color: "red",
      },
      onCancel: () => {
        setTopics((topics) => {
          const oldIndex = topics.findIndex((item) => item.id === active.id);
          const newIndex = topics.findIndex((item) => item.id === over.id);

          return arrayMove(topics, oldIndex, newIndex);
        });
      },
      onConfirm: () => {
        void moveTopicsAsync(
          {
            from: {
              id: activeValue.topicId,
              start: activeValue.start,
              end: activeValue.end,
            },
            to: {
              id: overValue.topicId,
              start: overValue.start,
              end: overValue.end,
            },
          },
          {
            onSuccess: () => {
              void utils.topic.overview.invalidate();
            },
          }
        );
        setTopics((topics) => {
          const activeIndex = topics.findIndex((item) => item.id === active.id);
          const activeValue = topics[activeIndex];

          if (activeValue) {
            const nextValue = topics[activeIndex + 1];
            const prevValue = topics[activeIndex - 1];

            if (nextValue && activeValue.topicId === nextValue.topicId) {
              nextValue.duration += activeValue.duration;
              return topics.filter((item) => item.id !== active.id);
            } else if (prevValue && activeValue.topicId === prevValue.topicId) {
              prevValue.duration += activeValue.duration;
              return topics.filter((item) => item.id !== active.id);
            }
          }

          const overIndex = topics.findIndex((item) => item.id === over.id);
          const overValue = topics[overIndex];

          if (!overValue) return topics;

          const nextValue = topics[overIndex + 1];
          const prevValue = topics[overIndex - 1];

          if (nextValue && overValue.topicId === nextValue.topicId) {
            nextValue.duration += overValue.duration;
            return topics.filter((item) => item.id !== over.id);
          } else if (prevValue && overValue.topicId === prevValue.topicId) {
            prevValue.duration += overValue.duration;
            return topics.filter((item) => item.id !== over.id);
          }

          return topics;
        });
      },
    });
  }
};

const Page: NextPage = () => {
  return (
    <Layout>
      <Container>
        <Title>Themen</Title>

        <TopicList />
      </Container>
    </Layout>
  );
};

export default Page;
