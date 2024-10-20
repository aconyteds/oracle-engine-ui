import React from "react";
import { Main } from "./Main";
import { Grid, GridItem } from "@chakra-ui/react";
import { Header } from "./Header";

export const Layout: React.FC = () => {
  return (
    <Grid
      templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
      gridTemplateRows={"auto 1fr auto"}
      gridTemplateColumns={"auto 1fr"}
      gap="1"
      color="blackAlpha.700"
      fontWeight="bold"
      height="100%"
      width="100%"
    >
      <GridItem p="2" area={"header"}>
        <Header />
      </GridItem>
      <GridItem pl="2" area={"nav"}>
        Nav
      </GridItem>
      <GridItem pl="2" area={"main"}>
        <Main />
      </GridItem>
      <GridItem pl="2" area={"footer"}>
        Footer
      </GridItem>
    </Grid>
  );
};
