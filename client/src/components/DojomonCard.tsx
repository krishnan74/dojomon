import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { felt252ToString } from "@/lib/utils";
import { Dojomon } from "@/typescript/models.gen";
import { Button } from "./ui/button";

interface DojomonCardProps {
  dojomon?: Dojomon | null; // Expect the Dojomon data to be passed as a prop
  lobby_code?: string;
  client?: any;
  account?: any;
  in_battle?: boolean;
}

const DojomonCard: React.FC<DojomonCardProps> = ({
  dojomon,
  client,
  lobby_code,
  account,
  in_battle,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleSelectDojomon = () => {
    if (client && account && lobby_code && dojomon?.dojomon_id) {
      client.lobby.selectDojomon(account, lobby_code, dojomon.dojomon_id);
      setIsSelected(true); // Trigger feedback
      setTimeout(() => setIsSelected(false), 1500); // Remove feedback after 1.5 seconds
    }
  };

  return (
    <Card
      className={`max-w-sm bg-gradient-to-br from-purple-800 to-blue-600 text-white shadow-lg transition-transform duration-300 ${
        isSelected ? "border-4 border-green-400 scale-105" : "hover:scale-105"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold flex items-center gap-2">
          {felt252ToString(dojomon?.name)}
          <span className="text-sm bg-gray-900 text-yellow-400 px-2 py-1 rounded-full">
            ID #{dojomon?.dojomon_id.toString()}
          </span>
        </CardTitle>
        <CardDescription className="text-sm text-gray-300">
          Type: {dojomon?.dojomon_type.toString() || "Unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <p>
            <strong>Level:</strong> {dojomon?.level.toString()}
          </p>
          <p>
            <strong>HP:</strong> {dojomon?.health.toString()}
          </p>
          <p>
            <strong>Attack:</strong> {dojomon?.attack.toString()}
          </p>
          <p>
            <strong>Defense:</strong> {dojomon?.defense.toString()}
          </p>
          <p>
            <strong>Speed:</strong> {dojomon?.speed.toString()}
          </p>
          <p>
            <strong>EXP:</strong> {dojomon?.exp.toString()}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        {!in_battle && (
          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
            onClick={handleSelectDojomon}
          >
            Select {felt252ToString(dojomon?.name)}
          </Button>
        )}
      </CardFooter>
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
          <p className="text-green-400 text-lg font-bold animate-pulse">
            {felt252ToString(dojomon?.name)} Selected!
          </p>
        </div>
      )}
    </Card>
  );
};

export default DojomonCard;
