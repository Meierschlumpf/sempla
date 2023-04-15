import { Container, Stack, Text, Title } from "@mantine/core";
import { type NextPage } from "next";
import { Layout } from "~/components/layout/layout";

import dayjs from "dayjs";
import React from "react";
import { TopicCard } from "~/components/appointment/topics/card/main";
import { api } from "~/utils/api";

const Page: NextPage = () => {
  return (
    <Layout>
      <Container>
        <Title>Themen</Title>

        <TopicList />
      </Container>
    </Layout>
  );
};

export default Page;

const TopicList = () => {
  const { data: topics } = api.topic.byPlan.useQuery();

  return (
    <Stack spacing="xs">
      {topics?.map((item) => (
        <React.Fragment key={item.id}>
          <Stack spacing={0}>
            <Text size="sm">{dayjs(item.start).format("DD.MM.YYYY")}</Text>
            <TopicCard item={item} mode="display" />
          </Stack>
        </React.Fragment>
      ))}
    </Stack>
  );
};
