import { Container, Stack, Text, Title } from "@mantine/core";
import { type GetServerSidePropsContext, type NextPage } from "next";
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
import { type Plan } from "@prisma/client";
import dayjs from "dayjs";
import React, { useState } from "react";
import { z } from "zod";
import { SortableTopicCard } from "~/components/appointment/topics/card/sortable";
import { createSsgHelper } from "~/helpers/createSsgHelper";
import { api, type RouterOutputs } from "~/utils/api";

const Page: NextPage<{ plan: Plan }> = ({ plan }) => {
  return (
    <Layout>
      <Container>
        <Title>Themen</Title>

        <TopicList plan={plan} />
      </Container>
    </Layout>
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

  await ssg.topic.byPlan.prefetch({ planId: plan.id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      plan,
    },
  };
};

type TopicListProps = {
  plan: Plan;
};

const TopicList = ({ plan }: TopicListProps) => {
  const utils = api.useContext();
  const { mutateAsync: moveTopicsAsync } = api.topic.move.useMutation();

  const { data } = api.topic.byPlan.useQuery(
    { planId: plan.id },
    {
      onSuccess(data) {
        setTopics(data);
      },
    }
  );

  // Because the data is loaded on the server, we can use it directly but when a change appears we update the state with setTopics in the onSuccess callback.
  const [topics, setTopics] = useState<RouterOutputs["topic"]["byPlan"]>(
    data ?? []
  );

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
          {topics?.map((item) => (
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
        void utils.topic.byPlan.invalidate();
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
              void utils.topic.byPlan.invalidate();
            },
          }
        );
      },
    });
  }
};
