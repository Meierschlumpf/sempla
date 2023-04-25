import { Stack, Title } from "@mantine/core";
import { type TimeSpan } from "@prisma/client";
import { useMemo } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import { TeacherPlanList } from "./main";

type PastPlanTeacherListProps = {
  search: string;
};

export const PastPlanTeacherList = ({ search }: PastPlanTeacherListProps) => {
  const { data: plans } = api.plan.past.useQuery({
    search,
    areaId: null,
  });

  const timespans = useMemo(() => {
    if (!plans) return [];

    const distinctTimespans: {
      timespanId: string;
      timespan: TimeSpan;
      plans: RouterOutputs["plan"]["past"];
    }[] = [];

    for (const plan of plans) {
      const index = distinctTimespans.findIndex(
        (x) => x.timespanId === plan.timeSpanId
      );

      if (index !== -1) {
        distinctTimespans[index]!.plans.push(plan);
        continue;
      }

      distinctTimespans.push({
        timespanId: plan.timeSpanId,
        timespan: plan.timeSpan,
        plans: [plan],
      });
    }

    return distinctTimespans
      .map((item) => {
        item.plans = item.plans.sort((a, b) =>
          a.subject.name.localeCompare(b.subject.name)
        );
        return item;
      })
      .sort((a, b) => b.timespan.start.getTime() - a.timespan.start.getTime());
  }, [plans]);

  return (
    <Stack>
      {timespans.map(({ timespan, plans }) => (
        <Stack spacing="xs" key={timespan.id}>
          <Title order={3} weight={500}>
            {timespan.name}
          </Title>
          <TeacherPlanList plans={plans} showSubject />
        </Stack>
      ))}
    </Stack>
  );
};
