import {
  Icon as ChakraIcon,
  IconProps as ChakraIconProps,
  ThemeProps,
} from "@chakra-ui/react";
import React from "react";

export interface IconProps extends ChakraIconProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "inherit" | "xs";
}

export const Icon = ({
  children,
  ...rest
}: { children: React.ReactElement<SVGPathElement> } & IconProps) => {
  return (
    <ChakraIcon viewBox="0 0 36 36" fill="currentColor" {...rest}>
      {children}
    </ChakraIcon>
  );
};

export * from "./Katana";
export * from "./Trophy";
export * from "./ExternalLink";
export * from "./WalletModal";
export * from "./Cartridge";
