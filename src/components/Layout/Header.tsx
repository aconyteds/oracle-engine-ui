import React from "react";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { ThemePicker } from "../Common";

export const Header: React.FC = () => {
  return (
    <header>
      <Flex justifyContent="space-between">
        <Heading>Oracle-Engine</Heading>
        <Text>
          <ThemePicker />
        </Text>
      </Flex>
    </header>
  );
};
