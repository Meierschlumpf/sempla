import { Group, Stack, Text, Title } from "@mantine/core";
import { useMemo } from "react";
import { ListWrapper } from "~/components/entity/list";
import { api } from "~/utils/api";
import { TeacherPlanList } from "./main";
import { type SubjectPlan } from "./types";

type CurrentPlanTeacherListProps = {
  search: string;
};

export const CurrentPlanTeacherList = ({
  search,
}: CurrentPlanTeacherListProps) => {
  const {
    data: plans,
    isLoading,
    isError,
  } = api.plan.current.useQuery({
    search,
    areaId: null,
  });
  const subjectPlans = useMemo(() => {
    if (!plans) return [];
    const list: SubjectPlan[] = [];

    for (const plan of plans) {
      const subjectPlan = list.find((x) => x.subjectId === plan.subjectId);
      if (subjectPlan) {
        subjectPlan.plans.push(plan);
        continue;
      }
      list.push({
        subjectId: plan.subjectId,
        subject: plan.subject,
        plans: [plan],
      });
    }
    return list;
  }, [plans]);

  return (
    <ListWrapper
      isError={isError}
      isLoading={isLoading}
      items={plans}
      label="Pläne"
    >
      <Stack>
        {subjectPlans.map(({ subject, plans }) => (
          <Stack spacing="sm" key={subject.id}>
            <Group spacing={4}>
              <Title order={4} weight={500}>
                {subject.name}
              </Title>
              <Text color="dimmed">({plans.length})</Text>
            </Group>

            <TeacherPlanList plans={plans} />
          </Stack>
        ))}
      </Stack>
    </ListWrapper>
  );
};
