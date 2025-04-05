import { Center, Text } from "@mantine/core";

export const ListNotFound = ({ label }: { label: string }) => {
  return (
    <Center pt="sm">
      <Text>Es wurden keine {label} gefunden!</Text>
    </Center>
  );
};
