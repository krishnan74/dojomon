use dojomon::models::{PlayerStats, Counter, Dojomon, DojoBallType, DojomonType, DojoBall, Position, League, Lobby, Move, MoveEffect};
use dojomon::events::{PlayerSpawned, DojomonCreated, DojomonCaptured};
use starknet::{ContractAddress, get_caller_address, contract_address_const};

// Define the interface
#[starknet::interface]
trait IActions<T> {
    fn spawnPlayer(ref self: T, player_address: ContractAddress, name: felt252, starting_dojo_mon: DojomonType) -> u32;
    fn createDojomon(ref self: T, player_address: ContractAddress, name: felt252, health: u32, attack: u32, defense: u32, speed: u32, evolution: u32, dojomon_type: DojomonType, position: Position, is_free: bool, is_being_caught: bool) -> u32;
    fn buyDojoBall( ref self: T, dojoball_type: DojoBallType, quantity: u32, dojomon_id: u32, has_dojomon: bool);
    fn feedDojomon(ref self: T, dojomon_id: u32, quantity: u32);
    fn catchDojomon(ref self: T, dojomon_id: u32);
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::{IActions, PlayerStats, Counter, Dojomon,DojoBall, DojoBallType, DojomonType, Position, League, Lobby, PlayerSpawned, DojomonCreated, DojomonCaptured, Move, MoveEffect, ContractAddress, get_caller_address, contract_address_const};
    use dojo::model::{ModelStorage, ModelValueStorage};
    
    use dojo::event::EventStorage;
    use core::starknet::contract_address::contract_address_to_felt252;
    use dojo::world::WorldStorage;
    use dojo::world::IWorldDispatcherTrait;

    const COUNTER_ID: u32 = 999;
    const INCREASE_HEALTH_PER_FOOD: u32 = 10;
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
        fn spawnPlayer(ref self: ContractState, player_address: ContractAddress, name: felt252, starting_dojo_mon: DojomonType) -> u32 {

            
            let mut world = self.world_default();
            //let player = get_caller_address();
            
            //reading counter model
            let mut counter : Counter = world.read_model(COUNTER_ID);

            //incrementing the counter
            counter.player_count += 1;
            
            counter.dojoball_count += 1;

            counter.dojomon_count += 1;

            world.write_model(@counter);

            
            //creating starting dojomon based on the input
            let created_dojomon_id = match starting_dojo_mon {
                DojomonType::Fire => {
                    let dojomon_id = self.createDojomon( player_address, 'Charmander', charmander.health, charmander.attack, charmander.defense, charmander.speed, 0, DojomonType::Fire, Position { x: 0, y: 0 }, false, false);
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

                    print!("move id: {}", move.id);
                    world.write_model(@move);
                    dojomon_id                    

                },
                
                DojomonType::Grass =>{
                    let dojomon_id = self.createDojomon( player_address, 'Bulbasaur', bulbasaur.health, bulbasaur.attack, bulbasaur.defense, bulbasaur.speed, 0, DojomonType::Grass, Position { x: 0, y: 0 }, false, false);
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

                    print!("move id: {}", move.id);

                    world.write_model(@move);
                    dojomon_id
                },

                DojomonType::Water =>{
                    let dojomon_id = self.createDojomon( player_address, 'Squirtle', squirtle.health, squirtle.attack, squirtle.defense, squirtle.speed, 0, DojomonType::Water, Position { x: 0, y: 0 }, false, false);
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

                    print!("move id: {}", move.id);

                    world.write_model(@move);
                    dojomon_id 
                },
                
                _ => 0,
                
            };
            
            let start_stats = PlayerStats {
                name,
                player: player_address,
                gold: 100,
                level: 1,
                exp: 0,
                food: 100,
                league: League::Bronze,
                trophies: 100,
            };

            //writing the player stats
            world.write_model(@start_stats);

            
            let dojoball_id = world.dispatcher.uuid();

            let dojoball = DojoBall {
                dojoball_id,
                player: player_address,
                dojomon_id: created_dojomon_id,
                position: Position { x: 0, y: 0 },
                dojoball_type: DojoBallType::Dojoball,
                has_dojomon: true,
            };

            world.write_model(@dojoball);

            // Emit event for player creation
            world.emit_event(@PlayerSpawned {player: player_address,stats: start_stats});

            created_dojomon_id
        }

