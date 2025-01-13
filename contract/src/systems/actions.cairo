use dojo_starter::models::{PlayerStats, Counter, DojoMon, DojoBallType, DojomonType, DojoBall, Position};

// Define the interface
#[starknet::interface]
trait IActions<T> {
    fn spawnPlayer(ref self: T, starting_dojo_mon: DojomonType);
    fn createDojomon(ref self: T, name: felt252, health: u32, attack: u32, defense: u32, speed: u32, dojomon_type: DojomonType, position: Position) -> felt252;
    fn catchDojomon(ref self: T, dojomon_id: felt252);
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::{IActions, PlayerStats, Counter, DojoMon,DojoBall, DojoBallType, DojomonType, Position};
    use starknet::{ContractAddress, get_caller_address};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
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
        pub dojomon_id: felt252,
        pub player: ContractAddress,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct DojoMonCaptured {
        #[key]
        pub dojomon_id: felt252,
        pub player: ContractAddress,
    }


    const COUNTER_ID: u32 = 999;
    const DOJOMON : felt252 = 'DOJOMON';


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

            world.write_model(@counter);



            

            //let dojomon =  
            //creating starting dojomon based on the input
            let created_dojomon_id = match starting_dojo_mon {
                DojomonType::Fire => {
                    self.createDojomon( 'Charmander', 30, 50, 20, 2, DojomonType::Fire, Position { x: 0, y: 0 })
                    // dojomon = DojoMon{
                    //     dojomon_id, 
                    //     player,
                    //     name: 'Charmander',
                    //     health: 30,
                    //     attack: 50,
                    //     defense: 20,
                    //     speed: 2,
                    //     level: 1,
                    //     exp: 0,
                    //     dojomon_type: DojomonType::Fire,
                    //     position: Position { x: 0, y: 0 }
                    // };

                    // world.write_model(@dojomon);

                },
                
                DojomonType::Grass =>{
                    self.createDojomon( 'Bulbasaur', 60, 20, 20, 1, DojomonType::Grass, Position { x: 0, y: 0 })
                    // let dojomon = DojoMon{
                    //     dojomon_id, 
                    //     player,
                    //     name: 'Bulbasaur',
                    //     health: 60,
                    //     attack: 20,
                    //     defense: 20,
                    //     speed: 1,
                    //     level: 1,
                    //     exp: 0,
                    //     dojomon_type: DojomonType::Grass,
                    //     position: Position { x: 0, y: 0 }
                    // };

                    // world.write_model(@dojomon);

                
                },  

                DojomonType::Water =>{
                    self.createDojomon( 'Squirtle', 30, 30, 40, 3, DojomonType::Water, Position { x: 0, y: 0 })
                    // let dojomon = DojoMon{
                    //     dojomon_id, 
                    //     player,
                    //     name: 'Squirtle',
                    //     health: 30,
                    //     attack: 30,
                    //     defense: 40,
                    //     speed: 3,
                    //     level: 1,
                    //     exp: 0,
                    //     dojomon_type: DojomonType::Water,
                    //     position: Position { x: 0, y: 0 }
                    // };

                    // world.write_model(@dojomon);

                
                }
                
            };


            //creating starting dojoball
            let starting_dojo_ball = DojoBall {
                player,
                dojomon_id: created_dojomon_id,
                position: Position { x: 0, y: 0 },
                dojoball_type: DojoBallType::Dojoball,
            };

            world.write_model(@starting_dojo_ball);


            
            let start_stats = PlayerStats {
                player,
                gold: 100,
                level: 1,
                exp: 0,
                food: 100,
            };

            //writing the player stats
            world.write_model(@start_stats);

            // Emit event for player creation
            world.emit_event(@PlayerSpawned {player,stats: start_stats});
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

        ) -> felt252 {
            let mut world = self.world_default();
            let player = get_caller_address();
            let mut counter : Counter = world.read_model(COUNTER_ID);

            let dojomon_count = counter.dojomon_count;

            //incrementing the counter
            counter.dojomon_count += 1;

            world.write_model(@counter);

            let dojomon_count_felt: felt252 = dojomon_count.into();

            let dojomon_id = poseidon_hash_span([dojomon_count_felt, DOJOMON].span());


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
        fn catchDojomon(ref self: ContractState, dojomon_id: felt252) {
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
            self.world(@"dojo_starter")
        }
    }

    
    impl DojoBallTypeIntoFelt252 of Into<DojoBallType, felt252> {
    fn into(self: DojoBallType) -> felt252 {
        match self {
            DojoBallType::Dojoball => 'Dojoball',
            DojoBallType::Greatball => 'Greatball',
            DojoBallType::Ultraball => 'Ultraball',
            DojoBallType::Masterball => 'Masterball',
        }
    }
}
}
