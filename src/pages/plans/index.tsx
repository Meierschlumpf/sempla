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
import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import { Layout } from "~/components/layout/layout";
import { CurrentPlanList } from "~/components/plan/list/current";
import { createSsgHelper } from "~/helpers/createSsgHelper";
import {
  getSearchParamWithFallback,
  useSearchParamsState,
} from "~/helpers/searchParams";
import { api } from "~/utils/api";

type QueryParams = {
  areaId: string;
  search: string;
  tab: string;
};

const Page: NextPage<{
  areas: Area[];
  query: QueryParams;
}> = ({ areas, query }) => {
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
          </Tabs>
        </Container>
      </Layout>
    </>
  );
};

export default Page;

type TabProps = {
  value: string;
  label: string;
  count: number;
};

const Tab = (props: TabProps) => {
  const { primaryColor, colors } = useMantineTheme();

  return (
    <Tabs.Tab
      value={props.value}
      rightSection={
        props.count > 0 && (
          <Badge bg={colors[primaryColor]?.[1]} px={6}>
            {props.count}
          </Badge>
        )
      }
    >
      {props.label}
    </Tabs.Tab>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const ssg = await createSsgHelper(context);

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
  const search = getSearchParamWithFallback(context.query, "search", "");
  const tab = getSearchParamWithFallback(context.query, "tab", "current");

  await ssg.plan.current.prefetch({ areaId, search });
  await ssg.plan.past.prefetch({ areaId, search });
  await ssg.plan.future.prefetch({ areaId, search });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      areas,
      query: {
        areaId,
        search,
        tab,
      } satisfies QueryParams,
    },
  };
};

const useCounts = ({ areaId, search }: { areaId: string; search: string }) => {
  const { data: current } = api.plan.current.useQuery({ areaId, search });
  const { data: past } = api.plan.past.useQuery({ areaId, search });
  const { data: future } = api.plan.future.useQuery({ areaId, search });

  return {
    current: current?.length ?? 0,
    past: past?.length ?? 0,
    future: future?.length ?? 0,
  };
};
