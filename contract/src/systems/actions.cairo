use dojomon::models::{PlayerStats, Counter, Dojomon, DojoBallType, DojomonType, Position, League, Lobby, Move, MoveEffect, Inventory};
use dojomon::events::{PlayerSpawned, DojomonCreated, DojomonCaptured};
use starknet::{ContractAddress, get_caller_address, contract_address_const};
use dojomon::utils::random::{Random, RandomImpl, RandomTrait};


// Define the interface
#[starknet::interface]
trait IActions<T> {
    fn spawnPlayer(ref self: T, player_address_felt252: felt252, name: felt252, starting_dojo_mon: DojomonType) -> u32;
    fn createDojomon(ref self: T, player_address_felt252: felt252, name: felt252, health: u32, attack: u32, defense: u32, speed: u32, evolution: u32, dojomon_type: DojomonType, position: Position, is_free: bool, is_being_caught: bool, image_id: u32) -> u32;
    fn feedDojomon(ref self: T, dojomon_id: u32, quantity: u32);
    fn catchDojomon(ref self: T, dojomon_id: u32, dojoball_type: DojoBallType);
    fn addGold(ref self: T, player_address_felt252: felt252, quantity: u32);
    fn addMove(ref self: T, dojomon_id: u32, name: felt252, description: ByteArray, power: u32, accuracy: u32, move_type: DojomonType, effect: MoveEffect);
    fn harvestFood(ref self: T, player_address_felt252: felt252, quantity: u32);
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::{IActions, PlayerStats, Counter, Dojomon, DojoBallType, DojomonType, Position, League, Lobby, PlayerSpawned, DojomonCreated, DojomonCaptured, Move, MoveEffect, ContractAddress, Random, RandomImpl, RandomTrait,Inventory, get_caller_address, contract_address_const};
    use dojo::model::{ModelStorage, ModelValueStorage};
    
    use dojo::event::EventStorage;
    use core::starknet::contract_address::contract_address_to_felt252;
    use dojo::world::WorldStorage;
    use dojo::world::IWorldDispatcherTrait;

    const COUNTER_ID: u32 = 999;
    const INCREASE_HEALTH_PER_FOOD: u32 = 5;
    const DOJOBALL_PRICE : u32 = 50;
    const GREATBALL_PRICE : u32 = 100;
    const ULTRABALL_PRICE : u32 = 200;
    const MASTERBALL_PRICE : u32 = 300;

    #[derive(Copy, Drop, Serde, Debug)]
    pub struct firstDojomonStats{
        health: u32,
        attack: u32,
        defense: u32,
        speed: u32,
    }

    const charmander: firstDojomonStats = firstDojomonStats {
        health: 100,
        attack: 40,
        defense: 30,
        speed: 40,
    };

    const bulbasaur: firstDojomonStats = firstDojomonStats {
        health: 120,
        attack: 25,
        defense: 25,
        speed: 30,
    };

