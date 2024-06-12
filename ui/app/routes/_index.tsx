import { AppShell, Container, Flex, Paper, Space, Title } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import Chat from "~/components/Chat";
import FileUpload from "~/components/FileUpload";

export const meta: MetaFunction = () => {
  return [{ title: "Excel AI Chat" }, { name: "description", content: "hi!" }];
};

export default function Index() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <Flex bg="teal" pos="fixed" h="100vh" w="100vw" m="auto" top={0} left={0}>
      <Paper
        pos="relative"
        shadow="xl"
        h="95%"
        bg={{ dark: "dark", light: "light" }}
        w="100%"
        p="md"
        m="lg"
      >
        <Flex justify={"space-between"} align={"center"} px="sm" py="xl">
          <Title order={2}>Upload an excel to start chatting!</Title>
          <FileUpload onUpload={(sessionId) => setSessionId(sessionId)} />
        </Flex>
        <Space />
        <Chat sessionId={sessionId} />
      </Paper>
    </Flex>
  );
}
