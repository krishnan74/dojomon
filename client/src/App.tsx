// import { useContext, useEffect, useState } from "react";
// import { createDojoStore } from "@dojoengine/sdk";

// import {
//   DojomonType,
//   DojoBallType,
//   //ModelsMapping,
//   SchemaType,
//   LobbyType,
// } from "./typescript/models.gen.ts";

// import { useAccount } from "@starknet-react/core";
// import { WalletAccount } from "./wallet-account.tsx";
// import { DojoContext } from "./dojo-sdk-provider.tsx";
// import { usePlayerData } from "./hooks/usePlayerData.tsx";

// import {
//   Select,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
// } from "@/components/ui/select.tsx";

// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { felt252ToString, shortenAddress } from "./lib/utils.ts";
// import { useLobbyData } from "./hooks/useLobbyData.tsx";
// import { useDojomonData } from "./hooks/useDojomonData.tsx";
// import { Button } from "./components/ui/button.tsx";

// // import useModel from "./hooks/useModel.tsx";
// // import { useSystemCalls } from "./hooks/useSystemCalls.ts";
// // import { HistoricalEvents } from "./historical-events.tsx";
// // import { usePlayerActions } from "./hooks/usePlayerActions.tsx";

// /**
//  * Global store for managing Dojo game state.
//  */
// export const useDojoStore = createDojoStore<SchemaType>();

// /**
//  * Main application component that provides game functionality and UI.
//  * Handles entity subscriptions, state management, and user interactions.
//  *
//  * @param props.sdk - The Dojo SDK instance configured with the game schema
//  */
// function App() {
//   const { account } = useAccount();
//   const entities = useDojoStore((state) => state.entities);
//   const { playerQueryData, playerSubscribeData } = usePlayerData(
//     account?.address,
//     undefined
//   );
//   const { lobbySubscribeData, lobbyQueryData } = useLobbyData(
//     account?.address,
//     undefined,
//     false,
//     () => {}
//   );

//   const { client } = useContext(DojoContext);

//   const [name, setName] = useState("Krish");
//   const [lobbyType, setLobbyType] = useState<LobbyType>(LobbyType.Public);
//   const [enterLobbyCode, setEnterLobbyCode] = useState("");
//   const [friendAddress, setfriendAddress] = useState("");
//   const [selected_dojomon_id, setSelectedDojomonId] = useState(0);

//   const {
//     dojomonSubscribeData,
//     dojomonQueryData,
//     dojomonSelectedSubscribeData,
//   } = useDojomonData(account?.address, selected_dojomon_id);

//   return (
//     <div className=" min-h-screen w-full p-4 sm:p-8 bg-white">
//       <div className="mx-auto">
//         <div className="flex gap-x-5 ">
//           <WalletAccount />

//           <input
//             type="text"
//             className="border-black border text-black px-3 py-1"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />

//           <button
//             className="border-black border text-black px-3 py-1"
//             onClick={async () => {
//               await client.actions.spawnPlayer(
//                 account!,

//                 name,
//                 DojomonType.Fire
//               );
//             }}
//           >
//             Spawn Player
//           </button>

//           <button
//             className="border-black border text-black px-3 py-1"
//             onClick={async () => {
//               const lobbyCode = await client.actions.createLobby(
//                 account!,
//                 lobbyType
//               );
//               console.log(lobbyCode); // This will log the returned string (lobby ID)
//             }}
//           >
//             Create Lobby
//           </button>

//           <Select
//             onValueChange={(e) => {
//               switch (e) {
//                 case "public":
//                   setLobbyType(LobbyType.Public);
//                   break;
//                 case "private":
//                   setLobbyType(LobbyType.Private);
//                   break;
//               }
//             }}
//           >
//             <SelectTrigger
//               id="lobby_type"
//               className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#845DCC] focus:border-transparent"
//             >
//               <SelectValue placeholder="Select Lobby Type" />
//             </SelectTrigger>
//             <SelectContent position="popper">
//               <SelectItem value={"public"}>
//                 <div className="flex gap-2 items-center">
//                   <img src="/" height={25} width={25} alt="" />
//                   <p>Public</p>
//                 </div>
//               </SelectItem>

//               <SelectItem value={"private"}>
//                 <div className="flex gap-2 items-center">
//                   <img
//                     src="/"
//                     className="rounded-full"
//                     height={25}
//                     width={25}
//                     alt=""
//                   />
//                   <p>Private</p>
//                 </div>
//               </SelectItem>
//             </SelectContent>
//           </Select>

//           <div className="p-5 border-black border ">
//             <button
//               className="border-black border text-black px-3 py-1"
//               onClick={async () => {
//                 await client.actions.joinLobby(account!, enterLobbyCode);
//               }}
//             >
//               Join Lobby
//             </button>

//             <input
//               type="text"
//               className="border-black border text-black px-3 py-1"
//               value={enterLobbyCode}
//               onChange={(e) => setEnterLobbyCode(e.target.value)}
//             />
//           </div>

//           <div className="p-5 border-black border ">
//             <button
//               className="border-black border text-black px-3 py-1"
//               onClick={async () => {
//                 await client.actions.sendFriendRequest(account!, friendAddress);
//               }}
//             >
//               Send Friend Req
//             </button>

