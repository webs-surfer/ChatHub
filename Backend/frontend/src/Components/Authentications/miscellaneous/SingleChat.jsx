import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Text,
  Input,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  FormControl,
  InputGroup,
  InputRightElement,
  Avatar,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { ArrowBackIcon, ViewIcon, ArrowRightIcon } from "@chakra-ui/icons";
import API from "../../../api/axios";
import { ChatState } from "../../../Context/ChatProvider";
import { getSender, getSenderFull } from "../../../config/ChatLogics";
import ProfileModal from "./ProfileModal";
import GroupInfoModal from "./GroupInfoModal";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animation from "../../../animations/typing.json";
const ENDPOINT = process.env.NODE_ENV === "production"
  ? window.location.origin
  : "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
  } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toast = useToast();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // FIX 1: Added [] so socket is only initialized once, and cleanup is returned
  // FIX 2: socket is assigned here before any other useEffect can use it
  useEffect(() => {
    socket = io(ENDPOINT);
    console.log("Connecting to Socket.io server...");
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
    socket.on("removed from group", (chatId) => {
      if (selectedChatCompare?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    });

    // FIX 3: Cleanup socket listeners on unmount to prevent memory leaks
    return () => {
      socket.off("connected");
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("removed from group");
      socket.disconnect();
    };
  }, []);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const { data } = await API.get(`/api/message/${selectedChat._id}`);
      setMessages(data);
      setLoading(false);

      // FIX 4: Guard against socket being undefined before emitting
      if (socket) {
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    // Clear the previous timeout before setting a new one
    // This resets the 3 second timer on every keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // FIX 6: Actually set the notification instead of empty comment
        setNotification((prev) => {
          const alreadyExists = prev.some(
            (n) => n._id === newMessageReceived._id
          );
          if (alreadyExists) return prev;
          return [newMessageReceived, ...prev];
        });
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", handleMessageReceived);


    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, []); // [] is correct — selectedChatCompare is a module-level ref, not state

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessageHandler = async () => {
    if (!newMessage.trim()) return;
    socket.emit("stop typing", selectedChat._id);
    setTyping(false);
    try {
      setSendingMessage(true);
      const { data } = await API.post("/api/message", {
        content: newMessage,
        chatId: selectedChat._id,
      });

      if (socket) {
        socket.emit("new message", data);
      }

      setMessages([...messages, data]);
      setNewMessage("");
      setFetchAgain(!fetchAgain);
      setSendingMessage(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setSendingMessage(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex="1"
      minH="0"
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"
    >
      {selectedChat ? (
        <>
          {/* HEADER */}
          <Box
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            px={5}
            py={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexShrink={0}
          >
            <HStack spacing={3}>
              <Tooltip label="Go Back">
                <IconButton
                  display={{ base: "flex", md: "none" }}
                  icon={<ArrowBackIcon />}
                  onClick={() => setSelectedChat(null)}
                  variant="ghost"
                  color="white"
                />
              </Tooltip>

              {selectedChat.isGroupChat ? (
                <VStack spacing={0} align="start">
                  <Text color="white" fontWeight="bold">
                    {selectedChat.chatName}
                  </Text>
                  <Badge colorScheme="purple">Group</Badge>
                </VStack>
              ) : (
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={getSender(user, selectedChat.users)}
                    src={
                      selectedChat.users.find((u) => u._id !== user._id)?.pic ||
                      undefined
                    }
                  />
                  <Text color="white" fontWeight="bold">
                    {getSender(user, selectedChat.users)}
                  </Text>
                </HStack>
              )}
            </HStack>

            {!selectedChat.isGroupChat && (
              <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                <IconButton
                  icon={<ViewIcon />}
                  variant="ghost"
                  color="white"
                />
              </ProfileModal>
            )}

            {selectedChat.isGroupChat && (
              <GroupInfoModal
                fetchMessages={fetchMessages}
                setFetchAgain={setFetchAgain}
                fetchAgain={fetchAgain}
              />
            )}
          </Box>

          {/* MESSAGES AREA */}
          <Box flex="1" minH="0" overflowY="auto" px={5} py={4}>
            {loading ? (
              <VStack h="100%" justify="center">
                <Spinner />
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {messages.map((m) => {
                  // FIX: use toString() on both sides to avoid ObjectId vs string mismatch
                  const isMyMessage = m.sender._id.toString() === user._id.toString();

                  return (
                    <HStack
                      key={m._id}
                      justify={isMyMessage ? "flex-end" : "flex-start"}
                      align="flex-end"
                    >
                      {!isMyMessage && (
                        <Tooltip label={m.sender.name} placement="left">
                          <Avatar
                            size="xs"
                            name={m.sender.name}
                            src={m.sender.pic || undefined}
                          />
                        </Tooltip>
                      )}

                      <Box
                        bg={isMyMessage ? "purple.500" : "gray.200"}
                        color={isMyMessage ? "white" : "black"}
                        px={4}
                        py={2}
                        borderRadius="lg"
                        maxW="65%"
                        wordBreak="break-word"
                      >
                        <Text fontSize="sm">{m.content}</Text>
                      </Box>

                      {isMyMessage && (
                        <Tooltip label={user.name} placement="right">
                          <Avatar
                            size="xs"
                            name={user.name}
                            src={user.pic || undefined}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  );
                })}
                {isTyping && (
                  <HStack justify="flex-start" align="flex-end" mb={1}>
                    <Box
                      display="inline-flex"
                      alignItems="center"

                    >
                      <Lottie
                        width={50}
                        height={20}

                        options={defaultOptions}
                        style={{ marginTop: 5, marginBottom: -10, display: "block" }}
                      />
                    </Box>
                  </HStack>
                )}
                <div ref={messagesEndRef} />
              </VStack>
            )}
          </Box>

          {/* INPUT */}
          <Box p={4} borderTop="1px solid #E2E8F0" flexShrink={0}>
            <FormControl>

              <InputGroup>

                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessageHandler()
                  }
                  isDisabled={sendingMessage}
                />
                <InputRightElement>
                  <IconButton
                    icon={<ArrowRightIcon />}
                    size="sm"
                    onClick={sendMessageHandler}
                    isLoading={sendingMessage}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
        </>
      ) : (
        <VStack flex="1" justify="center">
          <Text>Select a chat to start messaging</Text>
        </VStack>
      )}
    </Box>
  );
};

export default SingleChat;