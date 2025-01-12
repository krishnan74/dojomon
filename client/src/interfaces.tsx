export interface GameCanvasProps {
  playerPosition: { x: number; y: number };
  items: { id: number; x: number; y: number }[];
  mapWidth: number;
  mapHeight: number;
}

export interface Position {
  x: number;
  y: number;
}
