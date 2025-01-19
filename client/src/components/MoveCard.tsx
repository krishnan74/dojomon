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
import React, { SetStateAction, useContext } from "react";
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
  setAttacked: React.Dispatch<SetStateAction<boolean>>;
}

const MoveCard: React.FC<MoveCardProps> = ({
  move,
  client,
  lobby_code,
  account,
  in_battle,
  myDojomonId,
  opponentDojomonId,
  setAttacked,
}) => {
  return (
    <Card
      className="border bg-red-500 hover:bg-red-600 text-black w-1/4 rounded-none h-[150px] cursor-pointer"
      onClick={() => {
        // client.battle.attack(
        //   account!,
        //   lobby_code,
        //   myDojomonId,
        //   opponentDojomonId,
        //   move.id,
        //   false
        // );

        // Set the attacked state to true
        setAttacked(true);
      }}
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {felt252ToString(move.name)}
        </CardTitle>
        <CardDescription className="text-sm text-black">
          Type: {move?.move_type.toString() || "Unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p>
            <strong>Power:</strong> {move?.power.toString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoveCard;
