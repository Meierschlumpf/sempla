import { Title } from "@mantine/core";
import { type NextPage } from "next";
import { Layout } from "~/components/layout";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data } = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <Layout>
      <Title>{data?.greeting}</Title>
    </Layout>
  );
};

export default Home;
