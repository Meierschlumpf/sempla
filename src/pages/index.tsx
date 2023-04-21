import { Container, Title } from "@mantine/core";
import { type GetServerSideProps, type NextPage } from "next";
import { Layout } from "~/components/layout/layout";
import { getServerSession } from "~/server/auth/get-session";

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);

  if (!session)
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };

  return {
    props: {},
  };
};
