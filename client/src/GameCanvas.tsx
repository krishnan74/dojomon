import { useRef, useEffect } from "react";
import { Position } from "./interfaces";

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = { w: false, a: false, s: false, d: false }; // External keys object
  const backgroundPosition = { x: -430, y: -480 }; // External position object

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;

    const backgroundImage = new Image();
    backgroundImage.src = "../assets/dojomon-base-map.png";

    const playerImage = new Image();
    playerImage.src = "../assets/playerSprites/playerDown.png";

    // Handle player movement
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys[e.key as keyof typeof keys] !== undefined)
        keys[e.key as keyof typeof keys] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys[e.key as keyof typeof keys] !== undefined)
        keys[e.key as keyof typeof keys] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const update = () => {
      if (keys.w) backgroundPosition.y += 3;
      if (keys.a) backgroundPosition.x += 3;
      if (keys.s) backgroundPosition.y -= 3;
      if (keys.d) backgroundPosition.x -= 3;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.drawImage(
        backgroundImage,
        backgroundPosition.x,
        backgroundPosition.y
      );

      // Draw player
      ctx.drawImage(
        playerImage,
        0,
        0,
        playerImage.width / 4,
        playerImage.height,
        canvas.width / 2 - playerImage.width / 4 / 2,
        canvas.height / 2 - playerImage.height / 2,
        playerImage.width / 4,
        playerImage.height
      );
    };

    const gameLoop = () => {
      update();
      render();
      requestAnimationFrame(gameLoop);
    };

    backgroundImage.onload = () => {
      playerImage.onload = () => {
        gameLoop(); // Start game loop once images are loaded
      };
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default GameCanvas;
