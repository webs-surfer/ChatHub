import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  Tooltip,
  Text,
  Box,
  HStack,
  VStack,
  Avatar,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Divider,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { SettingsIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import API from "../../../api/axios";
import { ChatState } from "../../../Context/ChatProvider";
import UserListItem from "../userAvatar/UserListItem";
import UserBadgeItem from "../userAvatar/UserBadgeItem";

const GroupInfoModal = ({ fetchMessages, setFetchAgain, fetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();
  const toast = useToast();

  const [groupChatName, setGroupChatName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [leaveLoading, setLeaveLoading] = useState(false);

  const isAdmin = selectedChat?.groupAdmin?._id === user._id;

  const handleOpen = () => {
    setGroupChatName(selectedChat?.chatName || "");
    setSearch("");
    setSearchResult([]);
    onOpen();
  };

  const handleClose = () => {
    setGroupChatName("");
    setSearch("");
    setSearchResult([]);
    onClose();
  };

  // Rename group — admin only
  const handleRename = async () => {
    if (!groupChatName.trim() || groupChatName === selectedChat.chatName) return;
    try {
      setRenameLoading(true);
      const { data } = await API.put("/api/chat/rename", {
        chatId: selectedChat._id,
        chatName: groupChatName,
      });
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Group renamed!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Failed to rename group",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  // Search users to add
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return setSearchResult([]);
    try {
      setSearchLoading(true);
      const { data } = await API.get(`/api/user?search=${query}`);
      setSearchResult(data);
    } catch {
      toast({
        title: "Failed to search users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Add member — admin only
  const handleAddMember = async (memberToAdd) => {
    if (selectedChat.users.find((u) => u._id === memberToAdd._id)) {
      toast({
        title: "User already in group",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      const { data } = await API.put("/api/chat/groupAdd", {
        chatId: selectedChat._id,
        userId: memberToAdd._id,
      });
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setSearch("");
      setSearchResult([]);
      toast({
        title: `${memberToAdd.name} added!`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Failed to add member",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Remove member — admin only
  const handleRemoveMember = async (memberToRemove) => {
    try {
      const { data } = await API.put("/api/chat/groupRemove", {
        chatId: selectedChat._id,
        userId: memberToRemove._id,
      });
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: `${memberToRemove.name} removed`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Leave group
  const handleLeaveGroup = async () => {
    try {
      setLeaveLoading(true);
      await API.put("/api/chat/groupRemove", {
        chatId: selectedChat._id,
        userId: user._id,
      });
      setSelectedChat(null);
      setFetchAgain(!fetchAgain);
      handleClose();
      toast({
        title: "You left the group",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to leave group",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLeaveLoading(false);
    }
  };

  return (
    <>
      <Tooltip label="Group Info & Settings">
        <IconButton
          icon={<SettingsIcon />}
          variant="ghost"
          color="white"
          onClick={handleOpen}
          _hover={{ bg: "whiteAlpha.300" }}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" mx={4}>
          {/* Header */}
          <ModalHeader
            bgGradient="linear(135deg, #667eea, #764ba2)"
            color="white"
            borderTopRadius="xl"
            fontFamily="Work sans"
          >
            <HStack justify="space-between">
              <Text>{selectedChat?.chatName}</Text>
              <Badge
                bg="whiteAlpha.300"
                color="white"
                fontSize="xs"
                px={2}
                borderRadius="full"
                mr={7}
              >
                {selectedChat?.users?.length} members
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={5} px={5}>

            {/* Rename — admin only */}
            {isAdmin && (
              <>
                <FormControl mb={4}>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                    Group Name
                  </FormLabel>
                  <HStack>
                    <Input
                      value={groupChatName}
                      onChange={(e) => setGroupChatName(e.target.value)}
                      focusBorderColor="purple.400"
                      borderRadius="md"
                      size="sm"
                    />
                    <Button
                      size="sm"
                      bgGradient="linear(135deg, #667eea, #764ba2)"
                      color="white"
                      _hover={{ bgGradient: "linear(135deg, #5a6fd6, #6a3f9a)" }}
                      onClick={handleRename}
                      isLoading={renameLoading}
                      isDisabled={
                        !groupChatName.trim() ||
                        groupChatName === selectedChat?.chatName
                      }
                      px={5}
                    >
                      Save
                    </Button>
                  </HStack>
                </FormControl>
                <Divider mb={4} />
              </>
            )}

            {/* Members list */}
            <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>
              Members
            </Text>
            <Box maxH="180px" overflowY="auto" mb={4}>
              <VStack spacing={2} align="stretch">
                {selectedChat?.users?.map((member) => (
                  <HStack
                    key={member._id}
                    justify="space-between"
                    p={2}
                    borderRadius="md"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={member.name} src={member.pic || undefined} />
                      <VStack spacing={0} align="start">
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {member.name}
                          </Text>
                          {selectedChat.groupAdmin?._id === member._id && (
                            <Badge colorScheme="purple" fontSize="xs">
                              Admin
                            </Badge>
                          )}
                          {member._id === user._id && (
                            <Badge colorScheme="green" fontSize="xs">
                              You
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {member.email}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Admin can remove others (not themselves) */}
                    {isAdmin && member._id !== user._id && (
                      <Tooltip label={`Remove ${member.name}`}>
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member)}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Add member — admin only */}
            {isAdmin && (
              <>
                <Divider mb={4} />
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                    Add Member
                  </FormLabel>
                  <Input
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    focusBorderColor="purple.400"
                    borderRadius="md"
                    size="sm"
                    mb={2}
                  />
                  {searchLoading ? (
                    <Spinner size="sm" color="purple.500" />
                  ) : (
                    <Box maxH="150px" overflowY="auto">
                      {searchResult
                        .filter(
                          (u) => !selectedChat.users.find((m) => m._id === u._id)
                        )
                        .slice(0, 4)
                        .map((u) => (
                          <UserListItem
                            key={u._id}
                            user={u}
                            handleFunction={() => handleAddMember(u)}
                          />
                        ))}
                    </Box>
                  )}
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="gray.100" pt={3}>
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={handleLeaveGroup}
              isLoading={leaveLoading}
              w="full"
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupInfoModal;