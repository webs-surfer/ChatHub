import {
  Box,
  Stack,
  Text,
  useToast,
  Spinner,
  Badge,
  Avatar,
  VStack,
  HStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// Pulse animation for the notification bubble
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(229, 62, 62, 0); }
  100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
`;

// Reusable styled notification bubble
const UnreadBubble = ({ count }) => (
  <Box
    as="span"
    minW="20px"
    h="20px"
    px="6px"
    bg="linear-gradient(135deg, #ff4e4e, #c0392b)"
    color="white"
    borderRadius="full"
    fontSize="10px"
    fontWeight="800"
    display="flex"
    alignItems="center"
    justifyContent="center"
    letterSpacing="0.02em"
    boxShadow="0 2px 6px rgba(192, 57, 43, 0.5)"
    animation={`${pulse} 1.8s ease-in-out infinite`}
    flexShrink={0}
  >
    {count > 99 ? "99+" : count}
  </Box>
);
import { AddIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { ChatState } from "../../../Context/ChatProvider";
import { getSender } from "../../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import UserBadgeItem from "../userAvatar/UserBadgeItem";

const Mychats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Group chat modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // ✅ Added notification and setNotification from context
  const { selectedChat, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/api/chat`);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
    fetchChats();
  }, [fetchAgain]);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return setSearchResult([]);
    try {
      setSearchLoading(true);
      const { data } = await API.get(`/api/user?search=${query}`);
      setSearchResult(data);
    } catch (err) {
      toast({
        title: "Failed to load search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddUser = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleCreateGroup = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toast({
        title: "Please fill all fields",
        description: "Group name and at least 2 users are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setCreateLoading(true);
      const { data } = await API.post("/api/chat/group", {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });
      setChats([data, ...chats]);
      toast({
        title: "Group chat created!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Failed to create group chat",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setGroupChatName("");
    setSelectedUsers([]);
    setSearch("");
    setSearchResult([]);
  };

  return (
    <>
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDir="column"
        alignItems="center"
        p={3}
        bg="white"
        w={{ base: "100%", md: "31%" }}
        borderRadius="lg"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        h="100%"
        overflow="hidden"
      >
        {/* Header */}
        <Box
          px={3}
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="Work sans"
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          borderRadius="lg"
          mb={2}
          py={4}
        >
          <Text fontWeight="bold">My Chats</Text>
          <Button
            size="sm"
            leftIcon={<AddIcon />}
            onClick={onOpen}
            bg="whiteAlpha.300"
            color="white"
            _hover={{ bg: "whiteAlpha.400" }}
            _active={{ bg: "whiteAlpha.500" }}
            borderRadius="md"
            fontWeight="semibold"
            fontSize="xs"
          >
            New Group
          </Button>
        </Box>

        {/* Chat List */}
        <Box
          display="flex"
          flexDir="column"
          p={3}
          bg="linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)"
          w="100%"
          h="100%"
          borderRadius="lg"
          overflow="hidden"
          overflowY="auto"
        >
          {loading ? (
            <VStack h="100%" justifyContent="center" spacing={3}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="purple.500"
                size="lg"
              />
              <Text color="gray.500">Loading chats...</Text>
            </VStack>
          ) : !chats || chats.length === 0 ? (
            <VStack h="100%" justifyContent="center" spacing={2}>
              <Text color="gray.400" fontSize="lg">No chats yet</Text>
              <Text color="gray.300" fontSize="sm">Start a conversation!</Text>
            </VStack>
          ) : (
            <Stack spacing={2}>
              {chats.map((chat) => {
                // ✅ Count unread notifications for this specific chat
                const unreadCount = notification.filter(
                  (n) => n.chat._id === chat._id
                ).length;

                return (
                  <Box
                    // ✅ On click: select chat AND clear its notifications
                    onClick={() => {
                      setSelectedChat(chat);
                      setNotification((prev) =>
                        prev.filter((n) => n.chat._id !== chat._id)
                      );
                    }}
                    cursor="pointer"
                    bg={
                      selectedChat === chat
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "#E8E8E8"
                    }
                    color={selectedChat === chat ? "white" : "black"}
                    px={3}
                    py={3}
                    borderRadius="lg"
                    key={chat._id}
                    _hover={{
                      bg:
                        selectedChat === chat
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#E0E0E0",
                      transform: "translateX(4px)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={3} mb={2}>
                      {chat.isGroupChat ? (
                        <>
                          <Avatar size="md" name={chat.chatName} bg="purple.500" />
                          <VStack spacing={0} align="start" flex={1}>
                            {/* ✅ Badge shown next to group name */}
                            <HStack justify="space-between" w="100%">
                              <Text fontWeight="bold" fontSize="sm">
                                {chat.chatName}
                              </Text>
                              {unreadCount > 0 && <UnreadBubble count={unreadCount} />}
                            </HStack>
                            <Badge colorScheme="purple" fontSize="xs">
                              Group Chat
                            </Badge>
                          </VStack>
                        </>
                      ) : (
                        <>
                          <Avatar
                            size="md"
                            name={getSender(loggedUser, chat.users)}
                            src={
                              chat.users?.find((u) => u?._id !== loggedUser?._id)?.pic
                            }
                          />
                          <VStack spacing={0} align="start" flex={1}>
                            {/* ✅ Badge shown next to sender name */}
                            <HStack justify="space-between" w="100%">
                              <Text fontWeight="bold" fontSize="sm">
                                {getSender(loggedUser, chat.users)}
                              </Text>
                              {unreadCount > 0 && <UnreadBubble count={unreadCount} />}
                            </HStack>
                            <Text fontSize="xs" opacity={0.7}>
                              {chat.users?.find((u) => u?._id !== loggedUser?._id)?.email}
                            </Text>
                          </VStack>
                        </>
                      )}
                    </HStack>

                    {chat.latestMessage && (
                      <Text fontSize="xs" opacity={0.8} ml={12}>
                        <b>{chat.latestMessage.sender?.name}:</b>{" "}
                        {chat.latestMessage.content?.length > 30
                          ? chat.latestMessage.content.substring(0, 30) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      {/* New Group Chat Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader
            bgGradient="linear(135deg, #667eea, #764ba2)"
            color="white"
            borderTopRadius="xl"
            fontFamily="Work sans"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={4}>
            <FormControl mb={3}>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                Group Name
              </FormLabel>
              <Input
                placeholder="e.g. Weekend Squad"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                focusBorderColor="purple.400"
                borderRadius="md"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                Add Members
              </FormLabel>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                focusBorderColor="purple.400"
                borderRadius="md"
              />
            </FormControl>

            {/* Selected users badges */}
            {selectedUsers.length > 0 && (
              <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleRemoveUser(u)}
                  />
                ))}
              </Box>
            )}

            {/* Search results */}
            {searchLoading ? (
              <Spinner size="sm" color="purple.500" />
            ) : (
              <Box maxH="180px" overflowY="auto">
                {searchResult.slice(0, 5).map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleAddUser(u)}
                  />
                ))}
              </Box>
            )}
          </ModalBody>

          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={handleClose} size="sm">
              Cancel
            </Button>
            <Button
              bgGradient="linear(135deg, #667eea, #764ba2)"
              color="white"
              _hover={{ bgGradient: "linear(135deg, #5a6fd6, #6a3f9a)" }}
              onClick={handleCreateGroup}
              isLoading={createLoading}
              size="sm"
              borderRadius="md"
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Mychats;