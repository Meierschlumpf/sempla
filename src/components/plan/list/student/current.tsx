import {
  Card,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { api } from "~/utils/api";
import { PlanList } from "./main";
import { type PlanListBaseProps } from "./types";

export const CurrentPlanList = ({ search, areaId }: PlanListBaseProps) => {
  const { data: plans } = api.plan.current.useQuery({
    search,
    areaId,
  });
  const { primaryColor } = useMantineTheme();
  const { data: area } = api.area.bySlug.useQuery({ slug: areaId });

  return (
    <Stack spacing="xs">
      {area != null && (plans?.length ?? 0) >= 1 && (
        <UnstyledButton
          component={Link}
          href={`/plans/display/${area?.routeName}`}
        >
          <Card withBorder>
            <Group position="apart">
              <Text color={primaryColor} weight={500} style={{ lineHeight: 1 }}>
                Übersicht mit allen Plänen
              </Text>
              <Text style={{ lineHeight: 1 }}>{plans?.length} Pläne</Text>
            </Group>
          </Card>
        </UnstyledButton>
      )}
      <PlanList plans={plans ?? []} />
    </Stack>
  );
};
