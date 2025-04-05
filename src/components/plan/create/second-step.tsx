import {
  Button,
  Card,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IconCalendarDue, IconChartBar } from "@tabler/icons-react";
import { api } from "~/utils/api";

type PlanSecondStepFormProps = {
  nextSteep: () => void;
  planId: string;
  templateId: string | null;
  setTemplateId: (templateId: string | null) => void;
};

export const PlanSecondStepForm = ({
  nextSteep,
  planId,
  templateId,
  setTemplateId,
}: PlanSecondStepFormProps) => {
  const { primaryColor, colors } = useMantineTheme();
  const { mutateAsync: selectTemplate, isLoading } =
    api.plan.selectTemplateAndGenerateAppointments.useMutation();
  const { data: templates } = api.template.forPlan.useQuery({
    planId: planId,
  });

  const handleSelection = (id: string) => {
    if (templateId === id) {
      nextSteep();
      return;
    }

    void selectTemplate(
      { planId, templateId: id },
      {
        onSuccess: () => {
          setTemplateId(id);
          nextSteep();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Stack h="30vh" align="center" justify="center">
        <Loader variant="bars" />
        <Text weight={500}>Vorlage wird übernommen...</Text>
      </Stack>
    );
  }

  return (
    <Stack>
      <Title order={2} weight={500}>
        Wählen Sie eine Vorlage aus um fortzufahren.
      </Title>
      <Grid>
        {templates?.map((template) => (
          <Grid.Col span={4} key={template.name}>
            <UnstyledButton
              w="100%"
              onClick={() => handleSelection(template.id)}
            >
              <Card
                withBorder
                h={192}
                style={{
                  border:
                    templateId === template.id
                      ? `2px solid ${colors[primaryColor]![4]}`
                      : undefined,
                }}
              >
                <Stack justify="space-between" h="100%">
                  <Stack spacing={2}>
                    <Text weight={500} lineClamp={2}>
                      {template.name}
                    </Text>
                    <Text size="sm" color="dimmed" lineClamp={3}>
                      {template.description}
                    </Text>
                  </Stack>
                  <Group mt="sm">
                    <Group spacing={4}>
                      <IconCalendarDue size={12} />
                      <Text size="xs">{template.events} Termine</Text>
                    </Group>
                    <Group spacing={4}>
                      <IconChartBar size={12} />
                      <Text size="xs">{template.usage} Verwendungen</Text>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            </UnstyledButton>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};
