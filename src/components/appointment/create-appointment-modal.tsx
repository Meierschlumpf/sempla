import {
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Input,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import {
  type UseFormReturnType,
  createFormContext,
  useForm,
} from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { useModals, type ContextModalProps } from "@mantine/modals";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { IconChalkboard, IconTicket, IconTrekking } from "@tabler/icons-react";
import { type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type ReactNode, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";

type SharedFormType = {
  startDate: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
};

const [SharedFormProvider, useFormContext] =
  createFormContext<SharedFormType>();

type ConstructUseFormReturnType<TForm extends SharedFormType> =
  UseFormReturnType<TForm, (values: TForm) => TForm>;

type LessonFormType = SharedFormType & {
  topicId: string;
  subjectId: string;
};

type EventFormType = SharedFormType & {
  name: string;
  description: string;
};

type ExcursionFormType = SharedFormType & {
  name: string;
  description: string;
  location: string;
};

const FormProvider = ({
  form,
  children,
}: {
  form:
    | ConstructUseFormReturnType<LessonFormType>
    | ConstructUseFormReturnType<EventFormType>
    | ConstructUseFormReturnType<ExcursionFormType>;
  children: ReactNode;
}) => (
  <SharedFormProvider
    form={form as unknown as ConstructUseFormReturnType<SharedFormType>}
  >
    {children}
  </SharedFormProvider>
);

const SharedCreateAppointmentForm = ({
  multipleDays,
}: {
  multipleDays: boolean;
}) => {
  const form = useFormContext();

  return (
    <Grid>
      <Grid.Col span={12} md={multipleDays ? 6 : undefined}>
        <DatePickerInput
          required
          popoverProps={{
            withinPortal: true,
          }}
          label={multipleDays ? "Startdatum" : "Datum"}
          {...form.getInputProps("startDate")}
        />
      </Grid.Col>
      {multipleDays && (
        <Grid.Col span={12} md={6}>
          <DatePickerInput
            required
            popoverProps={{
              withinPortal: true,
            }}
            label="Enddatum"
            {...form.getInputProps("endDate")}
          />
        </Grid.Col>
      )}

      <Grid.Col span={12} md={6}>
        <TimeInput
          required
          label="Startzeit"
          {...form.getInputProps("startTime")}
        />
      </Grid.Col>
      <Grid.Col span={12} md={6}>
        <TimeInput
          required
          label="Endzeit"
          {...form.getInputProps("endTime")}
        />
      </Grid.Col>
    </Grid>
  );
};

const timeStringSchema = z
  .string()
  .regex(/^\d{1,2}:\d{1,2}$/)
  .transform((v) => {
    const [hours, minutes] = v.split(":");
    if (!hours || !minutes) return null;
    return { hours: parseInt(hours), minutes: parseInt(minutes) };
  });

const timeStringToHoursAndMinutes = (time: string) => {
  const schemaResult = timeStringSchema.safeParse(time);
  if (!schemaResult.success) return null;
  return schemaResult.data;
};

const transformDateAndTimeStringToDate = (
  date: Date | undefined,
  time: string
) => {
  if (!date) throw new Error("Date is undefined");
  const timeData = timeStringToHoursAndMinutes(time);
  if (!timeData) throw new Error("Time is invalid");

  const newDate = new Date(date);
  newDate.setHours(timeData.hours);
  newDate.setMinutes(timeData.minutes);
  return newDate;
};

const handleSubmitMiddleware = (
  values: SharedFormType,
  multipleDays: boolean
) => {
  const start = transformDateAndTimeStringToDate(
    values.startDate,
    values.startTime
  );
  const end = transformDateAndTimeStringToDate(
    multipleDays ? values.endDate : values.startDate,
    values.endTime
  );
  return { start, end };
};

const CreateLessonForm = ({
  context,
  id,
}: Omit<ContextModalProps<never>, "innerProps">) => {
  const { data: subjects } = api.subject.all.useQuery();
  const { data: topics } = api.topic.all.useQuery();
  const utils = api.useContext();
  const { mutate } = api.appointment.create.useMutation();
  const form = useForm<LessonFormType>();

  const handleSubmit = (values: LessonFormType) => {
    const { start, end } = handleSubmitMiddleware(values, false);

    mutate(
      {
        type: "lesson",
        start,
        end,
        topicId: values.topicId,
        subjectId: values.subjectId,
      },
      {
        onSuccess: () => {
          context.closeModal(id);
          void utils.appointment.all.invalidate();
        },
      }
    );
  };

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SharedCreateAppointmentForm multipleDays={false} />
        <Grid>
          <Grid.Col span={12}>
            <Select
              required
              creatable
              hoverOnSearchChange
              clearable
              searchable
              selectOnBlur
              data={topics?.map((t) => ({ value: t.id, label: t.name })) ?? []}
              label="Thema"
              {...form.getInputProps("topicId")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Select
              required
              selectOnBlur
              searchable
              nothingFound="Nichts gefunden"
              hoverOnSearchChange
              clearable
              data={
                subjects?.map((s) => ({ value: s.id, label: s.name })) ?? []
              }
              label="Fach"
              {...form.getInputProps("subjectId")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group position="right">
              <Button
                variant="outline"
                color="dark"
                onClick={() => context.closeModal(id)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Erstellen</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </FormProvider>
  );
};

const DescriptionEditor = (props: {
  value: string;
  onChange: (value: string) => void;
  error?: ReactNode;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content:
      props.value === undefined ? "" : (JSON.parse(props.value) as JSONContent),
    onUpdate: ({ editor }) => {
      props.onChange(JSON.stringify(editor.getJSON()));
    },
    onBlur({ event }) {
      props.onBlur?.(event);
    },
    onFocus({ event }) {
      props.onFocus?.(event);
    },
  });

  return (
    <Input.Wrapper label="Beschreibung" error={props.error}>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <ScrollArea.Autosize mah={300}>
          <RichTextEditor.Content />
        </ScrollArea.Autosize>
      </RichTextEditor>
    </Input.Wrapper>
  );
};

const CreateEventForm = ({
  context,
  id,
}: Omit<ContextModalProps<never>, "innerProps">) => {
  const utils = api.useContext();
  const { mutate } = api.appointment.create.useMutation();
  const form = useForm<EventFormType>();

  const handleSubmit = (values: EventFormType) => {
    const { start, end } = handleSubmitMiddleware(values, true);

    mutate(
      {
        type: "event",
        start,
        end,
        name: values.name,
        description: values.description ?? "",
      },
      {
        onSuccess: () => {
          context.closeModal(id);
          void utils.appointment.all.invalidate();
        },
      }
    );
  };

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SharedCreateAppointmentForm multipleDays={true} />
        <Grid>
          <Grid.Col span={12}>
            <TextInput label="Name" required {...form.getInputProps("name")} />
          </Grid.Col>
          <Grid.Col span={12}>
            <DescriptionEditor {...form.getInputProps("description")} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group position="right">
              <Button
                variant="outline"
                color="dark"
                onClick={() => context.closeModal(id)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Erstellen</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </FormProvider>
  );
};

const CreateExcursionForm = ({
  context,
  id,
}: Omit<ContextModalProps<never>, "innerProps">) => {
  const utils = api.useContext();
  const { mutate } = api.appointment.create.useMutation();
  const form = useForm<ExcursionFormType>();

  const handleSubmit = (values: ExcursionFormType) => {
    const { start, end } = handleSubmitMiddleware(values, false);

    mutate(
      {
        type: "excursion",
        start,
        end,
        name: values.name,
        description: values.description ?? "",
        location: values.location,
      },
      {
        onSuccess: () => {
          context.closeModal(id);
          void utils.appointment.all.invalidate();
        },
      }
    );
  };

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SharedCreateAppointmentForm multipleDays={false} />
        <Grid>
          <Grid.Col span={12}>
            <TextInput label="Name" required {...form.getInputProps("name")} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Ort"
              required
              {...form.getInputProps("location")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <DescriptionEditor {...form.getInputProps("description")} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group position="right">
              <Button
                variant="outline"
                color="dark"
                onClick={() => context.closeModal(id)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Erstellen</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </FormProvider>
  );
};

const appointmentTypes = [
  {
    type: "lesson",
    icon: IconChalkboard,
    form: CreateLessonForm,
  },
  {
    type: "excursion",
    icon: IconTrekking,
    form: CreateExcursionForm,
  },
  {
    type: "event",
    icon: IconTicket,
    form: CreateEventForm,
  },
] as const;

type AppointmentType = typeof appointmentTypes[number]["type"];

interface AppointmentSelectionProps {
  setType: (type: AppointmentType) => void;
}

const AppointmentSelection = ({ setType }: AppointmentSelectionProps) => {
  const { spacing, breakpoints } = useMantineTheme();
  const isLargerThanXs = useMediaQuery(`(min-width: ${breakpoints.xs})`);

  return (
    <Stack>
      <Text color="dimmed">Wähle die Art für den neuen Termin</Text>
      <Grid justify="center">
        {appointmentTypes.map((appointmentType) => (
          <Grid.Col key={appointmentType.type} span={12} sm={4} xs={6}>
            <UnstyledButton
              onClick={() => setType(appointmentType.type)}
              w="100%"
            >
              <Card withBorder>
                <Flex
                  direction={isLargerThanXs ? "column" : "row"}
                  align="center"
                  justify={isLargerThanXs ? "center" : "start"}
                  gap={isLargerThanXs ? 0 : spacing.sm}
                >
                  <appointmentType.icon size={32} />
                  <Title order={5} weight={500}>
                    {appointmentType.type}
                  </Title>
                </Flex>
              </Card>
            </UnstyledButton>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};

export const CreateAppointmentModal = ({
  id,
  context,
}: ContextModalProps<Record<never, unknown>>) => {
  const [type, setType] = useState<AppointmentType>();

  if (type === undefined) {
    return <AppointmentSelection setType={setType} />;
  }

  const currentForm = appointmentTypes.find((t) => t.type === type);

  if (!currentForm) return null;

  return <currentForm.form id={id} context={context} />;
};

export const useOpenCreateAppointmentModal = () => {
  const modals = useModals();

  return () => {
    modals.openContextModal("createAppointment", {
      innerProps: {},
      title: <Title order={4}>Termin erstellen</Title>,
      size: "xl",
    });
  };
};
