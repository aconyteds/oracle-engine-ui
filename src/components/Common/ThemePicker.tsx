import { useColorMode, Button } from "@chakra-ui/react";
import React from "react";

export const ThemePicker: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode}>
      Toggle {colorMode === "light" ? "Dark" : "Light"} Theme
    </Button>
  );
};
