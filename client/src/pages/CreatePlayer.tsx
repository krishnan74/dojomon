import Navbar from "@/components/Navbar";
import { useControllerUsername, usePlayerData } from "@/hooks";
import { DojomonType } from "@/typescript bindings/models.gen";
import { useAccount } from "@starknet-react/core";
import React, { useContext, useEffect } from "react";
import { dojomonData } from "@/lib/utils";
import { DojoContext } from "@/dojo-sdk-provider";
import { usePlayerSpawnedData } from "@/hooks/events/usePlayerSpawnedData";

const CreatePlayer = () => {
  const { account, address } = useAccount();
  const { username } = useControllerUsername();
  const { client } = useContext(DojoContext);

  const { playerSpawnedSubscribeData } = usePlayerSpawnedData(address);

  useEffect(() => {
    if (playerSpawnedSubscribeData) {
      window.location.href = "/game";
    }
  }, [playerSpawnedSubscribeData]);

  const handleClick = async (dojomon_type: string) => {
    await client.actions.spawnPlayer(
      account!,
      username || "Player1",
      dojomon_type === "Fire"
        ? DojomonType.Fire
        : dojomon_type === "Water"
        ? DojomonType.Water
        : DojomonType.Grass
    );

    setTimeout(() => {
      window.location.href = "/game";
    }, 3000);
  };
  return (
    <div className="w-full  flex flex-col justify-center items-center">
      <Navbar />
      <h2 className="text-2xl ">Choose a Dojomon to start the game</h2>
      <div className="w-full  flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          Choose a Dojomon to start the game
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {dojomonData.map((dojomon, index) => (
            <div
              onClick={() => handleClick(dojomon.dojomon_type)}
              key={index}
              className={`bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center cursor-pointer 
          ${
            dojomon.dojomon_type === "Fire"
              ? "bg-red-100 hover:bg-red-300"
              : dojomon.dojomon_type === "Water"
              ? "bg-blue-100 hover:bg-blue-300"
              : "bg-green-100 hover:bg-green-300"
          }
          transition-all transform hover:scale-105 hover:shadow-2xl`}
            >
              <img
                src={`https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/detail/${dojomon.image_id}.png`} // Assuming you have images for each dojomon
                alt={dojomon.name}
                className="w-28 h-28 mb-4 rounded-full border-4 border-white shadow-md"
              />
              <h3 className="text-xl font-bold text-gray-800">
                {dojomon.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {dojomon.dojomon_type}
              </p>

              <div className="flex flex-col space-y-2 w-full">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    <strong>Health:</strong> {dojomon.health}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    <strong>Attack:</strong> {dojomon.attack}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    <strong>Defense:</strong> {dojomon.defense}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    <strong>Speed:</strong> {dojomon.speed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatePlayer;
