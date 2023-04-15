import { api } from "~/utils/api";
import { type PlanListBaseProps } from "./types";
import { PlanList } from "./main";

export const CurrentPlanList = ({ search, areaId }: PlanListBaseProps) => {
  const { data: plans } = api.plan.current.useQuery({
    search,
    areaId,
  });

  return <PlanList plans={plans ?? []} />;
};
