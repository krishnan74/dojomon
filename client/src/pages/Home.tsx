import Navbar from "@/components/Navbar";
import React, { useContext, useEffect, useState } from "react";
import CharizardImage from "../../assets/website-design/charizard.png";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { PlayerStats, SchemaType } from "@/typescript/models.gen";
import { addAddressPadding } from "starknet";
import { useDojoStore } from "@/hooks/useDojoStore";
import { DojoContext } from "../dojo-sdk-provider";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { felt252ToString } from "@/lib/utils";
import { usePlayerData } from "@/hooks";
import { useAccount } from "@starknet-react/core";
import { useLobbyMatchMakingData } from "@/hooks/useLobbyMatchMakingData";
import { useLeaderBoardData } from "@/hooks/useLeaderBoardData";

const Home = () => {
  const { sdk } = useContext(DojoContext)!;
  const { address } = useAccount();
  const state = useDojoStore((state) => state);

  const { playerQueryData } = usePlayerData(address);
  const { lobby_code } = useLobbyMatchMakingData(address);
  const { leaderboardData } = useLeaderBoardData(address);

  return (
    <div className="min-h-screen flex flex-col relative bg-[#080C1D]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('../assets/website-design/bg_flipped_2.jpg')`,
          backgroundSize: "cover",
          backgroundPositionY: "-110px",
          backgroundPositionX: "-50px",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="z-10 text-gray-200 flex flex-col lg:flex-row items-start justify-between px-8 lg:px-24 mt-8 space-y-8 lg:space-y-0">
        {/* Left Content */}
        <div className="w-[60%] flex flex-col gap-7 ">
          <p className="text-gray-300 text-sm">
            Made using{" "}
            <svg
              viewBox="0 0 24 24"
              focusable="false"
              className="w-10 h-10 inline-block text-white"
            >
              <g transform="translate(-1, 0)">
                <path
                  fill="#ff3f3f"
                  d="M18.9058 8.79337C19.192 8.79337 19.471 8.67018 19.6775 8.45279L21.2934 7.19192C21.4058 7.10496 21.4746 6.96365 21.4746 6.81873V5.95279L3.47461 5.89844V6.66293C3.47461 6.80061 3.53258 6.92742 3.63041 7.018L5.24273 8.46365C5.45287 8.69916 5.74273 8.83322 6.04345 8.83322H7.32244V11.7318L6.65577 11.0506C6.44925 10.8368 6.15939 10.7137 5.85867 10.7137L3.80432 10.7028V13.3187L7.31881 13.3586V18.4818L7.93475 17.8695C7.93475 17.8695 9.73548 16.076 9.92751 15.8839L10.0326 15.7789V10.8731C10.0181 10.6955 10.0036 10.518 9.98186 10.3405C9.96012 10.1484 9.92388 9.95279 9.89852 9.76076C9.85504 9.46728 9.78983 9.18105 9.72461 8.89481C9.72461 8.88032 9.71736 8.87308 9.72461 8.85858C9.75722 8.81148 9.97099 8.76076 10.0253 8.78612C10.3478 8.94192 10.6884 9.0325 11.0507 9.04699C11.1558 9.05061 11.2608 9.05423 11.3659 9.05423L14.105 9.04699C14.4637 9.02887 14.8007 8.94192 15.1232 8.78612C15.1775 8.76076 15.3913 8.81148 15.4239 8.85858C15.4311 8.86945 15.4239 8.88032 15.4239 8.89481C15.3587 9.18105 15.2935 9.4709 15.25 9.76076C15.221 9.95279 15.1884 10.1448 15.1666 10.3405C15.1413 10.5434 15.1268 10.7499 15.1087 10.9528V15.739L17.7282 18.4781V13.355L21.4275 13.3151V10.6992L18.9927 10.71C18.6956 10.71 18.4058 10.8332 18.1956 11.047L17.7282 11.5252V8.79699H18.9058V8.79337Z"
                ></path>
                <path
                  fill="#ffffff"
                  d="M12.4746 13.7941C13.3949 13.7941 14.141 13.0481 14.141 12.1279C14.141 11.2074 13.3949 10.4614 12.4746 10.4614C11.5542 10.4614 10.8082 11.2074 10.8082 12.1279C10.8082 13.0481 11.5542 13.7941 12.4746 13.7941Z"
                ></path>
              </g>
            </svg>{" "}
            and Starknet
          </p>
          <h2 className="text-4xl font-extrabold leading-snug tracking-tight">
            Catch 'em! Collect Your Strongest and Rarest DojoMon
          </h2>
          {/* <p className="text-gray-500 text-sm">
            Catch all officially licensed DojoMons as NFTs and grow your
            unbeatable collection!
          </p> */}
          <button
            onClick={() => {
              playerQueryData != null
                ? (window.location.href = "/game")
                : (window.location.href = "/spawnPlayer");
            }}
            className="w-fit  bg-[#ff5656] hover:bg-[#ff4747] text-black px-8 py-3 rounded-md font-semibold text-lg shadow-md hover:shadow-lg transition "
          >
            Catch My Collection →
          </button>

          <Tabs defaultValue="leaderboard" className="w-[80%] bg-transparent">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-[50px] mb-5">
              <TabsTrigger
                value="leaderboard"
                className="  bg-[#1118279c] h-full mr-5 text-xs "
              >
                Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="hallOfFame"
                className="bg-[#1118279c] h-full text-xs"
              >
                Hall of Fame
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="">
              <Table className="shadow-sm rounded-lg overflow-hidden bg-transparent ">
                <TableBody className="text-xs">
                  <ScrollArea className="h-[200px]">
                    {leaderboardData?.map((leader_model, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer transition-colors border-none"
                      >
                        <TableCell className="py-3 px-4 font-medium w-4">
                          <div className="flex">
                            {index + 1 || "N/A"} <span>.</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-x-3">
                            <img
                              src="../assets/website-design/charizard.png"
                              width={20}
                              height={20}
                              alt=""
                            />
                            {felt252ToString(
                              // @ts-expect-error
                              leader_model.models.dojomon.PlayerStats.name
                            ) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          {
                            // @ts-expect-error
                            leader_model.models.dojomon.PlayerStats.league ||
                              "N/A"
                          }
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          {
                            // @ts-expect-error

                            leader_model.models.dojomon.PlayerStats.trophies ||
                              "N/A"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </ScrollArea>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="hallOfFame">
              <Table className="shadow-sm rounded-lg overflow-hidden bg-transparent ">
                <TableBody className="text-xs">
                  <ScrollArea className="h-[200px]">
                    {leaderboardData?.map((leader_model, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer transition-colors border-none"
                      >
                        <TableCell className="py-3 px-4 font-medium w-4">
                          <div className="flex">
                            {index + 1 || "N/A"} <span>.</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-x-3">
                            <img
                              src="../assets/website-design/charizard.png"
                              width={20}
                              height={20}
                              alt=""
                            />
                            {felt252ToString(
                              // @ts-expect-error
                              leader_model.models.dojomon.PlayerStats.name
                            ) || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          {
                            // @ts-expect-error
                            leader_model.models.dojomon.PlayerStats.league ||
                              "N/A"
                          }
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          {
                            // @ts-expect-error

                            leader_model.models.dojomon.PlayerStats.trophies ||
                              "N/A"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </ScrollArea>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Content */}
        <div className="  lg:w-[40%] flex justify-end   ">
          <div className="relative  h-[500px] w-[400px] rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80  rounded-xl"
              style={{
                backgroundImage: `url('../assets/website-design/flames.jpg')`,
                backgroundSize: "cover",
              }}
            ></div>

            <img
              src={CharizardImage}
              alt="Charizard"
              className="w-[400px] h-auto mx-auto absolute top-[-30px] left-[-200px] right-0 z-10"
            />
            <div className="mt-6 bg-gray-200 text-black p-6 rounded-lg shadow-lg absolute bottom-[-50px] left-[-100px] z-0 w-full ">
              <h3 className="text-2xl font-bold">Charizard</h3>
              <p className="text-gray-600 text-sm mt-2">Fire Type</p>
              <p className="text-4xl font-bold mt-4">$754.00</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
