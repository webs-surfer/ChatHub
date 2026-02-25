import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const SignUp = () => {
  const [show, setShow] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pic, setPic] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const handleShowClick = () => setShow(!show);
  const handleSignUp = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      })
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    try {
      
      const { data } = await API.post("/api/user", { name, email, password, pic });
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate('/chats', { replace: true });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  }
  const PostDetails = (pics) => {
  setLoading(true);

  if (!pics) {
    toast({
      title: "Please select an image!",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setLoading(false);
    return;
  }

  if (
    pics.type === "image/jpeg" ||
    pics.type === "image/png" ||
    pics.type === "image/jpg"
  ) {
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "ChatHub");

    fetch("https://api.cloudinary.com/v1_1/dlmtweduu/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Cloudinary response:", data);
        setPic(data.secure_url);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Image upload failed",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      });
  } else {
    toast({
      title: "Please select a valid image (jpg / png)",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    setLoading(false);
  }
};


  return (
    <VStack spacing="5px">
      <FormControl id="signup-name-input" isRequired>
        <FormLabel fontWeight="bold">Name</FormLabel>
        <Input
          id="signup-name-input"
          type="text"
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
          borderRadius="md"
          focusBorderColor="#1e88e5"
          autoComplete="name"
        />
      </FormControl>
      <FormControl id="signup-email-input" isRequired>
        <FormLabel fontWeight="bold">Email Address</FormLabel>
        <Input
          id="signup-email-input"
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
          borderRadius="md"
          focusBorderColor="#1e88e5"
          autoComplete="email"
        />
      </FormControl>
      <FormControl id="signup-password-input" isRequired>
        <FormLabel fontWeight="bold">Password</FormLabel>
        <InputGroup>
          <Input
            id="signup-password-input"
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setPassword(e.target.value)}
            borderRadius="md"
            focusBorderColor="#1e88e5"
            autoComplete="new-password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleShowClick}>
              {show ? "Hide" : "Show"}
            </Button>

          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="signup-confirm-password-input" isRequired>
        <FormLabel fontWeight="bold">Confirm Password</FormLabel>
        <InputGroup>
          <Input
            id="signup-confirm-password-input"
            type={show ? "text" : "password"}
            placeholder="Confirm Your Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            borderRadius="md"
            focusBorderColor="#1e88e5"
            autoComplete="new-password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleShowClick}>
              {show ? "Hide" : "Show"}
            </Button>

          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="signup-pic-input">
        <FormLabel fontWeight="bold">Upload your Picture</FormLabel>
        <Input
          id="signup-pic-input"
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => PostDetails(e.target.files[0])}
          borderRadius="md"
        />
      </FormControl>
      <Button
        colorScheme="blue" width="100%" onClick={handleSignUp} isLoading={loading}
        borderRadius="md"
        fontSize="md"
        fontWeight="bold"
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
