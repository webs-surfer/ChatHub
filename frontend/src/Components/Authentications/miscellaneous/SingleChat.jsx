import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  FormControl,
  InputGroup,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import API from "../../../api/axios";
import { ChatState } from "../../../Context/ChatProvider";
import { getSender, getSenderFull } from "../../../config/ChatLogics";
import ProfileModal from "./ProfileModal";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await API.get(
        `/api/message/${selectedChat._id}`
      );
      setMessages(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    setNotification(notification.filter((n) => n.chat._id !== selectedChat?._id));
  }, [selectedChat]);

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      e.preventDefault();
      sendMessageHandler();
    }
  };

  const sendMessageHandler = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);

      const { data } = await API.post(
        "/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
        }
      );

      setNewMessage("");
      setMessages([...messages, data]);
      setFetchAgain(!fetchAgain);
      setSendingMessage(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setSendingMessage(false);
    }
  };

  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
      boxShadow="sm"
      h="100%"
    >
      {selectedChat ? (
        <>
          <Box
            pb={3}
            px={3}
            fontSize={{ base: "28px", md: "30px" }}
            fontFamily="Work sans"
            d="flex"
            w="100%"
            justifyContent="space-between"
            alignItems="center"
            borderBottomWidth="1px"
          >
            <Tooltip label="Go Back" hasArrow placement="bottom-end">
              <IconButton
                d={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat(null)}
              />
            </Tooltip>
            {selectedChat.isGroupChat ? (
              <>{selectedChat.chatName}</>
            ) : (
              <>{getSender(user, selectedChat.users)}</>
            )}
            {selectedChat.isGroupChat ? (
              <></>  
            ) : (
              <ProfileModal
                user={getSenderFull(user, selectedChat.users)}
              />
            )}
          </Box>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="space-between"
            p={3}
            bg="#F8F8F8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  marginBottom: "10px",
                }}
              >
                {messages.map((m, i) => (
                  <div key={m._id}>
                    <Box
                      d="flex"
                      justifyContent={
                        m.sender._id === user._id ? "flex-end" : "flex-start"
                      }
                      mb={2}
                    >
                      <Text
                        bg={
                          m.sender._id === user._id ? "#BEE3F8" : "#E8E8E8"
                        }
                        color="black"
                        borderRadius="lg"
                        px={3}
                        py={2}
                        maxW="70%"
                        wordBreak="break-word"
                      >
                        {m.content}
                      </Text>
                    </Box>
                  </div>
                ))}
              </div>
            )}
            <FormControl isRequired>
              <InputGroup size="md">
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={sendMessage}
                  isDisabled={sendingMessage}
                />
              </InputGroup>
            </FormControl>
            <Button
              colorScheme="blue"
              mt={2}
              onClick={sendMessageHandler}
              isLoading={sendingMessage}
              w="100%"
            >
              Send
            </Button>
          </Box>
        </>
      ) : (
        <Box
          d="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
          w="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Select a Chat to Start Messaging
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
