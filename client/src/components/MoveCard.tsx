import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { felt252ToString } from "@/lib/utils";
import { Move } from "@/typescript/models.gen";
import React, { useContext } from "react";
import { Button } from "./ui/button";
import { BigNumberish } from "starknet";

interface MoveCardProps {
  move: Move; // Expect the Dojomon data to be passed as a prop
  lobby_code: BigNumberish;
  myDojomonId: BigNumberish;
  opponentDojomonId: BigNumberish;
  client: any;
  account: any;
  in_battle: boolean;
}

const MoveCard: React.FC<MoveCardProps> = ({
  move,
  client,
  lobby_code,
  account,
  in_battle,
  myDojomonId,
  opponentDojomonId,
}) => {
  return (
    <Card className="max-w-sm bg-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {felt252ToString(move.name)} - {move.id.toString()}
        </CardTitle>
        <CardDescription className="text-sm text-gray-400">
          Type: {move?.move_type.toString() || "Unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Power:</strong> {move?.power.toString()}
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

        {in_battle && (
          <Button
            onClick={() =>
              client.battle.attack(
                account!,
                lobby_code,
                myDojomonId,
                opponentDojomonId,
                move.id,
                false
              )
            }
          >
            Attack
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MoveCard;
