import { Grid } from "@mantine/core";
import { type RouterOutputs } from "~/utils/api";
import { type PlanLesson } from "@prisma/client";
import { useMemo } from "react";
import { PlanCard } from "../../card/student/main";

type PlanListProps = {
  plans: RouterOutputs["plan"]["current"];
};

export const PlanList = ({ plans }: PlanListProps) => {
  const sortedPlans = useSortPlans(plans);

  return (
    <Grid>
      {sortedPlans.map((plan) => (
        <Grid.Col span={4} key={plan.id}>
          <PlanCard plan={plan} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

const useSortPlans = (plans: RouterOutputs["plan"]["current"]) => {
  return useMemo(
    () =>
      plans?.sort((a, b) => {
        let firstLesson_a = a.lessons[0];
        let firstLesson_b = b.lessons[0];

        if (a.lessons.length >= 2) {
          firstLesson_a = a.lessons.sort(
            (a, b) => totalHoursOfLesson(a) - totalHoursOfLesson(b)
          )[0];
        }

        if (b.lessons.length >= 2) {
          firstLesson_b = b.lessons.sort(
            (a, b) => totalHoursOfLesson(a) - totalHoursOfLesson(b)
          )[0];
        }

        if (!firstLesson_a || !firstLesson_b) {
          return !firstLesson_a ? 1 : -1;
        }

        return (
          totalHoursOfLesson(firstLesson_a) - totalHoursOfLesson(firstLesson_b)
        );
      }),
    [plans]
  );
};

const totalHoursOfLesson = (lesson: PlanLesson) => {
  return lesson.weekDay * 24 * 60 + lesson.startTime;
};
