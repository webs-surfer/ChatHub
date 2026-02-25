import { Box, Button, Stack, Text, useToast, Spinner, Badge } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../../../Context/ChatProvider";
import { getSender } from "../../../config/ChatLogics";

const Mychats = ({ fetchAgain, setFetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [loading, setLoading] = useState(false);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/chat`, config);
      setChats(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="sm"
      h="100%"
      overflow="hidden"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflow={"hidden"}
        overflowY="auto"
      >
        {loading ? (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="lg"
            m="auto"
          />
        ) : (
          <Stack spacing={2}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                _hover={{
                  bg: selectedChat === chat ? "#38B2AC" : "#E0E0E0",
                  transform: "translateX(4px)",
                }}
                transition="all 0.2s"
              >
                <Text fontWeight="bold" fontSize="sm">
                  {chat.chatName.length > 20
                    ? chat.chatName.substring(0, 20) + "..."
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs" opacity={0.7}>
                    <b>{chat.latestMessage.sender.name}:</b>
                    {" "}
                    {chat.latestMessage.content.length > 40
                      ? chat.latestMessage.content.substring(0, 40) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Mychats;