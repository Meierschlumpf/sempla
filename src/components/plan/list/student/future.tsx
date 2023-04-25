import { Stack, Title } from "@mantine/core";
import { type TimeSpan } from "@prisma/client";
import { useMemo } from "react";
import { type RouterOutputs, api } from "~/utils/api";
import { type PlanListBaseProps } from "./types";
import { PlanList } from "./main";

export const FuturePlanList = ({ search, areaId }: PlanListBaseProps) => {
  const { data: plans } = api.plan.future.useQuery({
    search,
    areaId,
  });

  const distinctTimespans = useMemo(() => {
    return (plans ?? [])
      .reduce(
        (acc, plan) => {
          const index = acc.findIndex((x) => x.id === plan.timeSpanId);

          if (index !== -1) {
            acc[index]!.plans.push(plan);
            return acc;
          }

          acc.push({
            ...plan.timeSpan,
            plans: [plan],
          });
          return acc;
        },
        [] as (TimeSpan & {
          plans: RouterOutputs["plan"]["future"];
        })[]
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [plans]);

  return (
    <Stack>
      {distinctTimespans.map((timeSpan) => (
        <Stack spacing="xs" key={timeSpan.id}>
          <Title order={3} weight={500}>
            {timeSpan.name}
          </Title>
          <PlanList plans={timeSpan.plans} />
        </Stack>
      ))}
    </Stack>
  );
};
