import {
  Badge,
  Container,
  Group,
  SegmentedControl,
  Tabs,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { type Area } from "@prisma/client";
import { type DehydratedState } from "@tanstack/react-query";
import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import { Layout } from "~/components/layout/layout";
import { CurrentPlanList } from "~/components/plan/list/student/current";
import { FuturePlanList } from "~/components/plan/list/student/future";
import { PastPlanList } from "~/components/plan/list/student/past";
import { CurrentPlanTeacherList } from "~/components/plan/list/teacher/current";
import { FuturePlanTeacherList } from "~/components/plan/list/teacher/future";
import { PastPlanTeacherList } from "~/components/plan/list/teacher/past";
import { createSsgHelper } from "~/helpers/createSsgHelper";
import {
  getSearchParamWithFallback,
  useSearchParamsState,
} from "~/helpers/searchParams";
import { getServerSession } from "~/server/auth/get-session";
import { api } from "~/utils/api";

type PageProps = StudentPageProps | TeacherPageProps;

const Page = (props: PageProps) => {
  if (props.type === "student") {
    return <StudentPage {...props} />;
  }

  return <TeacherPage {...props} />;
};

export default Page;

type StudentPageProps = {
  type: "student";
  areas: Area[];
  query: {
    areaId: string;
    search: string;
    tab: string;
  };
};

const StudentPage: NextPage<Omit<StudentPageProps, "type">> = ({
  areas,
  query,
}) => {
  const { primaryColor } = useMantineTheme();
  const [areaId, setAreaId] = useSearchParamsState(query, "areaId");
  const [search, setSearch] = useSearchParamsState(query, "search");
  const [tab, setTab] = useSearchParamsState(query, "tab");
  const [debouncedSearch] = useDebouncedValue(search, 250);

  const counts = useCounts({
    areaId,
    search: debouncedSearch,
  });

  return (
    <>
      <Head>
        <title>Übersicht Semesterpläne</title>
      </Head>
      <Layout>
        <Container>
          <Group position="apart">
            <Title>Übersicht Semesterpläne</Title>
            <SegmentedControl
              data={areas?.map((x) => ({ label: x.name, value: x.id })) ?? []}
              value={areaId}
              onChange={setAreaId}
              color={primaryColor}
            />
          </Group>
          <Tabs value={tab} onTabChange={setTab}>
            <Tabs.List mb="sm">
              <Tab value="current" count={counts.current} label="Aktuell" />
              <Tab value="past" count={counts.past} label="Vergangen" />
              <Tab value="future" count={counts.future} label="Zukünftig" />

              <TextInput
                ml="auto"
                placeholder="Suchen..."
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </Tabs.List>

            <Tabs.Panel value="current">
              <CurrentPlanList search={debouncedSearch} areaId={areaId} />
            </Tabs.Panel>

            <Tabs.Panel value="past">
              <PastPlanList search={debouncedSearch} areaId={areaId} />
            </Tabs.Panel>

            <Tabs.Panel value="future">
              <FuturePlanList search={debouncedSearch} areaId={areaId} />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </Layout>
    </>
  );
};

type TeacherPageProps = {
  type: "teacher";
  query: {
    search: string;
    tab: string;
  };
};

const TeacherPage: NextPage<Omit<TeacherPageProps, "type">> = ({ query }) => {
  const [search, setSearch] = useSearchParamsState(query, "search");
  const [tab, setTab] = useSearchParamsState(query, "tab");
  const [debouncedSearch] = useDebouncedValue(search, 250);

  const counts = useCounts({
    search: debouncedSearch,
  });

  return (
    <>
      <Head>
        <title>Übersicht Semesterpläne</title>
      </Head>
      <Layout>
        <Container>
          <Group position="apart">
            <Title>Übersicht Semesterpläne</Title>
          </Group>
          <Tabs value={tab} onTabChange={setTab}>
            <Tabs.List mb="sm">
              <Tab value="current" count={counts.current} label="Aktuell" />
              <Tab value="past" count={counts.past} label="Vergangen" />
              <Tab value="future" count={counts.future} label="Zukünftig" />

              <TextInput
                ml="auto"
                placeholder="Suchen..."
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </Tabs.List>

            <Tabs.Panel value="current">
              <CurrentPlanTeacherList search={debouncedSearch} />
            </Tabs.Panel>

            <Tabs.Panel value="past">
              <PastPlanTeacherList search={debouncedSearch} />
            </Tabs.Panel>

            <Tabs.Panel value="future">
              <FuturePlanTeacherList search={debouncedSearch} />
            </Tabs.Panel>
          </Tabs>
        </Container>
      </Layout>
    </>
  );
};

type TabProps = {
  value: string;
  label: string;
  count: number;
};

const Tab = (props: TabProps) => {
  const { primaryColor, colors, colorScheme } = useMantineTheme();

  return (
    <Tabs.Tab
      value={props.value}
      rightSection={
        props.count > 0 && (
          <Badge
            bg={colorScheme === "light" ? colors[primaryColor]?.[1] : undefined}
            px={6}
          >
            {props.count}
          </Badge>
        )
      }
    >
      {props.label}
    </Tabs.Tab>
  );
};

type GetServerSidePropsProps = PageProps & {
  trpcState: DehydratedState;
};

export const getServerSideProps: GetServerSideProps<
  GetServerSidePropsProps
> = async (context) => {
  const session = await getServerSession(context);

  const ssg = await createSsgHelper(context);

  const search = getSearchParamWithFallback(context.query, "search", "");
  const tab = getSearchParamWithFallback(context.query, "tab", "current");

  if (true) {
    return {
      props: {
        trpcState: ssg.dehydrate(),
        type: "teacher",
        query: {
          search,
          tab,
        },
      },
    };
  }

  const areas = await ssg.area.me.fetch();

  if (areas.length === 0) {
    return {
      notFound: true,
    };
  }

  const areaId = getSearchParamWithFallback(
    context.query,
    "areaId",
    areas.at(0)!.id
  );

  await ssg.plan.current.prefetch({ areaId, search });
  await ssg.plan.past.prefetch({ areaId, search });
  await ssg.plan.future.prefetch({ areaId, search });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      areas,
      type: "student",
      query: {
        areaId,
        search,
        tab,
      },
    },
  };
};

const useCounts = ({
  areaId = null,
  search,
}: {
  areaId?: string | null;
  search: string;
}) => {
  const { data: current } = api.plan.current.useQuery({ areaId, search });
  const { data: past } = api.plan.past.useQuery({ areaId, search });
  const { data: future } = api.plan.future.useQuery({ areaId, search });

  return {
    current: current?.length ?? 0,
    past: past?.length ?? 0,
    future: future?.length ?? 0,
  };
};
