import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ChatBox from "../Components/Authentications/miscellaneous/ChatBox";
import Mychats from "../Components/Authentications/miscellaneous/Mychats";
import SideDrawer from "../Components/Authentications/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();
  
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/"); 
    }
  }, []);
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
        w="100%"
        flex="1"
        minH="0"
        p="10px"
        gap="16px"
        overflow="hidden"
      >
        {user && (
          <Mychats
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}

        {user && (
          <ChatBox
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
      </Box>
    </Box>
  );
};

export default Chatpage;