import { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "./ui/select";
import { useAccount } from "@starknet-react/core";
import { copyToClipboard, shortenAddress } from "../lib/utils";
import { MetaMaskAvatar } from "react-metamask-avatar";
import { ConnectButton } from "./wallet/ConnectButton";
import { Outlet } from "react-router-dom";
import { useControllerUsername } from "@/hooks";

const Navbar = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex items-center px-10 py-8 justify-between z-20 w-full">
      <a className="" href={"/"}>
        <p className="text-2xl font-semibold text-white">
          <span className="text-[#ff3f3f] mr-1">DOJO</span>
          MON
        </p>
      </a>

      <div className="flex gap-8 items-center">
        {/* <Select onValueChange={() => {}}>
          <SelectTrigger
            id="network"
            className="px-4 py-2 border text-white border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fff] focus:border-transparent"
          >
            <SelectValue placeholder="Select Network" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="84532">
              <div className="flex w-fit gap-2 items-center">
                <img src="/" height={25} width={25} alt="" />
                <p>Starknet</p>
              </div>
            </SelectItem>
            <SelectItem value="696969">
              <div className="flex w-fit gap-2 items-center">
                <img
                  src="/"
                  className="rounded-full"
                  height={25}
                  width={25}
                  alt=""
                />
                <p>Sepolia Devnet</p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select> */}
        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;
