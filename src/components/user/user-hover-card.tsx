import { HoverCard, Group, Avatar, Stack, Text, Anchor } from "@mantine/core";
import { type Teacher } from "@prisma/client";
import Link from "next/link";
import { type ReactNode } from "react";

type UserHoverCardProps = {
  user: Pick<Teacher, "id" | "firstName" | "lastName" | "imageUrl">;
  target: ReactNode;
};

export const UserHoverCard = ({ user, target }: UserHoverCardProps) => {
  return (
    <HoverCard
      position="bottom-start"
      withinPortal
      openDelay={500}
      width={320}
      shadow="md"
      withArrow
    >
      <HoverCard.Target>{target}</HoverCard.Target>
      <HoverCard.Dropdown>
        <Group>
          <Avatar
            src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            radius="xl"
          />
          <Stack spacing={5}>
            <Text size="sm" weight={700} sx={{ lineHeight: 1 }}>
              {user.firstName} {user.lastName}
            </Text>
            <Anchor
              component={Link}
              href={`/teachers/${user.id}`}
              color="dimmed"
              size="xs"
              sx={{ lineHeight: 1 }}
            >
              unknown
            </Anchor>
          </Stack>
        </Group>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
