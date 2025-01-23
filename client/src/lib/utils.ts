import { clsx, type ClassValue } from "clsx";
import { BigNumberish } from "starknet";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (address: string): string => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

export const copyToClipboard = (copyText: string) => {
  navigator.clipboard.writeText(copyText);
  alert("Address copied to clipboard!");
};

export const felt252ToString = (felt252: string | undefined) => {
  // Remove the "0x" prefix
  const felt252WithOutPrefix = felt252?.slice(2);

  // Convert the hex string to a byte array
  const byteArray = new Uint8Array(
    (felt252WithOutPrefix?.match(/.{2}/g) || []).map((byte) =>
      parseInt(byte, 16)
    )
  );

  // Decode the byte array into a string
  const decodedString = new TextDecoder().decode(byteArray);

  // Filter out non-printable characters
  const cleanedString = decodedString.replace(/[^\x20-\x7E]/g, "");

  return cleanedString;
};

export const withGrid = (grid: number) => {
  return grid * 60;
};

export const asGridCoord = (x: number, y: number) => {
  return `${x * 60},${y * 60}`;
};

export const nextPosition = (
  initialX: number,
  initialY: number,
  direction: string
) => {
  let x = initialX;
  let y = initialY;

  const size = 60;
  if (direction === "left") {
    x -= size;
  } else if (direction === "right") {
    x += size;
  } else if (direction === "up") {
    y -= size;
  } else if (direction === "down") {
    y += size;
  }
  return { x, y };
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const dojomonData = [
  {
    name: "Charmander",
    health: 100,
    attack: 20,
    defense: 10,
    speed: 15,
    dojomon_type: "Fire",
    image_id: "004",
  },
  {
    name: "Squirtle",
    health: 100,
    attack: 20,
    defense: 10,
    speed: 15,
    dojomon_type: "Water",
    image_id: "007",
  },
  {
    name: "Bulbasaur",
    health: 100,
    attack: 20,
    defense: 10,
    speed: 15,
    dojomon_type: "Grass",
    image_id: "001",
  },
];

export const formatWithLeadingZeros = (
  number: BigNumberish | undefined,
  length: number = 3
) => {
  return number?.toString().padStart(length, "0");
};