    const squirtle: firstDojomonStats = firstDojomonStats {
        health: 110,
        attack: 30,
        defense: 35,
        speed: 35,
    };

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawnPlayer(ref self: ContractState, player_address_felt252: felt252, name: felt252, starting_dojo_mon: DojomonType) -> u32 {

            let mut world = self.world_default();
            //let player = get_caller_address();
            
            //reading counter model
            let mut counter : Counter = world.read_model(COUNTER_ID);

            //incrementing the counter
            counter.player_count += 1;
            
            counter.dojoball_count += 1;

            counter.dojomon_count += 1;

            world.write_model(@counter);

            let player_address: ContractAddress = player_address_felt252.try_into().unwrap();

            //creating starting dojomon based on the input
            let created_dojomon_id = match starting_dojo_mon {
                DojomonType::Fire => {
                    let dojomon_id = self.createDojomon( player_address_felt252, 'Charmander', charmander.health, charmander.attack, charmander.defense, charmander.speed, 0, DojomonType::Fire, Position { x: 0, y: 0 }, false, false, 004);
                    let move: Move = Move {
                        id: world.dispatcher.uuid(),
                        dojomon_id,
                        name: 'Ember',
                        description: "A small flame attack that may leave the opponent burned.",
                        power: 40,
                        accuracy: 100,
                        move_type: DojomonType::Fire,
                        effect: MoveEffect::Burn,
                    };

                    world.write_model(@move);
                    dojomon_id                    

                },
                
                DojomonType::Grass =>{
                    let dojomon_id = self.createDojomon( player_address_felt252, 'Bulbasaur', bulbasaur.health, bulbasaur.attack, bulbasaur.defense, bulbasaur.speed, 0, DojomonType::Grass, Position { x: 0, y: 0 }, false, false, 001);
                    let move: Move = Move {
                        id: world.dispatcher.uuid(),
                        dojomon_id,
                        name: 'Vine Whip',
                        description: "A vine attack that may leave the opponent paralyzed.",
                        power: 40,
                        accuracy: 100,
                        move_type: DojomonType::Grass,
                        effect: MoveEffect::Paralyze,
                    };


                    world.write_model(@move);
                    dojomon_id
                },

                DojomonType::Water =>{
                    let dojomon_id = self.createDojomon( player_address_felt252, 'Squirtle', squirtle.health, squirtle.attack, squirtle.defense, squirtle.speed, 0, DojomonType::Water, Position { x: 0, y: 0 }, false, false, 007);
                    let move: Move = Move {
                        id: world.dispatcher.uuid(),
                        dojomon_id,
                        name: 'Water Gun',
                        description: "A water attack that may leave the opponent confused.",
                        power: 40,
                        accuracy: 100,
                        move_type: DojomonType::Water,
                        effect: MoveEffect::Confuse,
                    };


                    world.write_model(@move);
                    dojomon_id 
                },
                
                _ => 0,
                
            };
            
            let start_stats = PlayerStats {
                name,
                address: player_address,
                gold: 100,
                level: 1,
                exp: 0,
                food: 100,
                league: League::Bronze,
                trophies: 100,
            };

            let inventory = Inventory {
                player: player_address,
                dojoballs: 5,
                greatballs: 3,
                ultraballs: 1,
                masterballs: 0,
            };

            world.write_model(@inventory);

            //writing the player stats
            world.write_model(@start_stats);

            // Emit event for player creation
            world.emit_event(@PlayerSpawned {player: player_address,stats: start_stats});

            created_dojomon_id
        }

        
        
        fn feedDojomon(ref self: ContractState, dojomon_id: u32, quantity: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Check if the Dojomon exists

            let mut dojomon: Dojomon = world.read_model(dojomon_id);

            // Ensure the Dojomon is owned by the player
            if dojomon.player != player {
                panic!("Dojomon is not owned by the player!");
            }

            // Increase the Dojomon's health
            dojomon.health += INCREASE_HEALTH_PER_FOOD * quantity;

            world.write_model(@dojomon);
        }

        /// Creates a new Dojomon for the calling player.
        fn createDojomon(
            ref self: ContractState,
            player_address_felt252: felt252,
            name: felt252,
            health: u32,
            attack: u32,
            defense: u32,
            speed: u32,
            evolution: u32,
            dojomon_type: DojomonType,
            position: Position,
            is_free: bool,
            is_being_caught: bool,
            image_id: u32
        ) -> u32 {
            let mut world = self.world_default();
            
            let mut counter : Counter = world.read_model(COUNTER_ID);

            //incrementing the counter
            counter.dojomon_count += 1;

            world.write_model(@counter);


            let dojomon_id = world.dispatcher.uuid();
            
            let player_address: ContractAddress = player_address_felt252.try_into().unwrap();


            // Create new Dojomon
            let dojomon = Dojomon {
                dojomon_id,
                player: player_address,
                name,
                health,
                max_health: health,
                attack,
                defense,
                speed,
                level: 1, // New Dojomons start at level 1
                exp: 0,   // Initial experience
                evolution,
                dojomon_type,
                position,
                is_free,
                is_being_caught,
                image_id,
            };

            world.write_model(@dojomon);

            // // Emit event for Dojomon creation
            world.emit_event(@DojomonCreated { dojomon_id, player: player_address });

            dojomon_id
        }

        /// Captures an unowned Dojomon and assigns it to the calling player.
        fn catchDojomon(ref self: ContractState, dojomon_id: u32, dojoball_type: DojoBallType) {
            let mut world = self.world_default();
            let player = get_caller_address();

            let mut dojomon: Dojomon = world.read_model(dojomon_id);

            let mut randomizer = RandomImpl::new('world');

            // Set Dojomon as being caught
            dojomon.is_being_caught = true;
            world.write_model(@dojomon);

            // Calculate catch rate based on DojoBall type and Dojomon's stats
            let catch_rate = self.calculate_catch_rate(dojomon, dojoball_type);

            // Simulate a random chance to decide whether the Dojomon is caught
            let success = randomizer.between::<u32>(1, 100) <= catch_rate;

            // If caught, assign the Dojomon to the player and update the player's stats
            if success {
                dojomon.player = player;
                dojomon.is_free = false;  // The Dojomon is no longer free
                world.write_model(@dojomon);

                println!("Dojomon was caught");

                // Emit event for Dojomon capture
                world.emit_event(@DojomonCaptured { dojomon_id, player });
            } else {
                // If not caught, revert the state of the Dojomon
                dojomon.is_being_caught = false;
                world.write_model(@dojomon);

                println!("Dojomon escaped");
                // // Emit event for failed capture attempt
                // world.emit_event(@DojomonCaptureFailed { dojomon_id, player });
            }

            let mut inventory: Inventory = world.read_model(player);
            match dojoball_type {
                DojoBallType::Dojoball => inventory.dojoballs -= 1,
                DojoBallType::Greatball => inventory.greatballs -= 1,
                DojoBallType::Ultraball => inventory.ultraballs -= 1,
                DojoBallType::Masterball => inventory.masterballs -= 1,
            }

            world.write_model(@inventory);
        }

