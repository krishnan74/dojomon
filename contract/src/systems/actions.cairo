use dojomon::models::{PlayerStats, Counter, DojoMon, DojoBallType, DojomonType, DojoBall, Position, League, Lobby,};
use starknet::{ContractAddress, get_caller_address, contract_address_const};

// Define the interface
#[starknet::interface]
trait IActions<T> {
    fn spawnPlayer(ref self: T, starting_dojo_mon: DojomonType);
    fn buyDojoBall( ref self: T, dojoball_type: DojoBallType, quantity: u32, dojomon_id: u32, has_dojomon: bool);
    fn feedDojoMon(ref self: T, dojomon_id: u32, quantity: u32);
    fn createDojomon(ref self: T, name: felt252, health: u32, attack: u32, defense: u32, speed: u32, dojomon_type: DojomonType, position: Position) -> u32;
    fn catchDojomon(ref self: T, dojomon_id: u32);
    
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::{IActions, PlayerStats, Counter, DojoMon,DojoBall, DojoBallType, DojomonType, Position, League};
    use starknet::{ContractAddress, get_caller_address, contract_address_const};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
    use core::starknet::contract_address::contract_address_to_felt252;
    use dojo::world::WorldStorage;
    use dojo::world::IWorldDispatcherTrait;
    use core::poseidon::poseidon_hash_span;

    #[derive(Drop, Serde, Debug)]
    #[dojo::event]
    pub struct PlayerSpawned {
        #[key]
        pub player: ContractAddress,
        pub stats: PlayerStats,
    }

    #[derive(Copy, Drop, Serde, Debug)]
    #[dojo::event]
    pub struct DojoMonCreated {
        #[key]
        pub dojomon_id: u32,
        pub player: ContractAddress,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct DojoMonCaptured {
        #[key]
        pub dojomon_id: u32,
        pub player: ContractAddress,
    }

    const COUNTER_ID: u32 = 999;
    const DOJOMON : felt252 = 'DOJOMON';
    const LOBBY: felt252 = 'LOBBY';
    const INCREASE_HEALTH_PER_FOOD: u32 = 10;
    const DOJOBALL_PRICE : u32 = 50;
    const GREATBALL_PRICE : u32 = 100;
    const ULTRABALL_PRICE : u32 = 200;
    const MASTERBALL_PRICE : u32 = 300;
    const RANDOM_NUMBER: u32 = 3;
    
    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawnPlayer(ref self: ContractState, starting_dojo_mon: DojomonType) {

            
            let mut world = self.world_default();
            let player = get_caller_address();
            
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
                    self.createDojomon( 'Charmander', 30, 50, 20, 2, DojomonType::Fire, Position { x: 0, y: 0 })
                    

                },
                
                DojomonType::Grass =>{
                    self.createDojomon( 'Bulbasaur', 60, 20, 20, 1, DojomonType::Grass, Position { x: 0, y: 0 })
                    

                
                },  

                DojomonType::Water =>{
                    self.createDojomon( 'Squirtle', 30, 30, 40, 3, DojomonType::Water, Position { x: 0, y: 0 })
                
                },
                
                _ => 0,
                
            };
            
            let start_stats = PlayerStats {
                player,
                gold: 100,
                level: 1,
                exp: 0,
                food: 100,
                league: League::Bronze,
                trophies: 0,

            };

            //writing the player stats
            world.write_model(@start_stats);

            
            let dojoball_id = world.dispatcher.uuid();

            let dojoball = DojoBall {
                dojoball_id,
                player,
                dojomon_id: created_dojomon_id,
                position: Position { x: 0, y: 0 },
                dojoball_type: DojoBallType::Dojoball,
                has_dojomon: true,
            };

            world.write_model(@dojoball);

            // Emit event for player creation
            world.emit_event(@PlayerSpawned {player,stats: start_stats});
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
        
        fn feedDojoMon(ref self: ContractState, dojomon_id: u32, quantity: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Check if the DojoMon exists

            let mut dojomon: DojoMon = world.read_model(dojomon_id);

            // Ensure the DojoMon is owned by the player
            if dojomon.player != player {
                panic!("DojoMon is not owned by the player!");
            }

            // Increase the DojoMon's health
            dojomon.health += INCREASE_HEALTH_PER_FOOD * quantity;

            world.write_model(@dojomon);
        }

        /// Creates a new DojoMon for the calling player.
        fn createDojomon(
            ref self: ContractState,
            name: felt252,
            health: u32,
            attack: u32,
            defense: u32,
            speed: u32,
            dojomon_type: DojomonType,
            position: Position,

        ) -> u32 {
            let mut world = self.world_default();
            let player = get_caller_address();
            
            let mut counter : Counter = world.read_model(COUNTER_ID);



            //incrementing the counter
            counter.dojomon_count += 1;

            world.write_model(@counter);


            let dojomon_id = world.dispatcher.uuid();



            // Create new DojoMon
            let dojomon = DojoMon {
                dojomon_id,
                player,
                name,
                health,
                attack,
                defense,
                speed,
                level: 1, // New DojoMons start at level 1
                exp: 0,   // Initial experience
                dojomon_type,
                position
            };

            world.write_model(@dojomon);

            // // Emit event for DojoMon creation
            world.emit_event(@DojoMonCreated { dojomon_id, player });

            dojomon_id
        }

        /// Captures an unowned DojoMon and assigns it to the calling player.
        fn catchDojomon(ref self: ContractState, dojomon_id: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Check if the DojoMon exists
            //let mut dojomon = DojoMon::get(dojomon_id).expect("DojoMon does not exist!");

            let mut dojomon: DojoMon = world.read_model(dojomon_id);

            // Ensure the DojoMon is unowned
            // if dojomon.player != ContractAddress::default() {
            //     panic!("DojoMon is already owned!");
            // }

            // Assign the DojoMon to the player
            dojomon.player = player;
            world.write_model(@dojomon);

            // Add the DojoMon to the player's list
            let mut player_stats: PlayerStats = world.read_model(player);
            world.write_model(@player_stats);

            // Emit event for DojoMon capture
            world.emit_event(@DojoMonCaptured{ dojomon_id, player });
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
