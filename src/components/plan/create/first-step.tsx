import {
  ActionIcon,
  Anchor,
  Button,
  Divider,
  Grid,
  Group,
  Select,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconTrash } from "@tabler/icons-react";
import { getSchoolDaySelectionData } from "~/constants/schoolDays";
import {
  minutesFromMidnightToTimeString,
  timeStringToMinutesFromMidnight,
} from "~/helpers/time";
import { api } from "~/utils/api";

type PlanFirstStepFormProps = {
  nextSteep: () => void;
  planId: string | null;
  setPlanId: (planId: string | null) => void;
};

type FormType = {
  timeSpanId: string;
  areaId: string;
  classId: string;
  subjectId: string;
  lessons: {
    key: string;
    id: string | null;
    weekDay: string;
    startTime: string;
    endTime: string;
  }[];
};

export const PlanFirstStepForm = ({
  nextSteep,
  planId,
  setPlanId,
}: PlanFirstStepFormProps) => {
  const { mutateAsync: createPlan } = api.plan.create.useMutation();
  const { mutateAsync: updatePlan } = api.plan.update.useMutation();
  const { mutateAsync: removePlan } = api.plan.remove.useMutation();
  const { data: timeSpans } = api.timeSpan.all.useQuery();
  const { data: areas } = api.area.me.useQuery();
  const { data: currentPlan } = api.plan.byId.useQuery(
    {
      id: planId ?? "",
    },
    {
      enabled: !!planId,
      onSuccess: (data) => {
        if (!data) {
          setPlanId(null);
          form.reset();
          return;
        }
      },
    }
  );
  const form = useForm<FormType>({
    initialValues: {
      timeSpanId: currentPlan?.timeSpanId ?? null!,
      areaId: currentPlan?.areaId ?? null!,
      classId: currentPlan?.classId ?? null!,
      subjectId: currentPlan?.subjectId ?? null!,
      lessons:
        !currentPlan || currentPlan?.lessons.length === 0
          ? [
              {
                key: randomId(),
                id: null,
                weekDay: null!,
                startTime: null!,
                endTime: null!,
              },
            ]
          : currentPlan.lessons.map((lesson) => ({
              key: randomId(),
              id: lesson.id,
              weekDay: lesson.weekDay.toString(),
              startTime: minutesFromMidnightToTimeString(lesson.startTime),
              endTime: minutesFromMidnightToTimeString(lesson.endTime),
            })),
    },
  });
  const { data: classes } = api.class.byAreaId.useQuery(
    {
      areaId: form.values.areaId ?? "",
    },
    {
      enabled: !!form.values.areaId,
    }
  );
  const { data: subjects } = api.subject.available.useQuery(
    {
      timeSpanId: form.values.timeSpanId ?? "",
      areaId: form.values.areaId ?? "",
      classId: form.values.classId ?? "",
    },
    {
      enabled:
        !!form.values.timeSpanId &&
        !!form.values.areaId &&
        !!form.values.classId,
    }
  );

  const handleSubmit = async (values: FormType) => {
    if (planId) {
      if (
        currentPlan?.areaId === values.areaId &&
        currentPlan?.classId === values.classId &&
        currentPlan?.subjectId === values.subjectId &&
        currentPlan?.timeSpanId === values.timeSpanId &&
        currentPlan?.lessons.length === values.lessons.length &&
        values.lessons.every((formLesson) =>
          currentPlan?.lessons.some(
            (planLesson) =>
              planLesson.id === formLesson.id &&
              planLesson.weekDay === parseInt(formLesson.weekDay, 10) &&
              formLesson.startTime !== null &&
              formLesson.endTime !== null &&
              planLesson.startTime ===
                timeStringToMinutesFromMidnight(formLesson.startTime) &&
              planLesson.endTime ===
                timeStringToMinutesFromMidnight(formLesson.endTime)
          )
        )
      ) {
        nextSteep();
      }

      await updatePlan(
        {
          id: planId,
          timeSpanId: values.timeSpanId,
          areaId: values.areaId,
          classId: values.classId,
          subjectId: values.subjectId,
          lessons: values.lessons.map((x) => ({
            id: x.id ?? null,
            weekDay: parseInt(x.weekDay, 10),
            startTime: x.startTime,
            endTime: x.endTime,
          })),
        },
        {
          onSuccess: () => {
            nextSteep();
          },
        }
      );

      return;
    }

    await createPlan(
      {
        timeSpanId: values.timeSpanId,
        areaId: values.areaId,
        classId: values.classId,
        subjectId: values.subjectId,
        lessons: values.lessons.map((x) => ({
          weekDay: parseInt(x.weekDay, 10),
          startTime: x.startTime,
          endTime: x.endTime,
        })),
      },
      {
        onSuccess: (data) => {
          setPlanId(data.id);
          nextSteep();
        },
      }
    );
  };

  const handleRemove = () => {
    if (!planId) return;

    openConfirmModal({
      title: "Entwurf entfernen",
      children: "Möchten Sie den Entwurf wirklich entfernen?",
      labels: {
        confirm: "Entwurf entfernen",
        cancel: "Abbrechen",
      },
      onCancel() {
        console.log("cancel");
      },
      onConfirm() {
        void removePlan(
          { id: planId },
          {
            onSuccess: () => {
              setPlanId(null);
              form.reset();
            },
          }
        );
      },
    });
  };

  const subjectsData = (() => {
    if (!subjects) return [];

    const mappedSubjects = subjects.map((x) => ({
      value: x.id,
      label: x.name,
    }));

    if (
      !currentPlan ||
      currentPlan.timeSpanId !== form.values.timeSpanId ||
      currentPlan.areaId !== form.values.areaId ||
      currentPlan.classId !== form.values.classId
    )
      return mappedSubjects;

    return [
      {
        value: currentPlan.subjectId,
        label: currentPlan.subject.name,
      },
      ...mappedSubjects,
    ];
  })();

  const schoolDaySelectionData = getSchoolDaySelectionData();

  return (
    <form onSubmit={form.onSubmit((v) => void handleSubmit(v))}>
      <Grid>
        <Grid.Col span={6}>
          <Select
            label="Zeitspanne"
            placeholder="Zeitspanne auswählen"
            required
            data={
              timeSpans?.map((x) => ({
                value: x.id,
                label: x.name,
              })) ?? []
            }
            {...form.getInputProps("timeSpanId")}
            onChange={(v) => {
              form.setFieldValue("classId", null!);
              form.setFieldValue("subjectId", null!);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              form.getInputProps("timeSpanId").onChange(v);
            }}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Select
            label="Bereich"
            placeholder="Bereich auswählen"
            required
            searchable
            data={areas?.map((x) => ({ value: x.id, label: x.name })) ?? []}
            {...form.getInputProps("areaId")}
            onChange={(v) => {
              form.setFieldValue("classId", null!);
              form.setFieldValue("subjectId", null!);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              form.getInputProps("areaId").onChange(v);
            }}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Select
            label="Klasse"
            placeholder="Klasse auswählen"
            required
            searchable
            data={classes?.map((x) => ({ value: x.id, label: x.name })) ?? []}
            styles={{
              description: {
                marginTop: 4,
              },
            }}
            nothingFound={
              form.values.areaId
                ? "Keine Klassen in diesem Bereich gefunden"
                : "Bitte zuerst einen Bereich auswählen"
            }
            {...form.getInputProps("classId")}
            onChange={(v) => {
              form.setFieldValue("subjectId", null!);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              form.getInputProps("classId").onChange(v);
            }}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Select
            label="Fach"
            placeholder="Fach auswählen"
            required
            searchable
            data={subjectsData}
            nothingFound={
              form.values.areaId
                ? "Kein verfügbares Fach gefunden"
                : "Bitte zuerst die anderen Felder ausfüllen"
            }
            {...form.getInputProps("subjectId")}
            description={
              <Text>
                Fach nicht gefunden? Versuchen Sie es <Anchor>hier</Anchor>.
                {/* Ein Modal hinzufügen in welchem erläutert wird, weshalb ein spezifisches Fach nicht dargestellt wird - Möglichkeit bieten alle Fächer zu durchsuchen und anschliessend entweder Antrag auf ein neues Fach zu stellen oder direkt auf die existierende Seite von diesem Fach weitergeleitet werden. */}
              </Text>
            }
            wrapperProps={{
              inputWrapperOrder: ["label", "input", "error", "description"],
            }}
            styles={{
              description: {
                marginTop: 4,
              },
            }}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider />
          <Group position="apart" mt="sm">
            <Title order={3} weight={500}>
              Lektionen
            </Title>
            <Button
              variant="outline"
              color="teal"
              onClick={() => {
                form.insertListItem("lessons", {
                  key: randomId(),
                  day: null!,
                  start: null!,
                  end: null!,
                });
              }}
            >
              Lektion hinzufügen
            </Button>
          </Group>
        </Grid.Col>

        {form.values.lessons?.map((item, index) => (
          <Grid.Col key={item.key}>
            <Group noWrap align="top">
              <Grid w="100%">
                <Grid.Col span={6}>
                  <Select
                    label="Tag"
                    placeholder="Tag auswählen"
                    required
                    data={schoolDaySelectionData}
                    {...form.getInputProps(`lessons.${index}.weekDay`)}
                  />
                </Grid.Col>

                <Grid.Col span={3}>
                  <TimeInput
                    required
                    label="Startzeit"
                    {...form.getInputProps(`lessons.${index}.startTime`)}
                  />
                </Grid.Col>

                <Grid.Col span={3}>
                  <TimeInput
                    required
                    label="Endzeit"
                    {...form.getInputProps(`lessons.${index}.endTime`)}
                  />
                </Grid.Col>
              </Grid>

              <Tooltip
                label={
                  form.values.lessons.length === 1
                    ? "Mindestens eine Lektion muss vorhanden sein"
                    : "Lektion entfernen"
                }
              >
                <Group mt={28}>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    disabled={form.values.lessons.length === 1}
                    onClick={() => {
                      form.removeListItem("lessons", index);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Tooltip>
            </Group>
          </Grid.Col>
        ))}

        <Grid.Col span={12}>
          <Group position={planId ? "apart" : "right"}>
            {planId ? (
              <Button color="red" variant="outline" onClick={handleRemove}>
                Entwurf entfernen
              </Button>
            ) : null}
            <Group>
              <Button color="gray" variant="outline">
                Abbrechen
              </Button>
              <Button type="submit">Fortfahren</Button>
            </Group>
          </Group>
        </Grid.Col>
      </Grid>
    </form>
  );
};
