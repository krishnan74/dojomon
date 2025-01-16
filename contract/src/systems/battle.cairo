// use dojo_starter::models::{PlayerStats, Friend, Lobby, DojoMonType, Move};
// use starknet::{ContractAddress, get_caller_address};

// pub const MOVES: Array<Move> = array![
//     // Normal moves
//     Move {
//         id: 1,
//         name: "Tackle",
//         power: 40,
//         accuracy: 100,
//         move_type: DojoMonType::Normal,
//         description: "A physical attack where the user charges the opponent with its full body.",
//         effect: None,
//     },
//     Move {
//         id: 2,
//         name: "Quick Attack",
//         power: 40,
//         accuracy: 100,
//         move_type: DojoMonType::Normal,
//         description: "A fast and unavoidable move that always strikes first.",
//         effect: None,
//     },
//     Move {
//         id: 3,
//         name: "Headbutt",
//         power: 70,
//         accuracy: 100,
//         move_type: DojoMonType::Normal,
//         description: "A strong physical attack that may cause the opponent to flinch.",
//         effect: Some("flinch"),
//     },

//     // Fire moves
//     Move {
//         id: 4,
//         name: "Ember",
//         power: 40,
//         accuracy: 100,
//         move_type: DojoMonType::Fire,
//         description: "A small flame attack that may leave the opponent burned.",
//         effect: Some("burn"),
//     },
//     Move {
//         id: 5,
//         name: "Fire Blast",
//         power: 110,
//         accuracy: 85,
//         move_type: DojoMonType::Fire,
//         description: "A massive blast of fire that scorches the target and may cause a burn.",
//         effect: Some("burn"),
//     },
//     Move {
//         id: 6,
//         name: "Flamethrower",
//         power: 90,
//         accuracy: 100,
//         move_type: DojoMonType::Fire,
//         description: "A steady stream of flames that burns the opponent and may inflict a burn.",
//         effect: Some("burn"),
//     },

//     // Water moves
//     Move {
//         id: 7,
//         name: "Water Gun",
//         power: 40,
//         accuracy: 100,
//         move_type: DojoMonType::Water,
//         description: "A basic water attack that shoots water at the opponent.",
//         effect: None,
//     },
//     Move {
//         id: 8,
//         name: "Hydro Pump",
//         power: 110,
//         accuracy: 80,
//         move_type: DojoMonType::Water,
//         description: "A powerful stream of water blasted at the opponent.",
//         effect: None,
//     },
//     Move {
//         id: 9,
//         name: "Surf",
//         power: 90,
//         accuracy: 100,
//         move_type: DojoMonType::Water,
//         description: "A large wave that crashes onto the target.",
//         effect: None,
//     },

//     // Grass moves
//     Move {
//         id: 10,
//         name: "Razor Leaf",
//         power: 55,
//         accuracy: 95,
//         move_type: DojoMonType::Grass,
//         description: "Sharp-edged leaves are launched at the target to deal damage.",
//         effect: None,
//     },
//     Move {
//         id: 11,
//         name: "Vine Whip",
//         power: 45,
//         accuracy: 100,
//         move_type: DojoMonType::Grass,
//         description: "The user strikes the opponent with slender, whip-like vines.",
//         effect: None,
//     },
//     Move {
//         id: 12,
//         name: "Solar Beam",
//         power: 120,
//         accuracy: 100,
//         move_type: DojoMonType::Grass,
//         description: "A powerful beam of sunlight strikes the opponent. Requires charging.",
//         effect: None,
//     },

//     // Electric moves
//     Move {
//         id: 13,
//         name: "Thunder Shock",
//         power: 40,
//         accuracy: 100,
//         move_type: DojoMonType::Electric,
//         description: "A small jolt of electricity that may paralyze the opponent.",
//         effect: Some("paralyze"),
//     },
//     Move {
//         id: 14,
//         name: "Thunderbolt",
//         power: 90,
//         accuracy: 100,
//         move_type: DojoMonType::Electric,
//         description: "A strong electrical attack that may paralyze the opponent.",
//         effect: Some("paralyze"),
//     },
//     Move {
//         id: 15,
//         name: "Thunder",
//         power: 110,
//         accuracy: 70,
//         move_type: DojoMonType::Electric,
//         description: "A massive thunderbolt that strikes the opponent. May cause paralysis.",
//         effect: Some("paralyze"),
//     },

