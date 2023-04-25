import {
  useMantineTheme,
  UnstyledButton,
  Card,
  Stack,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { type PlanLesson } from "@prisma/client";
import { IconUser, IconDoor } from "@tabler/icons-react";
import Link from "next/link";
import { UserHoverCard } from "~/components/user/user-hover-card";
import { dateString } from "~/helpers/date";
import { minutesFromMidnightToTimeString } from "~/helpers/time";
import { type RouterOutputs } from "~/utils/api";

type PlanCardProps = {
  plan: RouterOutputs["plan"]["current"][number];
};

export const PlanCard = ({ plan }: PlanCardProps) => {
  const { colors, primaryColor } = useMantineTheme();

  return (
    <UnstyledButton w="100%">
      <Card
        withBorder
        component={Link}
        href={`/plans/display/${plan.area.routeName}/${
          plan.subject.routeName
        }?start=${dateString(plan.timeSpan.start)}&end=${dateString(
          plan.timeSpan.end
        )}`}
      >
        <Stack spacing={4}>
          <Group position="apart" noWrap>
            <Text
              weight={500}
              color={primaryColor}
              style={{
                lineHeight: 1,
              }}
            >
              {plan.subject.name}
            </Text>
            <Text
              size="sm"
              style={{
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              {lessonsDisplay(plan.lessons)}
            </Text>
          </Group>
          <Group>
            <Group spacing={4}>
              <Tooltip label="Lehrperson">
                <IconUser size={12} color={colors.gray[6]} />
              </Tooltip>
              <UserHoverCard
                user={plan.creator}
                target={
                  <Text size="xs" color="dimmed">
                    {plan.creator.firstName} {plan.creator.lastName}
                  </Text>
                }
              />
            </Group>
            <Group spacing={4}>
              <Tooltip label="Raum">
                <IconDoor size={12} color={colors.gray[6]} />
              </Tooltip>
              <Text size="xs" color="dimmed">
                BMS 016
              </Text>
            </Group>
          </Group>
        </Stack>
      </Card>
    </UnstyledButton>
  );
};

export const lessonsDisplay = (lessons: PlanLesson[]) => {
  const lesson = lessons[0];
  if (!lesson) return null;
  if (lessons.length === 1)
    return (
      weekdays[lesson.weekDay]! +
      ", " +
      minutesFromMidnightToTimeString(lesson.startTime) +
      " - " +
      minutesFromMidnightToTimeString(lesson.endTime)
    );
  return `${lessons.length} Lektionen`;
};

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];
