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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
  type SelectItem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useScrollIntoView } from "@mantine/hooks";
import { type Plan } from "@prisma/client";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { SortableTopicCard } from "~/components/appointment/topics/card/sortable";
import { api, type RouterOutputs } from "~/utils/api";

type PlanLastStepFormProps = {
  planId: string;
  nextStep: () => void;
};

type FormType = {
  topicId: string;
  duration: number;
};

export const PlanLastStepForm = ({
  planId,
  nextStep,
}: PlanLastStepFormProps) => {
  const { data: plan } = api.plan.byId.useQuery({ id: planId });
  const { mutateAsync: finishPlanCreation } =
    api.plan.finishCreation.useMutation();
  const router = useRouter();
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLDivElement,
    HTMLDivElement
  >({
    duration: 200,
  });

  const handleFinishPlanCreation = async () => {
    await finishPlanCreation(
      { id: planId },
      {
        onSuccess: () => {
          void router.push(`/plans/${planId}`);
          nextStep();
        },
      }
    );
  };

  return (
    <Stack>
      <Group position="apart">
        <Title order={2} weight={500}>
          Definieren Sie die Themenblöcke.
        </Title>
        <Button
          variant="default"
          onClick={() => void handleFinishPlanCreation()}
        >
          Vorerst überspringen
        </Button>
      </Group>

      <CreateTopicCard planId={planId} scrollIntoView={scrollIntoView} />

      <ScrollArea.Autosize mah="60vh" viewportRef={scrollableRef}>
        {plan && <TopicList plan={plan} />}
        <div ref={targetRef}></div>
      </ScrollArea.Autosize>
      <Group position="right">
        <Button onClick={() => void handleFinishPlanCreation()}>
          Erstellung Abschliessen
        </Button>
      </Group>
    </Stack>
  );
};

type CreateTopicCardProps = {
  planId: string;
  scrollIntoView: ({
    alignment,
  }: {
    alignment?: "start" | "center" | "end" | undefined;
  }) => void;
};

const CreateTopicCard = ({ planId, scrollIntoView }: CreateTopicCardProps) => {
  const utils = api.useContext();
  const { data: topics } = api.topic.all.useQuery();
  const [createdTopic, setCreatedTopic] = useState<SelectItem | null>(null);

  const { data: currentPlanTopics } = api.topic.byPlan.useQuery({ planId });
  const lastNotDefinedTopic = currentPlanTopics?.findLast(
    (topic) => !topic.name
  );

  const notDefinedTopicsCount = lastNotDefinedTopic?.duration ?? 0;
  const { mutateAsync: addToEnd } = api.topic.addToEnd.useMutation();

  const { primaryColor, colors } = useMantineTheme();
  const ref = React.useRef<HTMLInputElement>(null);
  const form = useForm<FormType>();
  const handleSubmit = (values: FormType) => {
    const shouldCreate = values.topicId === "new";

    const input = shouldCreate
      ? {
          name: createdTopic!.label!,
          topicId: null,
        }
      : {
          topicId: values.topicId,
          name: null,
        };

    void addToEnd(
      {
        duration: values.duration,
        start: lastNotDefinedTopic!.start,
        planId,
        ...input,
      },
      {
        onSuccess: () => {
          setCreatedTopic(null);
          void utils.topic.byPlan.invalidate({ planId });
          void utils.topic.all.invalidate();
          form.setValues({
            topicId: null!,
            duration: "" as unknown as number,
          });
          scrollIntoView({ alignment: "start" });

          ref.current?.focus();
        },
      }
    );
  };

  const topicData = [
    createdTopic,
    ...(topics?.map((t) => ({ value: t.id, label: t.name })) ?? []),
  ].filter((t) => t !== null) as SelectItem[];

  if (notDefinedTopicsCount === 0)
    return (
      <Card withBorder>
        <Stack align="center" my="lg">
          <Title order={4} color={colors[primaryColor]![3]}>
            Es wurden alle Themen definiert.
          </Title>
          <Text size="sm">
            Sie können die erstellten Themen anpassen und verschiben und
            anschliessend die Erstellung Abschliessen.
          </Text>
        </Stack>
      </Card>
    );

  return (
    <Card withBorder>
      <Title order={4} color={colors[primaryColor]![3]}>
        Neues Thema hinzufügen
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={8}>
            <Select
              withinPortal
              ref={ref}
              data={topicData}
              limit={10}
              searchable
              label="Name"
              creatable
              getCreateLabel={(value) => `Neues Thema "${value}" erstellen`}
              onCreate={(value) => {
                setCreatedTopic({ value: "new", label: value });
                return { value: "new", label: value };
              }}
              hoverOnSearchChange
              selectOnBlur
              {...form.getInputProps("topicId")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              min={1}
              max={notDefinedTopicsCount}
              label="Dauer"
              hideControls
              {...form.getInputProps("duration")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group position="right">
              <Button type="submit">Hinzufügen</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Card>
  );
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
                <Text size="sm">
                  {dayjs(item.start).format("DD.MM.YYYY")} -{" "}
                  {dayjs(item.end).format("DD.MM.YYYY")}
                </Text>
                <SortableTopicCard item={item} showSubject={false} />
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
  }
};