//     // Ice moves
//     Move {
//         id: 16,
//         name: "Ice Shard",
//         power: 40,
//         accuracy: 100,
//         move_type: DojoMonType::Ice,
//         description: "A shard of ice that is thrown at the opponent. Strikes quickly.",
//         effect: None,
//     },
//     Move {
//         id: 17,
//         name: "Ice Beam",
//         power: 90,
//         accuracy: 100,
//         move_type: DojoMonType::Ice,
//         description: "A strong icy attack that may freeze the opponent.",
//         effect: Some("freeze"),
//     },
//     Move {
//         id: 18,
//         name: "Blizzard",
//         power: 110,
//         accuracy: 70,
//         move_type: DojoMonType::Ice,
//         description: "A harsh blizzard that hits all targets and may freeze them.",
//         effect: Some("freeze"),
//     },

//     // Psychic moves
//     Move {
//         id: 19,
//         name: "Confusion",
//         power: 50,
//         accuracy: 100,
//         move_type: DojoMonType::Psychic,
//         description: "A psychic wave that may confuse the opponent.",
//         effect: Some("confuse"),
//     },
//     Move {
//         id: 20,
//         name: "Psychic",
//         power: 90,
//         accuracy: 100,
//         move_type: DojoMonType::Psychic,
//         description: "A powerful psychic attack that may lower the opponent's special defense.",
//         effect: Some("lower_special_defense"),
//     },
// ];


// #[generate_trait]
// impl InternalImpl of InternalTrait {
//     /// Returns the default world storage for the contract.
//     fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
//         self.world(@"dojo_starter")
//     }

//     /// Calculate type effectiveness
//     fn calculate_type_effectiveness(self, move_type: felt252, target_type: felt252) -> u32 {
//         match (move_type, target_type) {
//             ("fire", "grass") => 2,
//             ("fire", "water") => 0.5,
//             ("fire", "ice") => 2,
//             ("water", "fire") => 2,
//             ("water", "electric") => 0.5,
//             ("water", "grass") => 0.5,
//             ("electric", "water") => 2,
//             ("electric", "grass") => 0.5,
//             ("electric", "electric") => 0.5,
//             ("grass", "water") => 2,
//             ("grass", "fire") => 0.5,
//             ("grass", "grass") => 0.5,
//             ("ice", "grass") => 2,
//             ("ice", "fire") => 0.5,
//             ("ice", "water") => 0.5,
//             ("psychic", "poison") => 2,
//             ("psychic", "psychic") => 0.5,
//             ("normal", "ghost") => 0, // Normal moves don't affect Ghost types
//             ("ghost", "normal") => 0, // Ghost moves don't affect Normal types
//             // Add more matchups as needed
//             _ => 1, // Default effectiveness is neutral (1x)
//         }
//     }

  
    // fn apply_move_effect(self, effect: felt252, defender: &mut DojoMon) {
    //     match effect {
    //         "burn" => {
    //             defender.health -= 10; // Burn deals 10 damage per turn
    //             defender.attack /= 2; // Burn reduces attack by half
    //         },
    //         "paralyze" => {
    //             defender.speed /= 2; // Paralysis halves speed
    //             // Add logic for a chance to skip a turn due to paralysis
    //         },
    //         "freeze" => {
    //             defender.speed = 0; // Frozen Pokémon can't move
    //             // Add logic to handle thawing out after a few turns
    //         },
    //         "confuse" => {
    //             // Add logic to track confusion status and calculate chances of hitting self
    //         },
    //         "flinch" => {
    //             // Add logic to skip the next turn if the Pokémon flinches
    //         },
    //         "lower_special_defense" => {
    //             if defender.special_defense > 5 {
    //                 defender.special_defense -= 5; // Lower special defense by a fixed amount
    //             }
    //         },
    //         _ => {
    //             // No effect for unrecognized effect strings
    //         }
    //     }
    // }
// }

// }
