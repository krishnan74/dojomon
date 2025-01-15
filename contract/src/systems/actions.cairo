use dojo_starter::models::{PlayerStats, Counter, DojoMon, DojoBallType, DojomonType, DojoBall, Position, League, Lobby, ReceiverFriendRequest, Friend};
use starknet::{ContractAddress, get_caller_address, contract_address_const};

// Define the interface
#[starknet::interface]
trait IActions<T> {
    fn spawnPlayer(ref self: T, starting_dojo_mon: DojomonType);
    fn buyDojoBall( ref self: T, dojoball_type: DojoBallType, quantity: u32, dojomon_id: felt252, has_dojomon: bool);
    fn feedDojoMon(ref self: T, dojomon_id: felt252, quantity: u32);
    fn createDojomon(ref self: T, name: felt252, health: u32, attack: u32, defense: u32, speed: u32, dojomon_type: DojomonType, position: Position) -> felt252;
    fn catchDojomon(ref self: T, dojomon_id: felt252);
    fn createLobby(ref self: T) -> felt252;
    fn joinLobby(ref self: T, lobby_code: felt252);
    fn sendFriendRequest(ref self: T, receiver_felt252: felt252);
    fn acceptFriendRequest(ref self: T, sender_felt252: felt252);
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::{IActions, PlayerStats, Counter, DojoMon,DojoBall, DojoBallType, DojomonType, Position, League, Lobby, ReceiverFriendRequest, Friend};
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
    const LOBBY: felt252 = 'LOBBY';
    const INCREASE_HEALTH_PER_FOOD: u32 = 10;
    const DOJOBALL_PRICE : u32 = 50;
    const GREATBALL_PRICE : u32 = 100;
    const ULTRABALL_PRICE : u32 = 200;
    const MASTERBALL_PRICE : u32 = 300;
    



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
            
            let start_stats = PlayerStats {
                player,
                gold: 100,
                level: 1,
                exp: 0,
                food: 100,
                league: League::Bronze,
                trophies: 0,
                host_lobby_code: 0,
            };

            //writing the player stats
            world.write_model(@start_stats);

            self.buyDojoBall(
                DojoBallType::Dojoball,
                1,
                created_dojomon_id,
                true
            );

            // Emit event for player creation
            world.emit_event(@PlayerSpawned {player,stats: start_stats});
        }

        fn buyDojoBall( ref self: ContractState,  dojoball_type: DojoBallType, quantity: u32, dojomon_id: felt252, has_dojomon: bool) { 
            let mut world = self.world_default();
            let player = get_caller_address();

            let player_felt252 = contract_address_to_felt252(player);
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

                let dojoball_count_felt: felt252 = dojoball_count.into();

                let dojoball_id = poseidon_hash_span([dojoball_count_felt, player_felt252].span());

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
        
        fn feedDojoMon(ref self: ContractState, dojomon_id: felt252, quantity: u32) {
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

        ) -> felt252 {
            let mut world = self.world_default();
            let player = get_caller_address();
            let player_felt252 = contract_address_to_felt252(player);
            
            let mut counter : Counter = world.read_model(COUNTER_ID);


            let dojomon_count = counter.dojomon_count;

            //incrementing the counter
            counter.dojomon_count += 1;

            world.write_model(@counter);

            let dojomon_count_felt: felt252 = dojomon_count.into();

            let dojomon_id = poseidon_hash_span([dojomon_count_felt, player_felt252].span());


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

        fn createLobby(ref self: ContractState) -> felt252 {
            let mut world = self.world_default();
            let host_player = get_caller_address();

            let host_player_felt252: felt252 = host_player.into();

            let lobby_code = poseidon_hash_span([host_player_felt252, LOBBY].span());

            let player_stats: PlayerStats = world.read_model(host_player);

            if( player_stats.host_lobby_code == lobby_code ){
                lobby_code
            }

            else{
                // Creating new lobby
                let lobby = Lobby {
                    lobby_code,
                    host_player,
                    guest_player: Zeroable::zero(),
                    host_ready: false,
                    guest_ready: false,
                    host_dojomon_id: 0,
                    guest_dojomon_id: 0,
                    can_join: true,
                };

                world.write_model(@lobby);
                lobby_code
            }
            
        }

        fn joinLobby(ref self: ContractState, lobby_code: felt252) {
            let mut world = self.world_default();
            let guest_player = get_caller_address();

            let mut lobby: Lobby = world.read_model(lobby_code);

            // Ensure the lobby is not full
            if lobby.can_join == false {
                panic!("Lobby is full!");
            }

            // Assign the guest player to the lobby
            lobby.guest_player = guest_player;
            lobby.can_join = false;
            world.write_model(@lobby);
        }

        fn sendFriendRequest(
            ref self: ContractState,
            receiver_felt252: felt252,
        ) {
            let mut world = self.world_default();
            let sender = get_caller_address();
            let receiver: ContractAddress = receiver_felt252.try_into().unwrap();

            
            // Create a new receiver friend request
            let receiver_friend_request = ReceiverFriendRequest {
                receiver,
                sender,
                accepted: false,
                active: true,
            };

            world.write_model(@receiver_friend_request);
        }

        fn acceptFriendRequest(
            ref self: ContractState,
            sender_felt252: felt252,
        ) {
            let mut world = self.world_default();
            let player = get_caller_address();
            let sender: ContractAddress = sender_felt252.try_into().unwrap();

            let mut sender_friend_request: ReceiverFriendRequest = world.read_model(sender);

            sender_friend_request.accepted = true;
            sender_friend_request.active = false;

            world.write_model(@sender_friend_request);

            // Create a new friend
            let friend = Friend {
                friend: sender,

                player,
            };

            world.write_model(@friend);
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
