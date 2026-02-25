import { Box, Container } from "@chakra-ui/react";
import { useState } from "react";
import ChatBox from "../Components/Authentications/miscellaneous/ChatBox";
import Mychats from "../Components/Authentications/miscellaneous/Mychats";
import SideDrawer from "../Components/Authentications/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <Box 
      w="100%" 
      h="100vh" 
      display="flex" 
      flexDirection="column" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      backgroundAttachment="fixed"
    >
      {user && <SideDrawer />}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        w="100%" 
        h="calc(100vh - 60px)" 
        gap={{ base: 0, md: 4 }}
        p={{ base: "8px", md: "10px" }}
        overflow="hidden"
      >
        {user && <Mychats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </Box>
  );
};

export default Chatpage;