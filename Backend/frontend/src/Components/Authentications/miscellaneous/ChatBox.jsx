import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat";
import { ChatState } from "../../../Context/ChatProvider";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDirection="column"
      w={{ base: "100%", md: "68%" }}
      flex="1"
      minH="0"
      overflow="hidden"
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  );
};

export default ChatBox;