        fn buyDojoBall( ref self: ContractState,  dojoball_type: DojoBallType, quantity: u32, dojomon_id: u32, has_dojomon: bool) { 
            let mut world = self.world_default();
            let player = get_caller_address();

            let mut counter : Counter = world.read_model(COUNTER_ID);
            
            let mut dojoball_count = counter.dojoball_count;

            //incrementing the counter
            counter.dojoball_count += quantity;
            world.write_model(@counter);

            

            //mapping dojoball type to gold expense
            let gold_expense = match dojoball_type {
                DojoBallType::Dojoball => DOJOBALL_PRICE,
                DojoBallType::Greatball => GREATBALL_PRICE,
                DojoBallType::Ultraball => ULTRABALL_PRICE,
                DojoBallType::Masterball => MASTERBALL_PRICE,
            };

            // Deduct gold from player
            let mut player_stats: PlayerStats = world.read_model(player);
            player_stats.gold -= gold_expense * quantity;
            world.write_model(@player_stats);


            //creating new dojo_balls
            for _ in 0..quantity{

                dojoball_count+=1;


                let dojoball_id = world.dispatcher.uuid();

                let dojoball = DojoBall {
                    dojoball_id,
                    player,
                    dojomon_id,
                    position: Position { x: 0, y: 0 },
                    dojoball_type,
                    has_dojomon,
                };

                world.write_model(@dojoball);
            }

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
            player_address: ContractAddress,
            name: felt252,
            health: u32,
            attack: u32,
            defense: u32,
            speed: u32,
            evolution: u32,
            dojomon_type: DojomonType,
            position: Position,
            is_free: bool,
            is_being_caught: bool
        ) -> u32 {
            let mut world = self.world_default();
            
            let mut counter : Counter = world.read_model(COUNTER_ID);

            //incrementing the counter
            counter.dojomon_count += 1;

            world.write_model(@counter);


            let dojomon_id = world.dispatcher.uuid();



            // Create new Dojomon
            let dojomon = Dojomon {
                dojomon_id,
                player: player_address,
                name,
                health,
                attack,
                defense,
                speed,
                level: 1, // New Dojomons start at level 1
                exp: 0,   // Initial experience
                evolution,
                dojomon_type,
                position,
                is_free,
                is_being_caught
            };

            world.write_model(@dojomon);

            // // Emit event for Dojomon creation
            world.emit_event(@DojomonCreated { dojomon_id, player: player_address });

            dojomon_id
        }

        /// Captures an unowned Dojomon and assigns it to the calling player.
        fn catchDojomon(ref self: ContractState, dojomon_id: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Check if the Dojomon exists
            //let mut dojomon = Dojomon::get(dojomon_id).expect("Dojomon does not exist!");

            let mut dojomon: Dojomon = world.read_model(dojomon_id);

            // Ensure the Dojomon is unowned
            // if dojomon.player != ContractAddress::default() {
            //     panic!("Dojomon is already owned!");
            // }

            // Assign the Dojomon to the player
            dojomon.player = player;
            world.write_model(@dojomon);

            // Add the Dojomon to the player's list
            let mut player_stats: PlayerStats = world.read_model(player);
            world.write_model(@player_stats);

            // Emit event for Dojomon capture
            world.emit_event(@DojomonCaptured{ dojomon_id, player });
        }

        
        
    }

    /// Internal trait implementation for helper functions
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Returns the default world storage for the contract.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojomon")
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
