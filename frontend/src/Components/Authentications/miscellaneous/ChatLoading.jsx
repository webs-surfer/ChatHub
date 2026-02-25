import React from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";

const ChatLoading = () => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" p={4}>
      <Spinner size="lg" mr={3} />
      <Text>Loading...</Text>
    </Box>
  );
};

export default ChatLoading;
