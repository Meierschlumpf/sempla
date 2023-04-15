/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Center,
  createStyles,
  Navbar,
  rem,
  Stack,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCalendar,
  IconLogout,
  IconSchool,
  IconSwitchHorizontal,
  IconUser,
  type TablerIconsProps,
} from "@tabler/icons-react";
import Link from "next/link";

const items = [
  { icon: IconCalendar, label: "Pläne", href: "/plans" },
  { icon: IconUser, label: "Profil", href: "/profile" },
];

export function DefaultNavbar() {
  const { colors } = useMantineTheme();
  const links = items.map((link) => <NavbarLink {...link} key={link.label} />);

  return (
    <Navbar
      height="100%"
      width={{ base: 80 }}
      p="md"
      sx={(theme) => ({
        backgroundColor: theme.fn.variant({
          variant: "filled",
          color: theme.primaryColor,
        }).background,
      })}
    >
      <Center>
        <IconSchool size={48} color={colors.gray[0]} />
      </Center>
      <Navbar.Section grow mt={50}>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0}>
          <NavbarLink
            icon={IconSwitchHorizontal}
            label="Change account"
            onClick={() => []}
          />
          <NavbarLink icon={IconLogout} label="Logout" onClick={() => []} />
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}

type NavbarLinkProps = {
  icon: (props: TablerIconsProps) => JSX.Element;
  label: string;
  active?: boolean;
} & (
  | {
      href: string;
      onClick?: never;
    }
  | {
      href?: never;
      onClick: () => void;
    }
);

function NavbarLink({
  icon: Icon,
  label,
  active,
  href,
  onClick,
}: NavbarLinkProps) {
  const { classes, cx } = useStyles();

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      {href ? (
        <UnstyledButton
          component={Link}
          href={href}
          className={cx(classes.link, { [classes.active]: active })}
        >
          <Icon size="1.2rem" stroke={1.5} />
        </UnstyledButton>
      ) : (
        <UnstyledButton
          onClick={onClick}
          className={cx(classes.link, { [classes.active]: active })}
        >
          <Icon size="1.2rem" stroke={1.5} />
        </UnstyledButton>
      )}
    </Tooltip>
  );
}

const useStyles = createStyles((theme) => ({
  link: {
    width: rem(50),
    height: rem(50),
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.white,
    opacity: 0.85,

    "&:hover": {
      opacity: 1,
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background!,
        0.1
      ),
    },
  },

  active: {
    opacity: 1,
    "&, &:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background!,
        0.15
      ),
    },
  },
}));
