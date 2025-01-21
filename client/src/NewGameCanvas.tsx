import React, { useContext, useEffect, useRef, useState } from "react";
import { asGridCoord, felt252ToString, withGrid } from "./lib/utils";
import { DirectionInput } from "./classes/DirectionInput";
import { Person } from "./classes/Person";
import { GameObject } from "./classes/GameObject";
import { OverworldMap } from "@/classes/OverworldMap";

import Profile from "../assets/game-ui/pfp.jpg";
import Trophy from "../assets/game-ui/trophy.png";
import Gold from "../assets/game-ui/gold.png";
import Carrot from "../assets/game-ui/carrot.png";
import PokemonPfp from "../assets/game-ui/pokemon_profile.png";
import BattleLogo from "../assets/game-ui/battle.png";
import { FarmManager } from "./classes/FarmManager";
import { usePlayerData } from "./hooks";
import { useAccount } from "@starknet-react/core";
import { LobbyType, PlayerStats } from "./typescript/models.gen";
import { DojoContext } from "./dojo-sdk-provider";
import { useLobbyMatchMakingData } from "./hooks/useLobbyMatchMakingData";
import { useLobbyCreatedData } from "./hooks/events/useLobbyCreatedData";
import { useNavigate } from "react-router-dom";
import { usePlayerJoinedData } from "./hooks/events/usePlayerJoinedData";

const NewGameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { client } = useContext(DojoContext);

  const { account, address } = useAccount();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [farmState, setFarmState] = useState({
    isFarming: false,
    isHarvesting: false,
    isHarvestReady: false,
  });

  const { playerQueryData, playerSubscribeData } = usePlayerData(address!);

  const [isLoading, setIsLoading] = useState(false); // Add a loading state
  const [clickedBattle, setClickedBattle] = useState(false);

  const { lobby_code } = useLobbyMatchMakingData(
    address!,
    clickedBattle,
    playerQueryData?.league,
    playerQueryData?.level
  );

  const { lobbyCreatedEventData } = useLobbyCreatedData(address!);
  const { playerJoinedEventData } = usePlayerJoinedData(address!);
  const navigate = useNavigate(); // Using React Router's navigate for redirection

  const [isPokemonNearBy, setIsPokemonNearBy] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const viewportSize = {
      width: 1200,
      height: 650,
    };

    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;

    const backgroundImage = new Image();
    backgroundImage.src = "../assets/game-assets/dojomon-base-map2.png";

    const foregroundImage = new Image();
    foregroundImage.src =
      "../assets/game-assets/dojomon-base-map-foreground.png";

    const cropImg = new Image();
    cropImg.src = "../assets/crop4.png";

    const directionInput = new DirectionInput();
    directionInput.init();

    const hero = new Person({
      x: withGrid(25),
      y: withGrid(18),
      isPlayerControlled: true,
    });

    const npc1 = new GameObject({
      x: withGrid(38),
      y: withGrid(18),
      src: "../assets/characters/npc1.png",
    });

    const pokemon1 = new GameObject({
      x: withGrid(20),
      y: withGrid(23),
      src: "../assets/dojomons/front/SQUIRTLE.png",
    });

    const demoMapConfig = {
      walls: {},
      gameObjects: {
        hero,
        npc1,
      },
    };

    const overworldMap = new OverworldMap(demoMapConfig);
    const farmManager = new FarmManager(
      {
        start: withGrid(26),
        end: withGrid(32),
      },
      {
        start: withGrid(24),
        end: withGrid(25),
      }
    );

    const renderedSprites = [hero, npc1];
    const renderedCrops: GameObject[] = [];

    const isPlayerNear = (
      playerX: number,
      playerY: number,
      pokemonX: number,
      pokemonY: number,
      range = withGrid(1)
    ) => {
      const withinX =
        playerX >= pokemonX - range && playerX <= pokemonX + range;
      const withinY =
        playerY >= pokemonY - range && playerY <= pokemonY + range;
      return withinX && withinY;
    };

    const update = () => {
      hero.update({ arrow: directionInput.direction, map: overworldMap });
      hero.updateSprite({
        arrow: directionInput.direction,
      });
      if (isPokemonNearBy) {
        setIsPokemonNearBy(false);
      }
      if (isPlayerNear(hero.x, hero.y, withGrid(20), withGrid(23))) {
        console.log("Pokemon interacted");
        setIsPokemonNearBy(true);
      }

      if (farmState.isFarming) {
        console.log("Farming...");
        farmManager.startFarming(ctx, renderedCrops);

        return;
      }
      if (
        !farmState.isFarming &&
        !farmState.isHarvestReady &&
        !farmManager.hasInteracted &&
        farmManager.isPlayerAtFarm(hero.x, hero.y)
      ) {
        farmManager.hasInteracted = true;
        setIsPopupVisible(true);
        console.log("Farm interacted");
      }
      if (farmState.isHarvestReady) {
        setIsPopupVisible(true);
        console.log("Ready for Harvesting...");
      }
      if (farmState.isHarvesting) {
        setIsPopupVisible(false);
        farmManager.harvest(ctx, renderedCrops);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);

      const cameraX = hero.x - withGrid(10);
      const cameraY = hero.y - withGrid(5.5);

      ctx.drawImage(
        backgroundImage,

        -cameraX,
        -cameraY
      );

      renderedCrops.forEach((crop) => {
        crop.sprite.drawCrop({ ctx, cameraX, cameraY });
      });

      renderedSprites.forEach((sprite) => {
        sprite.sprite.draw({ ctx, cameraX, cameraY });
      });

      pokemon1.sprite.drawPokemon({ ctx, cameraX, cameraY });

      // Render game objects (hero and NPCs)
      hero.sprite.draw({
        ctx,
        cameraX,
        cameraY,
      });

      ctx.drawImage(
        foregroundImage,
        -cameraX - backgroundImage.x,
        -cameraY - backgroundImage.y
      );
    };

    const gameLoop = () => {
      update();
      render();
      requestAnimationFrame(gameLoop);
    };

    backgroundImage.onload = () => {
      gameLoop();
    };
  }, []);

  const handleStartBattle = async () => {
    if (isLoading) return; // Prevent further execution if already loading
    setIsLoading(true); // Set loading flag to true when starting battle

    if (!lobby_code || lobby_code === "No Lobbies Found") {
      console.log("Creating lobby...");
      await client.lobby.createLobby(account!, LobbyType.Public);
      setClickedBattle(false);
    } else {
      console.log("Joining lobby...");
      await client.lobby.joinLobby(account!, lobby_code!);
      setClickedBattle(false);
    }

    setIsLoading(false); // Reset loading flag after operation
  };

  const handleStartFarming = () => {
    setIsPopupVisible(false);
    farmState.isFarming = true;
    setTimeout(() => {
      farmState.isFarming = false;
      farmState.isHarvestReady = true;
    }, 10000);
  };

  const handleHarvest = async () => {
    await client.actions.harvestFood(account!, 20);
    setIsPopupVisible(false);
    farmState.isHarvesting = true;
    farmState.isFarming = false;
    setTimeout(() => {
      farmState.isHarvesting = false;
      farmState.isHarvestReady = false;
    }, 200);
  };

  useEffect(() => {
    if (farmState.isHarvestReady) {
      setIsPopupVisible(true);
    }
  }, [farmState.isHarvestReady]);

  useEffect(() => {
    if (clickedBattle && lobby_code != null) {
      handleStartBattle();
    }

    // Navigate to the created lobby if lobbyCreatedEventData is present
    if (lobbyCreatedEventData && lobbyCreatedEventData?.player === address) {
      navigate(`/lobby/${lobbyCreatedEventData.lobby_code}`);
    }

    if (playerJoinedEventData && playerJoinedEventData?.player === address) {
      navigate(`/selectYourDojomon/${playerJoinedEventData.lobby_code}`);
    }
  }, [
    lobby_code,
    lobbyCreatedEventData,
    playerJoinedEventData,
    clickedBattle,
    navigate,
  ]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="absolute w-[1200px] h-[650px]">
        {/* Top Left */}
        <div className="absolute top-0 left-0 p-3 m-3 h-[70px] w-1/4 flex items-center bg-white border-2 border-black">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <img
              src={Profile}
              alt="Profile"
              width={50}
              className="rounded-md"
            />
          </div>

          {/* Info Section */}
          <div className="ml-3 w-full relative">
            {/* Health Bar */}

            <p>
              {playerSubscribeData
                ? felt252ToString(playerSubscribeData?.name)
                : felt252ToString(playerQueryData?.name)}
            </p>

            <span className="text-xs ml-6 rounded-full p-1 bg-green-300 absolute right-0 top-0">
              {playerSubscribeData
                ? playerSubscribeData?.level.toString()
                : playerQueryData?.level.toString()}
            </span>

            <div className="relative h-2 bg-slate-300  overflow-hidden mb-2">
              <div
                className="bg-green-400 h-full"
                style={{
                  width: `${
                    ((playerSubscribeData?.exp ??
                      playerQueryData?.exp ??
                      0) as number) / 100
                  }%`,
                }}
              ></div>
            </div>

            {/* Stats */}
            <div className="flex space-x-4 items-center">
              {/* Gold */}
              <div className="flex items-center space-x-1">
                <img src={Gold} alt="Gold" width={20} />
                <h2 className="text-sm font-medium font-pixel">
                  {playerSubscribeData
                    ? playerSubscribeData?.gold.toString()
                    : playerQueryData?.gold.toString()}
                </h2>
              </div>
              {/* Trophy */}
              <div className="flex items-center space-x-1">
                <img src={Trophy} alt="Trophy" width={18} />
                <h2 className="text-sm font-medium font-pixel">
                  {playerSubscribeData
                    ? playerSubscribeData?.trophies.toString()
                    : playerQueryData?.trophies.toString()}
                </h2>
              </div>

              <div className="flex items-center space-x-1">
                <img src={Carrot} alt="Gold" width={20} />
                <h2 className="text-sm font-medium font-pixel">
                  {playerSubscribeData
                    ? playerSubscribeData?.food.toString()
                    : playerQueryData?.food.toString()}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right */}
        <div className="absolute top-0 right-0 p-3 m-3 h-[70px] flex items-center">
          <div>
            <div
              className=""
              //   onClick={() => setIsPokemonTabOpened(!isPokemonTabOpened)}
            >
              <img
                src={PokemonPfp}
                width={70}
                className="rounded-full border-2 border-black"
                alt=""
              />
            </div>
            <div></div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 p-3 m-3 h-[70px] flex items-center">
          <button
            className="bg-white text-black"
            onClick={() => {
              if (!isLoading) {
                // Prevent clicking while loading
                setClickedBattle(true);
              }
            }}
            disabled={isLoading} // Disable the button while loading
          >
            <img
              src={BattleLogo}
              alt=""
              width={70}
              className="bg-blue-500 border-2 border-black"
            />
          </button>
          <div className="bg-white p-2 ml-2">
            <button>SHOP</button>
          </div>
        </div>

        {/* Bottom right popup */}
        {isPopupVisible && (
          <div className="absolute bottom-0 left-0 p-3 m-3 bg-white border-2 border-black flex items-center">
            <div className="p-2">
              {!farmState.isFarming && !farmState.isHarvestReady ? (
                <button
                  onClick={handleStartFarming}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Start Farming
                </button>
              ) : farmState.isHarvestReady ? (
                <button
                  onClick={handleHarvest}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Harvest
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {isPokemonNearBy && (
        <div className="absolute bottom-0 left-0 p-3 m-3 bg-white border-2 border-black flex items-center">
          <div className="p-2">
            <button
              className="bg-green-500 text-white p-2 m-2 rounded"
              onClick={() => (window.location.href = "/battle/")}
            >
              Click here to Capture
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} />
    </div>
  );
};

export default NewGameCanvas;
