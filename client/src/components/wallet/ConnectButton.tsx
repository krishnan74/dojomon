import { useControllerUsername } from "@/hooks";
import { shortenAddress } from "@/lib/utils";
import { Box, Button, HStack, Image, MenuItem, Text } from "@chakra-ui/react";
import {
  useAccount,
  /*useBalance,*/ useConnect,
  useDisconnect,
} from "@starknet-react/core";

import {
  Cartridge,
  ExternalLink,
  KatanaIcon,
  Trophy,
  WalletModal,
} from "../icons";
import { useContext, useEffect, useState } from "react";
import { ControllerConnector } from "@cartridge/connector";
import { DojoContext } from "@/dojo-sdk-provider";

export const ConnectButton = ({ variant = "pixelated", ...props }) => {
  const { account, address, status } = useAccount();
  const { connect, connectors, connector } = useConnect();
  const { disconnect } = useDisconnect();
  //const { uiStore } = useContext(DojoContext);
  const { username, isController } = useControllerUsername();

  const isBurnerOrPredeplyed = connector?.id.includes("dojo");

  const onClick = () => {
    if (connectors.length > 1) {
      //uiStore.openConnectModal();
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        className="text-white border px-8 hover:bg-[#ff3f3f]"
        {...props}
      >
        {!account && (
          <Button
            variant={"solid"}
            h={props.h ? props.h : "48px"}
            fontSize="14px"
            onClick={onClick}
            w="full"
          >
            Connect
          </Button>
        )}
        {account && (
          <Button
            variant={"solid"}
            h="48px"
            fontSize="14px"
            w="full"
            alignItems="center"
            justifyContent="center"
          >
            <HStack
              onClick={() => {
                if (isController) {
                  (
                    connector as unknown as ControllerConnector
                  ).controller.openProfile("trophies"); // "trophies"
                } else {
                  //uiStore.openAccountDetails();
                }
              }}
            >
              {connector && isBurnerOrPredeplyed && <KatanaIcon />}
              {connector && !isBurnerOrPredeplyed && !isController && (
                /// @ts-ignore
                <Image
                  src={
                    typeof connector.icon === "string"
                      ? connector.icon
                      : connector.icon.light
                  }
                  width="50px"
                  height="50px"
                  alt={connector.name}
                />
              )}
              {connector && isController && <Cartridge size={"2xl"} />}
              <Text>
                {isController
                  ? username
                  : shortenAddress(account.address || "")}
              </Text>
            </HStack>
            {isController && (
              <WalletModal
                mb={1}
                _hover={{ backgroundColor: "neon.500" }}
                borderRadius={3}
                onClick={() => {
                  //uiStore.openAccountDetails();
                }}
              />
            )}
          </Button>
        )}
      </Box>
    </>
  );
};

export const ConnectButtonMobile = ({ ...props }) => {
  const { account, address, status } = useAccount();
  const { connect, connectors, connector } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      {!account && (
        <MenuItem
          value="account"
          h="48px"
          borderRadius={0}
          onClick={() => connect({ connector: connectors[0] })}
          justifyContent="center"
        >
          CONNECT
        </MenuItem>
      )}
      {account && (
        <MenuItem
          value="account"
          h="48px"
          borderRadius={0}
          onClick={() => disconnect()}
        >
          <HStack w="full" /*justifyContent="center"*/>
            {/* @ts-ignore */}
            {connector && (
              <Image
                src={
                  typeof connector.icon === "string"
                    ? connector.icon
                    : connector.icon.light
                }
                width="24px"
                height="24px"
                alt={connector.name}
              />
            )}
            <Text>{shortenAddress(account.address || "")}</Text>
          </HStack>
        </MenuItem>
      )}
    </>
  );
};
