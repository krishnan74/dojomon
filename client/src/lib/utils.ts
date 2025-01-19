import { clsx, type ClassValue } from "clsx";
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

export const felt252ToString = (felt252: string) => {
  // Remove the "0x" prefix
  const felt252WithOutPrefix = felt252.slice(2);

  // Convert the hex string to a byte array
  const byteArray = new Uint8Array(
    (felt252WithOutPrefix.match(/.{2}/g) || []).map((byte) =>
      parseInt(byte, 16)
    )
  );

  // Decode the byte array into a string
  const decodedString = new TextDecoder().decode(byteArray);

  // Filter out non-printable characters
  const cleanedString = decodedString.replace(/[^\x20-\x7E]/g, "");

  return cleanedString;
};
