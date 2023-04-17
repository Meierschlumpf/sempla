import { Container, Title } from "@mantine/core";
import { type NextPage } from "next";
import { Layout } from "~/components/layout/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <Container>
        <Title>Startseite</Title>
      </Container>
    </Layout>
  );
};

export default Home;
