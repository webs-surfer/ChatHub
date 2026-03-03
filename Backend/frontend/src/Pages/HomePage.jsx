import React from "react";
import { Box, Container, Tab, TabList, Tabs, Text, TabPanels, TabPanel, Img } from "@chakra-ui/react";
import Login from "../Components/Authentications/Login";
import SignUp from "../Components/Authentications/SignUp";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("userInfo");
    console.log("userInfo from storage:", raw);
    if (raw) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Box
      minH="100vh"
      w="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="linear-gradient(135deg, #cfdae4 0%, #4084d2 100%)"
      py={{ base: 4, md: 0 }}
    >
      <Container maxW="lg" centerContent>
        <Box
          display="flex"
          justifyContent="center"

          p={3}
          bg="white"
          w="100%"
          m="40px 0 15px 0"
          borderRadius="xl"
          boxShadow="2xl"
        > <Img src="ChatHub.png" paddingTop="3" h="4rem" alt="" />
          <Text fontSize="5xl" fontFamily="Work Sans" color="#1e88e5" fontWeight="bold" padding="0.5rem">
            ChatHub
          </Text>
        </Box>
        <Box
          bg="white"
          w="100%"
          p={4}
          borderRadius="xl"
          boxShadow="2xl"
        >
          <Tabs variant="soft-rounded" colorScheme="blue" isFitted>
            <TabList mb="1em">
              <Tab _selected={{ color: "white", bg: "#1e88e5" }}>Login</Tab>
              <Tab _selected={{ color: "white", bg: "#1e88e5" }}>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <SignUp />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
