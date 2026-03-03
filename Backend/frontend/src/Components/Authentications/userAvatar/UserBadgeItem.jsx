import { Badge, Box, Avatar, HStack, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="full"
      variant="solid"
      bgGradient="linear(135deg, #667eea, #764ba2)"
      color="white"
      cursor="pointer"
      display="inline-flex"
      alignItems="center"
      gap={1}
    >
      <HStack spacing={1}>
        <Avatar size="2xs" name={user.name} src={user.pic || undefined} />
        <Text fontSize="xs" fontWeight="medium">
          {user.name}
        </Text>
        <Box
          as="span"
          onClick={handleFunction}
          _hover={{ opacity: 0.7 }}
          ml={1}
          display="flex"
          alignItems="center"
        >
          <CloseIcon boxSize="8px" />
        </Box>
      </HStack>
    </Badge>
  );
};

export default UserBadgeItem;