//             <input
//               type="text"
//               value={friendAddress}
//               className="border-black border text-black px-3 py-1"
//               onChange={(e) => setfriendAddress(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="flex gap-x-5 w-full">
//           <div className="flex gap-10 items-start mb-10">
//             <div className=" bg-white rounded-lg shadow-lg p-6 space-y-4">
//               <div className="text-center">
//                 <h2 className="text-sm font-semibold text-gray-800">
//                   Player Stats
//                 </h2>
//                 <div className="text-sm text-gray-600 mt-2">
//                   {felt252ToString(playerSubscribeData?.name)}
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Gold:</span>
//                   <span className="text-gray-900">
//                     {playerSubscribeData?.gold.toString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Level:</span>
//                   <span className="text-gray-900">
//                     {playerSubscribeData?.level.toString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">EXP:</span>
//                   <span className="text-gray-900">
//                     {playerSubscribeData?.exp.toString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Food:</span>
//                   <span className="text-gray-900">
//                     {playerSubscribeData?.food.toString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Trophies:</span>
//                   <span className="text-gray-900">
//                     {playerSubscribeData?.trophies.toString()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">League:</span>
//                   <span className="text-gray-900">
//                     {playerSubscribeData?.league.toString() || "N/A"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-10 items-start mb-10">
//             <div className=" bg-white rounded-lg shadow-lg p-6 space-y-4">
//               <h2 className="text-sm font-semibold text-gray-800">
//                 Lobby Data
//               </h2>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Lobby Code:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.lobby_code.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Host Player:</span>
//                 <span className="text-gray-900">
//                   {shortenAddress(lobbySubscribeData?.host_player) || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Guest Player:</span>
//                 <span className="text-gray-900">
//                   {shortenAddress(lobbySubscribeData?.guest_player) || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Host Ready:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.host_ready.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Guest Ready:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.guest_ready.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Host Dojomon:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.host_dojomon_id.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">
//                   Guest Dojomon:
//                 </span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.guest_dojomon_id.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Is Vacant:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.is_vacant.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Lobby Type:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.lobby_type.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Turn:</span>
//                 <span className="text-gray-900">
//                   {shortenAddress(lobbySubscribeData?.turn) || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Lobby League:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.lobby_league.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Lobby EXP:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.lobby_exp.toString() || "N/A"}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium text-gray-700">Lobby Level:</span>
//                 <span className="text-gray-900">
//                   {lobbySubscribeData?.lobby_level.toString() || "N/A"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <Table className=" bg-white shadow-sm rounded-lg overflow-hidden">
//             <TableCaption className="text-gray-600">
//               A list of your dojomons
//             </TableCaption>
//             <TableHeader>
//               <TableRow className="bg-blue-500 border-b border-blue-300 hover:bg-blue-500">
//                 <TableHead className="py-3 px-4 text-left  text-white">
//                   ID
//                 </TableHead>
//                 <TableHead className="py-3 px-4 text-left  text-white">
//                   Name
//                 </TableHead>
//                 <TableHead className="py-3 px-4 text-right  text-white">
//                   Actions
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {dojomonQueryData?.map((dojomon_model) => (
//                 <TableRow
//                   // @ts-expect-error
//                   key={dojomon_model.models.dojomon.Dojomon.dojomon_id}
//                   className="cursor-pointer hover:bg-gray-50 transition-colors"
//                 >
//                   <TableCell className="py-3 px-4 font-medium">
//                     {/* @ts-expect-error */}
//                     {dojomon_model.models.dojomon.Dojomon.dojomon_id?.toString() ||
//                       "N/A"}
//                   </TableCell>
//                   <TableCell className="py-3 px-4 font-medium">
//                     {felt252ToString(
//                       // @ts-expect-error
//                       dojomon_model.models.dojomon.Dojomon.name
//                     ) || "N/A"}
//                   </TableCell>
//                   <TableCell className="py-3 px-4 text-right">
//                     <Button
//                       onClick={() => {
//                         client.actions.selectDojomon(
//                           account!,
//                           lobbySubscribeData.lobby_code,
//                           //@ts-expect-error
//                           dojomon_model.models.dojomon.Dojomon.dojomon_id
//                         );
//                         setSelectedDojomonId(
//                           //@ts-expect-error
//                           dojomon_model.models.dojomon.Dojomon.dojomon_id
//                         );
//                       }}
//                       className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
//                     >
//                       Select
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <div className="flex gap-10 items-start mb-10">
//             <div className=" bg-white rounded-lg shadow-lg p-6 space-y-4">
//               <div className="text-center">
//                 <h2 className="text-sm font-semibold text-gray-800">
//                   Your Dojomon Stats
//                 </h2>
//                 <div className="text-sm text-gray-600 mt-2">
//                   {felt252ToString(dojomonSelectedSubscribeData?.name || "") ||
//                     "N/A"}
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Health:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.health?.toString() || "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Attack:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.attack?.toString() || "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Defense:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.defense?.toString() || "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Speed:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.speed?.toString() || "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Level:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.level?.toString() || "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Exp:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.exp?.toString() || "N/A"}
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-center text-sm">
//                   <span className="font-medium text-gray-700">Evolution:</span>
//                   <span className="text-gray-900">
//                     {dojomonSelectedSubscribeData?.evolution?.toString() ||
//                       "N/A"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <button
//           className="border-black border text-black px-3 py-1"
//           onClick={async () => {
//             await client.actions.buyDojoBall(
//               account!,
//               DojoBallType.Dojoball,
//               1,
//               "0",
//               false
//             );
//           }}
//         >
//           Buy DojoBall
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;
