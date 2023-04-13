import { Container, Stack, Text, Title } from "@mantine/core";
import { type NextPage } from "next";
import { Layout } from "~/components/layout/layout";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { openConfirmModal } from "@mantine/modals";
import dayjs from "dayjs";
import React, { useState } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import { SortableTopicCard } from "~/components/appointment/topics/card/sortable";

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
            <React.Fragment key={item.id}>
              <Stack spacing={0}>
                <Text size="sm">{dayjs(item.start).format("DD.MM.YYYY")}</Text>
                <SortableTopicCard item={item} />
              </Stack>
            </React.Fragment>
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
        void utils.topic.overview.invalidate();
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
