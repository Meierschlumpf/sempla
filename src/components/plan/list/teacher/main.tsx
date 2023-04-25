import { Stack } from "@mantine/core";
import { type RouterOutputs } from "~/utils/api";
import { PlanTeacherCard } from "../../card/teacher/main";

type TeacherPlanListProps = {
  plans: RouterOutputs["plan"]["current"];
  showSubject?: boolean;
};

export const TeacherPlanList = ({
  plans,
  showSubject,
}: TeacherPlanListProps) => {
  return (
    <Stack spacing="sm">
      {plans.map((plan) => (
        <PlanTeacherCard key={plan.id} plan={plan} showSubject={showSubject} />
      ))}
    </Stack>
  );
};
