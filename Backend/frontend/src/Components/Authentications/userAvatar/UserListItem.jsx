import React from "react";
import { Box, Avatar, Text, VStack, HStack } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        transform: "translateX(4px)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={4}
      py={3}
      mb={2}
      borderRadius="lg"
      transition="all 0.2s ease-in-out"
    >
      <Avatar
        src={user.pic}
        name={user.name}
        mr={4}
        size="md"
        _hover={{
          boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.3)",
        }}
      />
      <VStack spacing={0} align="start" flex={1}>
        <Text fontWeight="bold" fontSize="sm">
          {user.name}
        </Text>
        <Text fontSize="xs" opacity={0.7}>
          {user.email}
        </Text>
      </VStack>
    </Box>
  );
};

export default UserListItem;
