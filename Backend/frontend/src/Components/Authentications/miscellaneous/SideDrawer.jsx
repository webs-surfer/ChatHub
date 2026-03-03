import {
  Button,
  useDisclosure,
  Input,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Tooltip,
  Avatar,
  useToast,
  Spinner,
  Badge,
  Skeleton,
  SkeletonCircle,
  Stack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { BellIcon, ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../../api/axios";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../../Context/ChatProvider";

// Pulse ring animation for the bell badge
const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
  70%  { box-shadow: 0 0 0 7px rgba(229, 62, 62, 0); }
  100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
`;

// Subtle bell shake when there are new notifications
const bellShake = keyframes`
  0%   { transform: rotate(0deg); }
  15%  { transform: rotate(14deg); }
  30%  { transform: rotate(-10deg); }
  45%  { transform: rotate(8deg); }
  60%  { transform: rotate(-5deg); }
  75%  { transform: rotate(3deg); }
  100% { transform: rotate(0deg); }
`;

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleOpen = async () => {
    onOpen();
    setSearch("");
    try {
      setLoading(true);
      const { data } = await API.get(`/api/user`);
      setAllUsers(data);
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.message || "Failed to Load Users",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const query = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  });

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await API.post(`/api/chat`, { userId });
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  const hasNotifications = notification.length > 0;

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderBottomWidth="1px"
        boxShadow="sm"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={handleOpen}>
            <HamburgerIcon fontSize="xl" />
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          ChatHub
        </Text>

        <Box display="flex" gap={2} alignItems="center">
          {/* ── NOTIFICATION BELL ── */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              p={2}
              position="relative"
              _hover={{ bg: "purple.50" }}
              borderRadius="xl"
            >
              {/* Bell icon with shake animation when unread */}
              <Box
                as="span"
                display="inline-flex"
                animation={hasNotifications ? `${bellShake} 1s ease 0.3s` : "none"}
              >
                <BellIcon
                  fontSize="2xl"
                  color={hasNotifications ? "purple.500" : "gray.500"}
                  transition="color 0.2s"
                />
              </Box>

              {/* Notification bubble */}
              {hasNotifications && (
                <Box
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  minW="18px"
                  h="18px"
                  px="5px"
                  bg="linear-gradient(135deg, #ff4e4e, #c0392b)"
                  color="white"
                  borderRadius="full"
                  fontSize="9px"
                  fontWeight="800"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="2px solid white"
                  animation={`${pulseRing} 1.8s ease-in-out infinite`}
                  letterSpacing="0.01em"
                  lineHeight="1"
                  zIndex={1}
                >
                  {notification.length > 99 ? "99+" : notification.length}
                </Box>
              )}
            </MenuButton>

            {/* Notification dropdown */}
            <MenuList
              minW="260px"
              borderRadius="xl"
              boxShadow="0 8px 30px rgba(0,0,0,0.12)"
              border="1px solid"
              borderColor="gray.100"
              overflow="hidden"
              p={0}
            >
              {/* Dropdown header */}
              <Box
                px={4}
                py={3}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              >
                <Text color="white" fontWeight="700" fontSize="sm">
                  Notifications
                </Text>
                {hasNotifications && (
                  <Text color="whiteAlpha.800" fontSize="xs">
                    {notification.length} unread message{notification.length > 1 ? "s" : ""}
                  </Text>
                )}
              </Box>

              {/* Empty state */}
              {!hasNotifications && (
                <Box px={4} py={6} textAlign="center">
                  <Text fontSize="2xl" mb={1}>🔔</Text>
                  <Text color="gray.400" fontSize="sm" fontWeight="500">
                    You're all caught up!
                  </Text>
                </Box>
              )}

              {/* Notification items */}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                  px={4}
                  py={3}
                  _hover={{ bg: "purple.50" }}
                  borderBottom="1px solid"
                  borderColor="gray.50"
                >
                  <Box display="flex" alignItems="center" gap={3} w="100%">
                    {/* Sender avatar */}
                    <Avatar
                      size="sm"
                      name={
                        notif.chat.isGroupChat
                          ? notif.chat.chatName
                          : getSender(user, notif.chat.users)
                      }
                      bg="purple.400"
                      flexShrink={0}
                    />
                    <Box flex={1} minW={0}>
                      <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                        {notif.chat.isGroupChat
                          ? notif.chat.chatName
                          : getSender(user, notif.chat.users)}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        noOfLines={1}
                      >
                        {notif.content?.length > 35
                          ? notif.content.substring(0, 35) + "..."
                          : notif.content}
                      </Text>
                    </Box>
                    {/* Unread dot */}
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="purple.500"
                      flexShrink={0}
                    />
                  </Box>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* ── PROFILE MENU ── */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
            >
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* ── SEARCH DRAWER ── */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            {loading ? (
              <Stack>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Box key={item} display="flex" alignItems="center" gap={3} p={2}>
                    <SkeletonCircle size="12" />
                    <Box flex={1}>
                      <Skeleton height="4" mb={2} />
                      <Skeleton height="3" width="70%" />
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              filteredUsers.map((u) => (
                <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => accessChat(u._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;