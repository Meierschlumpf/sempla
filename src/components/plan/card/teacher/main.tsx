import {
  UnstyledButton,
  Card,
  Group,
  Text,
  useMantineTheme,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { lessonsDisplay } from "../student/main";
import { type RouterOutputs } from "~/utils/api";
import { IconBook2 } from "@tabler/icons-react";

type PlanTeacherCardProps = {
  plan: RouterOutputs["plan"]["current"][number];
  showSubject?: boolean;
};

export const PlanTeacherCard = ({
  plan,
  showSubject,
}: PlanTeacherCardProps) => {
  const { primaryColor } = useMantineTheme();

  return (
    <UnstyledButton
      key={plan.id}
      w="100%"
      component={Link}
      href={`/plans/${plan.id}`}
    >
      <Card>
        <Group position="apart" noWrap>
          <Group>
            <Text
              weight={500}
              color={primaryColor}
              style={{
                lineHeight: 1,
              }}
            >
              {plan.class.name}
            </Text>
            {showSubject && (
              <Group spacing={4}>
                <Tooltip label="Fach" withinPortal>
                  <IconBook2 size={16} stroke={1.5} />
                </Tooltip>
                <Text
                  size="sm"
                  color="dimmed"
                  style={{
                    lineHeight: 1,
                  }}
                >
                  {plan.subject.name}
                </Text>
              </Group>
            )}
          </Group>

          <Text
            style={{
              lineHeight: 1,
            }}
          >
            {lessonsDisplay(plan.lessons)}
          </Text>
        </Group>
      </Card>
    </UnstyledButton>
  );
};
