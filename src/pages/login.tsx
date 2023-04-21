import {
  Anchor,
  Button,
  Center,
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { MicrosoftLogo } from "~/components/logos/microsoft-logo";

const Page = () => {
  return (
    <>
      <Head>
        <title>Anmelden | Sempla</title>
      </Head>
      <Container>
        <Center h="100vh" mah={600}>
          <Stack w="80%" maw="300px" align="center">
            <Stack spacing={0} align="center">
              <IconSchool size={128} />
              <Title mt={0}>Sempla</Title>
            </Stack>

            <Text size="md" weight={500} mt="lg">
              Willkommen, fortfahren mit
            </Text>

            <Button
              fullWidth
              variant="default"
              onClick={() =>
                void signIn("azure-ad", {
                  callbackUrl: "/",
                })
              }
              leftIcon={<MicrosoftLogo size={14} />}
            >
              Microsoft
            </Button>
            <Anchor href="mailto:sempla@webmaid.ch?subject=Request%20account">
              Konto anfragen
            </Anchor>
          </Stack>
        </Center>
      </Container>
    </>
  );
};

export default Page;
