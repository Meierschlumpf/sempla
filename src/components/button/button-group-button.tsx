import { Button, Text, useMantineTheme } from "@mantine/core";
import { type TablerIconsProps } from "@tabler/icons-react";
import Link from "next/link";
import { type ReactNode } from "react";

interface ButtonGroupButtonProps {
  icon: (props: TablerIconsProps) => JSX.Element;
  href: string;
  children: ReactNode;
  count: number | undefined;
}

export const ButtonGroupButton = (props: ButtonGroupButtonProps) => {
  const { colors, colorScheme } = useMantineTheme();

  return (
    <Button
      component={Link}
      href={props.href}
      variant="default"
      leftIcon={<props.icon size={16} />}
      styles={{
        leftIcon: {
          marginRight: 4,
        },
        rightIcon: {
          marginLeft: 4,
        },
      }}
      rightIcon={
        <Text
          size={11}
          bg={colorScheme == "dark" ? colors.dark[7] : colors.gray[2]}
          px={6}
          weight={600}
          style={{ borderRadius: 6 }}
        >
          {props.count ?? 0}
        </Text>
      }
    >
      {props.children}
    </Button>
  );
};
