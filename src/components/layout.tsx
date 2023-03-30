import { AppShell } from "@mantine/core";
import { DefaultNavbar } from "./navbar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AppShell navbar={<DefaultNavbar />}>{children}</AppShell>;
};
