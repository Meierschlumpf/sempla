import { Stack, Text } from "@mantine/core";

export const ListError = () => {
  return (
    <Stack align="center" pt="sm" spacing="sm">
      <Text weight={500}>Es ist ein Fehler aufgetreten!</Text>
      <Text color="dimmed">
        Bitte versuchen Sie es in ein paar Minuten erneut.
      </Text>
    </Stack>
  );
};
