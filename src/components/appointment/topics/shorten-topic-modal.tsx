import {
  Button,
  Grid,
  Group,
  NumberInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { type ContextModalProps } from "@mantine/modals";
import { useEffect, useRef } from "react";
import { openContextModal } from "~/components/modals";
import { api } from "~/utils/api";

type ModalInnerProps = {
  topicId: string;
  name: string;
  duration: number;
  start: Date;
  end: Date;
};

type FormType = {
  current: {
    duration: number;
    name: string;
  };
  new: {
    duration: number;
    name: string;
  };
};

export const ShortenTopicModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<ModalInnerProps>) => {
  const { mutateAsync } = api.topic.shorten.useMutation();
  const utils = api.useContext();
  const ref = useRef<HTMLInputElement>(null);

  const form = useForm<FormType>({
    initialValues: {
      current: {
        duration: innerProps.duration,
        name: innerProps.name,
      },
      new: {
        duration: 0,
        name: "",
      },
    },
  });

  const handleSubmit = async (values: FormType) => {
    await mutateAsync(
      {
        topicId: innerProps.topicId,
        start: innerProps.start,
        end: innerProps.end,
        amount: -values.new.duration,
        newName: values.new.name,
      },
      {
        onSuccess: () => void utils.topic.byPlan.invalidate(),
      }
    );
  };

  useEffect(() => {
    ref.current?.select();
  }, []);

  return (
    <form onSubmit={form.onSubmit((v) => void handleSubmit(v))}>
      <Stack>
        <Stack spacing={4}>
          <Title order={5} weight={500}>
            Aktuelles Thema
          </Title>
          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                min={1}
                max={innerProps.duration - 1}
                {...form.getInputProps("current.duration")}
                onChange={(value) => {
                  if (value === "") return;
                  form.setFieldValue(
                    "new.duration",
                    innerProps.duration - value
                  );
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  form.getInputProps("current.duration").onChange(value);
                }}
              />
            </Grid.Col>
            <Grid.Col span={8}>
              <TextInput disabled {...form.getInputProps("current.name")} />
            </Grid.Col>
          </Grid>
        </Stack>

        <Stack spacing={4}>
          <Title order={5} weight={500}>
            Neues Thema
          </Title>
          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                ref={ref}
                min={1}
                max={innerProps.duration - 1}
                data-autoFocus
                data-autoSelect
                {...form.getInputProps("new.duration")}
                onChange={(value) => {
                  if (value === "") return;
                  form.setFieldValue(
                    "current.duration",
                    innerProps.duration - value
                  );
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  form.getInputProps("new.duration").onChange(value);
                }}
              />
            </Grid.Col>
            <Grid.Col span={8}>
              <TextInput {...form.getInputProps("new.name")} />
            </Grid.Col>
          </Grid>
        </Stack>
        <Group position="right">
          <Button
            variant="outline"
            color="gray"
            onClick={() => context.closeModal(id)}
          >
            Abbrechen
          </Button>
          <Button type="submit">Thema aufteilen</Button>
        </Group>
      </Stack>
    </form>
  );
};

export const useOpenShortenTopicModal = (props: ModalInnerProps) => {
  return () => {
    openContextModal({
      modal: "shortenTopic",
      innerProps: props,
      title: <Title order={4}>Thema aufteilen</Title>,
      size: "md",
    });
  };
};
