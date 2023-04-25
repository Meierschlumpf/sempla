/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Avatar,
  Center,
  createStyles,
  Indicator,
  Menu,
  Navbar,
  rem,
  Stack,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBell,
  IconCalendar,
  IconLogout,
  IconSchool,
  IconSearch,
  IconSwitchHorizontal,
  IconUser,
  type TablerIconsProps,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";

const items = [{ icon: IconCalendar, label: "Pläne", href: "/plans" }];

export function DefaultNavbar() {
  const { data: me } = api.user.me.useQuery();
  const { data: user } = api.user.byId.useQuery(
    {
      id: me?.id ?? "",
    },
    {
      enabled: !!me?.id,
    }
  );

  const { classes } = useStyles();
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
        <Link href="/">
          <IconSchool size={48} color={colors.gray[0]} />
        </Link>
      </Center>
      <Navbar.Section grow mt={50}>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0} align="center">
          <NavbarLink icon={IconSearch} label="Suchen" onClick={() => []} />
          <NavbarLink
            icon={(props) => (
              <Indicator label="99" offset={-3} color="transparent">
                <IconBell {...props} />
              </Indicator>
            )}
            label="Benachrichtigungen"
            onClick={() => []}
          />
          <Tooltip
            label="Dein Profil"
            position="right"
            transitionProps={{ duration: 0 }}
          >
            <UnstyledButton
              component={Link}
              href="/profile"
              className={classes.link}
            >
              <Avatar radius="xl" src={user?.image} />
            </UnstyledButton>
          </Tooltip>
          <NavbarLink
            icon={IconSwitchHorizontal}
            label="Rolle wechseln"
            onClick={() => []}
          />
          <NavbarLink
            icon={IconLogout}
            label="Abmelden"
            onClick={() =>
              void signOut({
                callbackUrl: "/login",
              })
            }
          />
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
