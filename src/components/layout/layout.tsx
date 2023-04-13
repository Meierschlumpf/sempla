import { AppShell, useMantineTheme } from "@mantine/core";
import { DefaultNavbar } from "./navbar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { colors, colorScheme } = useMantineTheme();
  return (
    <AppShell
      bg={colorScheme === "dark" ? colors.dark[7] : colors.gray[1]}
      navbar={<DefaultNavbar />}
    >
      {children}
    </AppShell>
  );
};
