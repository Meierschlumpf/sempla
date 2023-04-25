import { Group, Stack, Text, Title } from "@mantine/core";
import { TeacherPlanList } from "./main";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { type SubjectPlan } from "./types";

type CurrentPlanTeacherListProps = {
  search: string;
};

export const CurrentPlanTeacherList = ({
  search,
}: CurrentPlanTeacherListProps) => {
  const { data: plans } = api.plan.current.useQuery({
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
  );
};
