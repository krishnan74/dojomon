import React, { useEffect, useRef } from 'react'
// import { GameObject } from './classes/GameObject';
import { withGrid } from './lib/utils';
import { DirectionInput } from './classes/DirectionInput';
import { Person } from './classes/Person';
import Profile from "../assets/pfp.jpg"
import Trophy from "../assets/trophy.png";
import Gold from "../assets/gold.png";
import PokemonPfp from "../assets/pokemon_profile.png"
import BattleLogo from "../assets/battle.png"
import { GameObject } from './classes/GameObject';

const NewGameCanvas = () => {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = { w: false, a: false, s: false, d: false }; // External keys object
  const backgroundPosition = { x: -400, y: -480 }; // External position object
  const offset = { x: -400, y: -480 }; // External offset object
  
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
    backgroundImage.src = "../assets/dojomon-base-map.png";

    const directionInput = new DirectionInput()
    directionInput.init()

    const player = new Person({
      x: withGrid(80.2),
      y: withGrid(37.5),
      isPlayerControlled: true,
    })

    const npc1 = new GameObject({
      x: withGrid(4),
      y: withGrid(4),
      src: "../assets/npc1.png"
    })


    const update = () => {
      player.update({
        arrow: directionInput.direction,
      });
      player.updateSprite({
        arrow: directionInput.direction,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);
    
      // Calculate camera position
      const cameraX = player.x - withGrid(49.5); // Center horizontally
      const cameraY = player.y - withGrid(27);  // Center vertically
    
      // Render background with camera offset
      ctx.drawImage(
        backgroundImage,
        -cameraX - backgroundImage.x, // Offset by camera position
        -cameraY - backgroundImage.y, // Offset by camera position
      );
    
      
      player.sprite.draw({
        ctx,
        cameraX,
        cameraY
      });
    
    };
    

    const gameLoop = () => {
      update()
      render()
      requestAnimationFrame(gameLoop)
    }

    backgroundImage.onload = () => {
      gameLoop()
    }

  }, [])

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='absolute w-[1200px] h-[650px]'>
        {/* Top Left */}
        <div className="absolute top-0 left-0 p-3 m-3 h-[70px] w-1/4 flex items-center bg-white border-2 border-black">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <img src={Profile} alt="Profile" width={50} className="rounded-md" />
          </div>

          {/* Info Section */}
          <div className="ml-3 w-full">
            {/* Health Bar */}
            <div className="relative h-2 bg-slate-300  overflow-hidden mb-2">
              <div
                className="absolute h-full bg-green-500"
                style={{ width: '70%' }}
              ></div>
            </div>

            {/* Stats */}
            <div className="flex space-x-4 items-center">
              {/* Gold */}
              <div className="flex items-center space-x-1">
                <img src={Gold} alt="Gold" width={20} />
                <h2 className="text-sm font-medium font-pixel">20</h2>
              </div>
              {/* Trophy */}
              <div className="flex items-center space-x-1">
                <img src={Trophy} alt="Trophy" width={18} />
                <h2 className="text-sm font-medium font-pixel">20</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right */}
        <div className="absolute top-0 right-0 p-3 m-3 h-[70px] flex items-center">
          <div>
            <div className=""
            //   onClick={() => setIsPokemonTabOpened(!isPokemonTabOpened)}
            >
              <img src={PokemonPfp} width={70} className="rounded-full border-2 border-black" alt="" />
            </div>
            <div></div>
          </div>
        </div>

        {/* Bottom right */}
        <div className="absolute bottom-0 right-0 p-3 m-3 h-[70px] flex items-center">
          <div>
            <img src={BattleLogo} alt="" width={70} className="bg-blue-500 border-2 border-black" />
          </div>
          <div className="bg-white p-2 ml-2">
            <button
            //   onClick={handleFarm}
            >
              Farm</button>
          </div>
          <div className="bg-white p-2 ml-2">
            <button
            //   onClick={handleHarvest}
            >Harvest</button>
          </div>
        </div>

      </div>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default NewGameCanvas