        fn addGold( ref self: ContractState, player_address_felt252: felt252, quantity: u32 ){
            let mut world = self.world_default();
            let player_address: ContractAddress = player_address_felt252.try_into().unwrap();

            let mut player: PlayerStats = world.read_model(player_address);

            player.gold += quantity;

            world.write_model(@player);
        }

        fn addMove( ref self: ContractState, dojomon_id: u32, name: felt252, description: ByteArray, power: u32, accuracy: u32, move_type: DojomonType, effect: MoveEffect) {
                        
            let mut world = self.world_default();

            let move: Move = Move {
                id: world.dispatcher.uuid(),
                dojomon_id,
                name,
                description,
                power,
                accuracy,
                move_type,
                effect,
            };

            world.write_model(@move);                
                        
        }

        fn harvestFood ( ref self : ContractState, player_address_felt252: felt252, quantity: u32){
            let mut world = self.world_default();
            let player_address: ContractAddress = player_address_felt252.try_into().unwrap();

            let mut player: PlayerStats = world.read_model(player_address);

            player.food += quantity;

            world.write_model(@player);
        }

        
        
    }

    /// Internal trait implementation for helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Returns the default world storage for the contract.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojomon")
        }

        fn calculate_catch_rate(ref self: ContractState, dojomon: Dojomon, dojoball_type: DojoBallType) -> u32 {
            let base_rate = match dojoball_type {
                DojoBallType::Dojoball => 30,    // Low chance (30%)
                DojoBallType::Greatball => 50,    // Medium chance (50%)
                DojoBallType::Ultraball => 70,   // High chance (70%)
                DojoBallType::Masterball => 100, // Always catches (100%)
            };

            // Factors affecting the catch rate
            let health_factor = dojomon.health / 2;  // Lower health makes it easier to catch
            let level_factor = 50 - dojomon.level;  // Higher level makes it harder to catch
            let speed_factor = dojomon.speed / 5;  // Higher speed reduces catch chance (we divide by 5 for reasonable scaling)
            let defense_factor = dojomon.defense / 5; // Higher defense also reduces catch chance (dividing by 5)

            // Simple formula to adjust catch rate
            let catch_rate = base_rate + level_factor - health_factor - speed_factor - defense_factor;

            // Ensure the catch rate is within a valid range [0, 100]
            if catch_rate > 100 {
                return 100;
            } else if catch_rate < 0 {
                return 0;
            }

            return catch_rate;
        }
    }
    
    // impl DojoBallTypeIntoFelt252 of Into<DojoBallType, felt252> {
    // fn into(self: DojoBallType) -> felt252 {
    //     match self {
    //         DojoBallType::Dojoball => 'Dojoball',
    //         DojoBallType::Greatball => 'Greatball',
    //         DojoBallType::Ultraball => 'Ultraball',
    //         DojoBallType::Masterball => 'Masterball',
    //     }
    // }
    // }

    impl DojomonTypeIntoFelt252 of Into<DojomonType, felt252> {
        fn into(self: DojomonType) -> felt252 {
            match self {
                DojomonType::Fire => 'Fire',
                DojomonType::Grass => 'Grass',
                DojomonType::Water => 'Water',
                DojomonType::Electric => 'Electric',
                DojomonType::Ice => 'Ice',
                DojomonType::Psychic => 'Psychic',
                DojomonType::Normal => 'Normal',
                DojomonType::Ghost => 'Ghost',
                DojomonType::Flying => 'Flying',
                DojomonType::Rock => 'Rock',
                DojomonType::Ground => 'Ground',
                DojomonType::Bug => 'Bug',
                DojomonType::Dark => 'Dark',
                DojomonType::Steel => 'Steel',
                DojomonType::Dragon => 'Dragon',
                DojomonType::Fairy => 'Fairy',
                DojomonType::Poison => 'Poison',
                DojomonType::Fighting => 'Fighting',

            }
        }
    }
}
