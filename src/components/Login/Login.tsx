import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  Button,
  Input,
  VStack,
  Text,
  FormControl,
  Container,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const allowRegistration = import.meta.env.VITE_ALLOW_REGISTRATION === "true";

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      setError("Failed to log in. Please check your credentials.");
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      setError("Failed to register. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (e) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Flex justifyContent="center" alignItems="center" height="100vh">
      <Container>
        <form onSubmit={onSubmit}>
          <VStack spacing={4} align="stretch">
            <Heading>Welcome to Oracle-Engine</Heading>
            <FormControl>
              <Text>Email</Text>
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Text>Password</Text>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            {error && <Text color="red.500">{error}</Text>}
            <Button type="submit" colorScheme="blue" onClick={handleLogin}>
              Login
            </Button>
            {allowRegistration && (
              <Button colorScheme="green" onClick={handleRegister}>
                Register
              </Button>
            )}
            (
            <Button colorScheme="red" onClick={handleGoogleSignIn}>
              Sign in with Google
            </Button>
            )
          </VStack>
        </form>
      </Container>
    </Flex>
  );
};
