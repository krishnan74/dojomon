import { useContext, useState, useEffect } from "react";
import { useDojomonData } from "@/hooks/useDojomonData";
import { useAccount } from "@starknet-react/core";
import DojomonCard from "@/components/DojomonCard";
import { DojoContext } from "@/dojo-sdk-provider";
import { useParams } from "react-router-dom";
import { useLobbyData } from "@/hooks/useLobbyData";
import { Button } from "@/components/ui/button";
import { Howl } from "howler";
import { addAddressPadding } from "starknet";
import selectSoundAudio from "/assets/audio/GUI sel decision.ogg";

const SelectDojomon = () => {
  const { client } = useContext(DojoContext); // Access the Dojo SDK client
  const { account, address } = useAccount(); // Get user account details
  const { lobbyCode } = useParams<{ lobbyCode: string }>(); // Extract lobby code from URL params

  const { lobbySubscribeData, lobbyQueryData } = useLobbyData(
    account?.address,
    lobbyCode
  ); // Fetch lobby data
  const { dojomonQueryData } = useDojomonData(account?.address, undefined); // Fetch user's Dojomon data

  // States for readiness
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  const selectSound = new Howl({
    src: [selectSoundAudio],
    volume: 0.7,
  });

  // Update readiness states based on lobby subscription data

  useEffect(() => {
    const updateLobbyState = () => {
      const lobby_data =
        lobbySubscribeData.lobby_code !== 0
          ? lobbySubscribeData
          : lobbyQueryData;

      if (lobby_data) {
        const isHost =
          lobby_data.host_player.address === addAddressPadding(address!);

        setPlayerReady(
          isHost
            ? lobbySubscribeData.host_ready
            : lobbySubscribeData.guest_ready
        );

        setOpponentReady(
          isHost
            ? lobbySubscribeData.guest_ready
            : lobbySubscribeData.host_ready
        );

        if (lobbySubscribeData.host_ready && lobbySubscribeData.guest_ready) {
          isHost
            ? (window.location.href = `/battle/${lobbyCode}?my_dojomon_id=${lobbySubscribeData.host_dojomon.dojomon_id}&opponent_dojomon_id=${lobbySubscribeData.guest_dojomon.dojomon_id}`)
            : (window.location.href = `/battle/${lobbyCode}?my_dojomon_id=${lobbySubscribeData.guest_dojomon.dojomon_id}&opponent_dojomon_id=${lobbySubscribeData.host_dojomon.dojomon_id}`);
        }
      }
    };

    if (address) updateLobbyState();
  }, [lobbyQueryData, lobbySubscribeData, address]);

  // Handler for setting player readiness
  const handleReadyClick = async () => {
    selectSound.play();
    await client.lobby.readyForBattle(account!, lobbyCode!);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="grid grid-cols-3 gap-4">
        {dojomonQueryData ? (
          dojomonQueryData.map((dojomon_model, index) => (
            <DojomonCard
              //@ts-expect-error
              dojomon={dojomon_model.models.dojomon.Dojomon} // Pass Dojomon data to card
              key={index}
              client={client}
              account={account}
              lobby_code={lobbyCode || ""}
              in_battle={false}
            />
          ))
        ) : (
          <p className="text-white text-center col-span-3">
            Loading Dojomon...
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <Button
          className={`px-4 py-2 text-white ${
            playerReady ? "bg-green-500" : "bg-blue-500"
          }`}
          onClick={handleReadyClick}
          disabled={playerReady} // Disable button if already ready
        >
          {playerReady ? "Ready" : "Set Ready"}
        </Button>

        <p className="text-white">
          {opponentReady
            ? "Opponent is ready!"
            : "Waiting for opponent to select a Dojomon..."}
        </p>
      </div>
    </div>
  );
};

export default SelectDojomon;
