import React from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
  Box,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

function Login() {
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const handleShowClick = () => setShow(!show);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/api/user/login", {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));

      toast({
        title: "Login Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ Wait for localStorage to be set before navigating
      setTimeout(() => navigate("/chats"), 500);

    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid email or password",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    handleLogin("demo@example.com", "demo123");
  };

  return (
    <VStack spacing={2} color="black">
      <FormControl isRequired>
        <FormLabel fontWeight="bold">Email Address</FormLabel>
        <Input
          id="login-email-input"
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
          borderRadius="md"
          focusBorderColor="#1e88e5"
          autoComplete="email"
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel fontWeight="bold">Password</FormLabel>
        <InputGroup>
          <Input
            id="login-password-input"
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setPassword(e.target.value)}
            borderRadius="md"
            focusBorderColor="#1e88e5"
            autoComplete="current-password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleShowClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Box w="100%">
        <Button
          colorScheme="blue"
          width="100%"
          onClick={() => handleLogin()}
          isLoading={loading}
          mb={3}
          borderRadius="md"
          fontSize="md"
          fontWeight="bold"
        >
          Login
        </Button>
        <Button
          width="100%"
          variant="outline"
          colorScheme="blue"
          onClick={handleDemoLogin}
          isLoading={loading}
          borderRadius="md"
        >
          Get Demo Credentials
        </Button>
      </Box>
    </VStack>
  );
}

export default Login;