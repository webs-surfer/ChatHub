import React, { useState, useRef } from "react";
import {
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  Text,
  useDisclosure,
  VStack,
  Box,
  Input,
  FormControl,
  FormLabel,
  Avatar,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
} from "@chakra-ui/react";
import { ViewIcon, EditIcon, CheckIcon, CloseIcon, AttachmentIcon } from "@chakra-ui/icons";
import API from "../../../api/axios";
import { ChatState } from "../../../Context/ChatProvider";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user: loggedUser, setUser } = ChatState();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const isOwnProfile = loggedUser?._id === user?._id;

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newPic, setNewPic] = useState(user?.pic || "");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadImageToCloudinary = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Please select an image file",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ChatHub");
    formData.append("cloud_name", "dlmtweduu");

    try {
      setUploading(true);
      setUploadProgress(30);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dlmtweduu/image/upload`,
        { method: "POST", body: formData }
      );

      setUploadProgress(80);
      const data = await res.json();

      if (data.secure_url) {
        setNewPic(data.secure_url);
        setUploadProgress(100);
        toast({
          title: "Image uploaded!",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: "Check your Cloudinary config",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleOpen = () => {
    setNewName(user?.name || "");
    setNewPic(user?.pic || "");
    setIsEditing(false);
    onOpen();
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      toast({
        title: "Name cannot be empty",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.put("/api/user/profile", {
        name: newName,
        pic: newPic,
      });

      // Update localStorage and context
      const updatedUser = { ...loggedUser, name: data.name, pic: data.pic };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Profile updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={handleOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={handleOpen}
          variant="ghost"
        />
      )}

      <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          {/* Header */}
          <ModalHeader
            bgGradient="linear(135deg, #667eea, #764ba2)"
            color="white"
            borderTopRadius="xl"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pr={10}
          >
            <Text fontSize="xl">{isEditing ? "Edit Profile" : user?.name}</Text>
            {isOwnProfile && !isEditing && (
              <IconButton
                icon={<EditIcon />}
                size=""
                mx="4"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                onClick={() => setIsEditing(true)}
              />
            )}
          </ModalHeader>
          <ModalCloseButton color="white" size="" my="4" mx="2"/>

          <ModalBody py={6} px={6}>
            {/* Avatar */}
            <Box display="flex" justifyContent="center" mb={5}>
              <Avatar
                size="2xl"
                name={isEditing ? newName : user?.name}
                src={isEditing ? newPic || undefined : user?.pic || undefined}
                boxShadow="0 4px 12px rgba(102, 126, 234, 0.4)"
              />
            </Box>

            {isEditing ? (
              /* Edit mode */
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                    Name
                  </FormLabel>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    focusBorderColor="purple.400"
                    borderRadius="md"
                    placeholder="Enter your name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">
                    Profile Picture
                  </FormLabel>
                  <Tabs variant="soft-rounded" colorScheme="purple" size="sm">
                    <TabList mb={3}>
                      <Tab fontSize="xs">Upload from device</Tab>
                      <Tab fontSize="xs">Paste URL</Tab>
                    </TabList>
                    <TabPanels>
                      {/* Upload from device */}
                      <TabPanel p={0}>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={(e) => uploadImageToCloudinary(e.target.files[0])}
                        />
                        <Button
                          leftIcon={<AttachmentIcon />}
                          onClick={() => fileInputRef.current.click()}
                          size="sm"
                          w="100%"
                          variant="outline"
                          colorScheme="purple"
                          isLoading={uploading}
                          loadingText="Uploading..."
                        >
                          Choose Image
                        </Button>
                        {uploadProgress > 0 && (
                          <Progress
                            value={uploadProgress}
                            size="xs"
                            colorScheme="purple"
                            borderRadius="full"
                            mt={2}
                          />
                        )}
                        {newPic && !uploading && (
                          <Text fontSize="xs" color="green.500" mt={1}>
                            ✓ Image ready
                          </Text>
                        )}
                      </TabPanel>

                      {/* Paste URL */}
                      <TabPanel p={0}>
                        <Input
                          value={newPic}
                          onChange={(e) => setNewPic(e.target.value)}
                          focusBorderColor="purple.400"
                          borderRadius="md"
                          placeholder="https://example.com/photo.jpg"
                          size="sm"
                        />
                        <Text fontSize="xs" color="gray.400" mt={1}>
                          Preview updates live above
                        </Text>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </FormControl>
              </VStack>
            ) : (
              /* View mode */
              <VStack spacing={3} align="stretch">
                <Box
                  bg="gray.50"
                  borderRadius="md"
                  px={4}
                  py={3}
                >
                  <Text fontSize="xs" fontWeight="semibold" color="gray.400" mb={1}>
                    NAME
                  </Text>
                  <Text fontWeight="medium">{user?.name}</Text>
                </Box>
                <Box
                  bg="gray.50"
                  borderRadius="md"
                  px={4}
                  py={3}
                >
                  <Text fontSize="xs" fontWeight="semibold" color="gray.400" mb={1}>
                    EMAIL
                  </Text>
                  <Text fontWeight="medium" color="gray.600">
                    {user?.email}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>

          {isEditing && (
            <ModalFooter gap={2} borderTop="1px solid" borderColor="gray.100">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<CloseIcon boxSize="10px" />}
                onClick={() => {
                  setIsEditing(false);
                  setNewName(user?.name || "");
                  setNewPic(user?.pic || "");
                }}
              >
                Cancel
              </Button>
              <Button
                bgGradient="linear(135deg, #667eea, #764ba2)"
                color="white"
                _hover={{ bgGradient: "linear(135deg, #5a6fd6, #6a3f9a)" }}
                size="sm"
                leftIcon={<CheckIcon />}
                onClick={handleSave}
                isLoading={loading}
              >
                Save Changes
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;