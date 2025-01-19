import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { felt252ToString } from "@/lib/utils";
import { Dojomon, DojomonStruct } from "@/typescript/models.gen";
import React, { useContext } from "react";
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
  return (
    <Card className="max-w-sm bg-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {felt252ToString(dojomon?.name)} - {dojomon?.dojomon_id!.toString()}
        </CardTitle>
        <CardDescription className="text-sm text-gray-400">
          Type: {felt252ToString(dojomon?.dojomon_type.toString()) || "Unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Level:</strong> {dojomon?.level.toString()}
          </p>
          <p>
            <strong>Health:</strong> {dojomon?.health.toString()}
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
          <p>
            <strong>Evolution:</strong> {dojomon?.evolution.toString()}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        {/* <p className="text-xs text-gray-400">
          {dojomon.is_free
            ? "This Dojomon is free to catch!"
            : dojomon.is_being_caught
            ? "Currently being caught by another player."
            : "Owned by a player."}
        </p> */}

        {!in_battle && (
          <Button
            onClick={() =>
              client.lobby.selectDojomon(
                account!,
                lobby_code,
                dojomon?.dojomon_id
              )
            }
          >
            Select
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DojomonCard;
