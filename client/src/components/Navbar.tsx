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
import { copyToClipboard, shortenAddress } from "../utils";
import { MetaMaskAvatar } from "react-metamask-avatar";

const Navbar = () => {
  const { address } = useAccount();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex items-center px-8 py-4 justify-between border-b bg-white bg-opacity-90 ">
      <a className="" href={"/"}>
        <p className="text-2xl font-semibold text-gray-900">DOJOMON</p>
      </a>

      <div className="flex gap-8 items-center">
        <Select onValueChange={() => {}}>
          <SelectTrigger
            id="network"
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#845DCC] focus:border-transparent"
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
        </Select>

        <div className="relative">
          {address ? (
            <div>
              <span
                className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
                onClick={() => setShowDetails(!showDetails)}
              >
                {shortenAddress(address)}
              </span>
              {showDetails && (
                <div className="absolute right-0 mt-2 w-64 p-4 bg-white border rounded-lg shadow-lg">
                  <div className="flex items-center mb-2">
                    <MetaMaskAvatar address={address} size={24} />
                    <div className="ml-4">
                      <p className="text-sm font-semibold">
                        {" "}
                        {shortenAddress(address)}
                      </p>
                      <p className="text-sm text-gray-500">0 ETH</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(address)}
                    className="w-full text-sm"
                  >
                    Copy Address
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => {}}
              className="px-6 py-2 bg-[#845DCC] text-white rounded-lg hover:bg-[#6344A6] transition-colors"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
