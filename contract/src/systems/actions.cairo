use dojo_starter::models::{PlayerStats, DojoMon};

// Define the interface
#[starknet::interface]
trait IActions<T> {
    fn spawnPlayer(ref self: T);
    fn createDojomon(ref self: T, dojomonId:u32, name: felt252, health: u32, attack: u32, defense: u32, speed: u32);
    fn catchDojomon(ref self: T, dojomonId: u32);
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::{IActions, PlayerStats, DojoMon};
    use starknet::{ContractAddress, get_caller_address};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;

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
        pub dojomonId: u32,
        pub player: ContractAddress,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct DojoMonCaptured {
        #[key]
        pub dojomonId: u32,
        pub player: ContractAddress,
    }


    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        /// Spawns a new player if they do not already exist.
        fn spawnPlayer(ref self: ContractState) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Check if the player already exists
            // if let Option::Some(_) = PlayerStats::get(player) {
            //     panic!("Player already exists!");
            // }

            // Create new player stats
            let start_stats = PlayerStats {
                player,
                gold: 100,
                level: 1,
                exp: 0,
                food: 100,
                dojomonIds: ArrayTrait::<u32>::new(),
            };

            world.write_model(@start_stats);

            // Emit event for player creation
            world.emit_event(@PlayerSpawned {player,stats: start_stats});
        }

        /// Creates a new DojoMon for the calling player.
        fn createDojomon(
            ref self: ContractState,
            dojomonId: u32,
            name: felt252,
            health: u32,
            attack: u32,
            defense: u32,
            speed: u32,
        ) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Create new DojoMon
            let dojomon = DojoMon {
                dojomonId,
                player,
                name,
                health,
                attack,
                defense,
                speed,
                level: 1, // New DojoMons start at level 1
                exp: 0,   // Initial experience
            };

            world.write_model(@dojomon);

            // // Emit event for DojoMon creation
            world.emit_event(@DojoMonCreated { dojomonId, player });
        }

        /// Captures an unowned DojoMon and assigns it to the calling player.
        fn catchDojomon(ref self: ContractState, dojomonId: u32) {
            let mut world = self.world_default();
            let player = get_caller_address();

            // Check if the DojoMon exists
            //let mut dojomon = DojoMon::get(dojomonId).expect("DojoMon does not exist!");

            let mut dojomon: DojoMon = world.read_model(dojomonId);

            // Ensure the DojoMon is unowned
            // if dojomon.player != ContractAddress::default() {
            //     panic!("DojoMon is already owned!");
            // }

            // Assign the DojoMon to the player
            dojomon.player = player;
            world.write_model(@dojomon);

            // Add the DojoMon to the player's list
            let mut player_stats: PlayerStats = world.read_model(player);
            player_stats.dojomonIds.append(dojomonId);
            world.write_model(@player_stats);

            // Emit event for DojoMon capture
            world.emit_event(@DojoMonCaptured{ dojomonId, player });
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
}
