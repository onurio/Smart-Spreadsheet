import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { ActionIcon, Alert, Flex, Input, Paper } from "@mantine/core";
import { useEffect, useState } from "react";
import { askQuestion } from "~/utils/api";

type Message = {
  text: string;
  role: "user" | "bot";
};

export default function Chat({ sessionId }: { sessionId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");

  const handleAskQuestion = async () => {
    if (!sessionId) {
      alert("Please upload a file first");
      return;
    }

    setQuestion("");
    setMessages((prev) => [...prev, { text: question, role: "user" }]);

    try {
      const data = await askQuestion(sessionId, question);

      setMessages((prev) => [...prev, { text: data, role: "bot" }]);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleAskQuestion();
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [question, sessionId]);

  return (
    <Paper pos="relative" shadow="sm" withBorder h="80%">
      <Flex
        style={{ overflow: "scroll" }}
        direction="column"
        p="lg"
        gap="lg"
        h="100%"
      >
        {messages.map((message, index) => (
          <Paper
            key={index}
            p="md"
            shadow="xs"
            withBorder
            maw={400}
            ml={message.role !== "bot" ? "auto" : 0}
            bg={message.role === "bot" ? "green" : "blue"}
            c="white"
          >
            {message.text}
          </Paper>
        ))}
      </Flex>

      {!sessionId && (
        <Flex
          pos="absolute"
          top={0}
          left={0}
          justify="center"
          align="center"
          h="100%"
          w="100%"
        >
          <Alert>Please upload a file to start chatting</Alert>
        </Flex>
      )}
      {sessionId && (
        <Paper w="100%" bg="cyan" shadow="xs">
          <Flex
            justify="center"
            style={{
              padding: 8,
            }}
            align="center"
            gap={8}
          >
            <Input
              type="text"
              value={question}
              size="lg"
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question"
              style={{ width: "100%" }}
            />
            <ActionIcon
              disabled={!question}
              bg="cyan"
              size={40}
              onClick={handleAskQuestion}
            >
              <PaperAirplaneIcon title="Send">Send</PaperAirplaneIcon>
            </ActionIcon>
          </Flex>
        </Paper>
      )}
    </Paper>
  );
}
