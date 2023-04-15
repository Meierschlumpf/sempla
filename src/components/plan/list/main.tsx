import { Grid } from "@mantine/core";
import { PlanCard } from "../card/main";
import { type RouterOutputs } from "~/utils/api";

type PlanListProps = {
  plans: RouterOutputs["plan"]["current"];
};

export const PlanList = ({ plans }: PlanListProps) => {
  return (
    <Grid>
      {plans.map((plan) => (
        <Grid.Col span={4} key={plan.id}>
          <PlanCard plan={plan} />
        </Grid.Col>
      ))}
    </Grid>
  );
};
