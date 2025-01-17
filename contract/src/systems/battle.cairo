use dojomon::models::{
    PlayerStats,
    ReceiverFriendRequest, DojoMon, DojomonType, MoveEffect, Move
};
use starknet::{ContractAddress, get_caller_address};

// Define the interface
#[starknet::interface]
trait IBattle<T> {
    fn attack(
        ref self: T,
        attacker_dojomon_id: felt252,
        defender_dojomon_id: felt252,
        move_id: u32,
    );
}

// Dojo contract
#[dojo::contract]
pub mod battle {
    
    use super::{
            IBattle, PlayerStats, ReceiverFriendRequest, DojoMon, DojomonType, MoveEffect, Move
        };
        use starknet::{ContractAddress, get_caller_address};
        use dojo::model::{ModelStorage, ModelValueStorage};
        use dojo::event::EventStorage;

    #[abi(embed_v0)]
    impl BattleImpl of IBattle<ContractState> {
        
        fn attack(
            ref self: ContractState,
            attacker_dojomon_id: felt252,
            defender_dojomon_id: felt252,
            move_id: u32,
        ) {
            let mut world = self.world_default();
            //let attacker = get_caller_address();

            println!("Attacker Dojomon id from battle: {:?}  ", attacker_dojomon_id);

            let mut attacker_dojomon: DojoMon = world.read_model(attacker_dojomon_id);
            let mut defender_dojomon: DojoMon = world.read_model(defender_dojomon_id);

            println!("Attacker: {:?}", attacker_dojomon);

            let selected_move: Move = world.read_model(move_id);

            // Base damage calculation
            let base_damage = selected_move.power * attacker_dojomon.attack / 50;

            println!("Base damage: {}", base_damage);


            // Apply type effectiveness
            let type_effectiveness = self.calculate_type_effectiveness(selected_move.move_type, defender_dojomon.dojomon_type);
            let adjusted_damage = base_damage * type_effectiveness;

            println!("Adjusted damage: {}", adjusted_damage);

            // Apply random damage variability
            let random_damage_factor: u32 = (10 % 400) / 1000 + 8; // Replace RNG logic
            let damage_variation = adjusted_damage * random_damage_factor / 10;

            println!("Base damage variation: {}", damage_variation);

            // Final damage after considering defense
            let damage_dealt = if damage_variation > defender_dojomon.defense / 2 {
                damage_variation - defender_dojomon.defense / 2
            } else {
                0
            };

            println!("Damage dealt: {}", damage_dealt);

            // Update defender's health
            if defender_dojomon.health <= damage_dealt {
                defender_dojomon.health = 0;
            } else {
                defender_dojomon.health -= damage_dealt;
            }

            println!("Defender health: {}", defender_dojomon.health);

            // Apply move effects

            self.apply_move_effect(selected_move.effect, ref defender_dojomon);

            // Update models in the world
            world.write_model(@attacker_dojomon);
            world.write_model(@defender_dojomon);
        }
        
    }

    /// Internal trait implementation for helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Returns the default world storage for the contract.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojomon")
        }

        fn calculate_type_effectiveness(ref self: ContractState, move_type: DojomonType, target_type: DojomonType) -> u32 {
            match (move_type, target_type) {
                (DojomonType::Fire, DojomonType::Grass) => 2_u32,
                (DojomonType::Fire, DojomonType::Water) => 1_u32,
                (DojomonType::Fire, DojomonType::Ice) => 2_u32,

                (DojomonType::Water, DojomonType::Fire) => 2_u32,
                (DojomonType::Water, DojomonType::Electric) => 1_u32,
                (DojomonType::Water, DojomonType::Grass) => 1_u32,

                (DojomonType::Electric, DojomonType::Water) => 2_u32,
                (DojomonType::Electric, DojomonType::Grass) => 1_u32,
                (DojomonType::Electric, DojomonType::Electric) => 1_u32,

                (DojomonType::Grass, DojomonType::Water) => 2_u32,
                (DojomonType::Grass, DojomonType::Fire) => 1_u32,
                (DojomonType::Grass, DojomonType::Grass) => 1_u32,

                (DojomonType::Ice, DojomonType::Grass) => 2_u32,
                (DojomonType::Ice, DojomonType::Fire) => 1_u32,
                (DojomonType::Ice, DojomonType::Water) => 1_u32,

                (DojomonType::Psychic, DojomonType::Poison) => 2_u32,
                (DojomonType::Psychic, DojomonType::Psychic) => 1_u32,

                (DojomonType::Normal, DojomonType::Ghost) => 0_u32,

                (DojomonType::Ghost, DojomonType::Normal) => 0_u32,
                
                _ => 1_u32,
            }
        }

        fn apply_move_effect(ref self: ContractState, effect: MoveEffect, ref defender: DojoMon) {
            match effect {
                MoveEffect::Burn => {
                    defender.health -= 10; // Burn deals 10 damage per turn
                    defender.attack /= 2; // Burn reduces attack by half
                },
                MoveEffect::Paralyze => {
                    defender.speed /= 2; // Paralysis halves speed
                    // Add logic for a chance to skip a turn due to paralysis
                },
                MoveEffect::Freeze => {
                    defender.speed = 0; // Frozen Pokémon can't move
                    // Add logic to handle thawing out after a few turns
                },
                MoveEffect::Confuse => {
                    // Add logic to track confusion status and calculate chances of hitting self
                },
                MoveEffect::Flinch => {
                    // Add logic to skip the next turn if the Pokémon flinches
                },
                MoveEffect::LowerSpecialDefense => {
                    if defender.defense > 5 {
                        defender.defense -= 5; // Lower special defense by a fixed amount
                    }
                },
                _ => {
                    // No effect for unrecognized effect strings
                }
            }
        }
    }

}