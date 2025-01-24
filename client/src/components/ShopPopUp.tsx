import { DojoContext } from "@/dojo-sdk-provider";
import { DojoBallType } from "@/typescript bindings/models.gen";
import { useAccount } from "@starknet-react/core";
import React, { useContext, useState } from "react";
import { BigNumberish } from "starknet";

interface ShopPopupProps {
  setIsShopOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playerGold: BigNumberish | undefined; // Prop to get the player's current gold
}

const ShopPopup: React.FC<ShopPopupProps> = ({ setIsShopOpen, playerGold }) => {
  const { client } = useContext(DojoContext);

  const { account } = useAccount();

  const [pokeballs, setPokeballs] = useState<{
    [key: string]: { quantity: number; price: number; image: string };
  }>({
    dojoball: {
      quantity: 1,
      price: 50,
      image: "../assets/game-ui/POKEBALL.png",
    },
    greatball: {
      quantity: 1,
      price: 100,
      image: "../assets/game-ui/GREATBALL.png",
    },
    ultraball: {
      quantity: 1,
      price: 200,
      image: "../assets/game-ui/ULTRABALL.png",
    },
    masterball: {
      quantity: 1,
      price: 300,
      image: "../assets/game-ui/MASTERBALL.png",
    },
  });

  // Increment quantity
  const increaseQuantity = (type: string) => {
    setPokeballs({
      ...pokeballs,
      [type]: {
        ...pokeballs[type],
        quantity: pokeballs[type].quantity + 1,
      },
    });
  };

  // Decrement quantity (ensure it can't go below 1)
  const decreaseQuantity = (type: string) => {
    if (pokeballs[type].quantity > 1) {
      setPokeballs({
        ...pokeballs,
        [type]: {
          ...pokeballs[type],
          quantity: pokeballs[type].quantity - 1,
        },
      });
    }
  };

  // Handle the buy operation
  const handleBuy = async (pokeballType: string, quantity: number) => {
    const ball = pokeballs[pokeballType];
    const totalCost = ball.price * quantity;

    if (playerGold !== undefined && Number(playerGold) >= totalCost) {
      let dojoBallType: DojoBallType;

      // Map string keys to DojoBallType enum values
      switch (pokeballType) {
        case "dojoball":
          dojoBallType = DojoBallType.Dojoball;
          break;
        case "greatball":
          dojoBallType = DojoBallType.Greatball;
          break;
        case "ultraball":
          dojoBallType = DojoBallType.Ultraball;
          break;
        case "masterball":
          dojoBallType = DojoBallType.Masterball;
          break;
        default:
          alert("Unknown ball type");
          return;
      }

      // Assuming 'client.shop.buyDojoBall' requires 'account', 'dojoBallType', and 'quantity'
      await client.shop.buyDojoBall(account!, dojoBallType, quantity);

      // Update local state with the new quantity after purchase
      setPokeballs({
        ...pokeballs,
        [pokeballType]: {
          ...ball,
          quantity: ball.quantity + quantity, // Increase the quantity of the purchased Pokéball
        },
      });
    } else {
      alert("Not enough gold!");
    }
  };

  return (
    <div className="absolute top-[60px] left-[10%] w-[80%] h-[90%] overflow-y-hidden  bg-white px-8 py-4 border-2 border-black rounded-xl shadow-lg overflow-auto">
      <h2 className="text-center font-bold text-3xl mb-4">Pokéball Shop</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Object.keys(pokeballs).map((type) => (
          <div
            key={type}
            className="flex flex-col items-center bg-gray-50 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <img
              src={pokeballs[type].image}
              alt={type}
              className="w-[90px] h-[90px] object-contain mb-6"
            />
            <h3 className="font-semibold text-xl mb-3 text-center">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <span className="text-gray-600 text-lg mb-3">
              {pokeballs[type].price} Gold
            </span>
            <div className="flex items-center mb-6 space-x-4">
              <button
                onClick={() => decreaseQuantity(type)}
                className="bg-gray-300 text-black p-3 rounded-full hover:bg-gray-400 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={pokeballs[type].quantity}
                readOnly
                className="w-14 text-center mx-2 border-2 rounded-md text-lg"
              />
              <button
                onClick={() => increaseQuantity(type)}
                className="bg-gray-300 text-black p-3 rounded-full hover:bg-gray-400 transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleBuy(type, pokeballs[type].quantity)}
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIsShopOpen(false)}
        className="mt-2 w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-colors"
      >
        Close Shop
      </button>
    </div>
  );
};

export default ShopPopup;
