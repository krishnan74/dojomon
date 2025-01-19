use dojomon::models::{
    PlayerStats,
    Lobby, LobbyType,
    Dojomon, Player
};
use dojomon::events::{
    PlayerSelectedDojomon,
    PlayerReady,
    PlayerJoined,
};
use starknet::{ContractAddress, get_caller_address};

// Define the interface
#[starknet::interface]
trait ILobby<T> {
    fn createLobby(ref self: T, lobby_type: LobbyType) -> u32;
    fn joinLobby(ref self: T, lobby_code: u32);
    fn selectDojomon(ref self: T, lobby_code: u32, dojomon_id: u32);
    fn readyForBattle(ref self: T, lobby_code: u32);
}

// Dojo contract
#[dojo::contract]
pub mod lobby {
    
    use super::{
            ILobby, PlayerStats, Lobby, LobbyType, PlayerSelectedDojomon, PlayerReady, PlayerJoined, Dojomon, Player
        };
    use starknet::{ContractAddress, get_caller_address};
    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;
    use dojo::world::WorldStorage;
    use dojo::world::IWorldDispatcherTrait;

    

    #[abi(embed_v0)]
    impl LobbyImpl of ILobby<ContractState> {

        fn createLobby(ref self: ContractState, lobby_type: LobbyType) -> u32 {
            let mut world = self.world_default();
            let host_player_address = get_caller_address();

            let host_player_stats: PlayerStats = world.read_model(host_player_address);

            let lobby_code = world.dispatcher.uuid();

            let host_player = Player{
                address: host_player_address,
                name: host_player_stats.name,
                gold: host_player_stats.gold,
                level: host_player_stats.level,
                exp: host_player_stats.exp,
                food: host_player_stats.food,
                trophies: host_player_stats.trophies,
            };

            let guest_player = Player{
                address: Zeroable::zero(),
                name: Zeroable::zero(),
                gold: 0,
                level: 0,
                exp: 0,
                food: 0,
                trophies: 0,
            };

            // Creating new lobby
            let lobby = Lobby {
                lobby_code,
                host_player,
                guest_player,
                host_ready: false,
                guest_ready: false,
                host_dojomon_id: 0,
                guest_dojomon_id: 0,
                is_vacant: true,
                lobby_type,
                turn: host_player.address,
                lobby_league: host_player_stats.league,
                lobby_exp: host_player_stats.exp,
                lobby_level: host_player_stats.level,
            };

            world.write_model(@lobby);
            lobby_code 
        }

        fn joinLobby(ref self: ContractState, lobby_code: u32) {
            let mut world = self.world_default();
            let guest_player_address = get_caller_address();

            let mut lobby: Lobby = world.read_model(lobby_code);

            // Ensure the lobby is not full
            if lobby.is_vacant == false {
                panic!("Lobby is full!");
            }

            let guest_player_stats: PlayerStats = world.read_model(guest_player_address);

            let guest_player = Player{
                address: guest_player_address,
                name: guest_player_stats.name,
                gold: guest_player_stats.gold,
                level: guest_player_stats.level,
                exp: guest_player_stats.exp,
                food: guest_player_stats.food,
                trophies: guest_player_stats.trophies,
            };

            // Assign the guest player to the lobby
            lobby.guest_player = guest_player;
            lobby.is_vacant = false;
            world.write_model(@lobby);

            world.emit_event(@PlayerJoined{lobby_code, player:  guest_player.address});
        }

        fn readyForBattle(
            ref self: ContractState,
            lobby_code: u32
        ) {
            let mut world = self.world_default();
            let player_address = get_caller_address();

            let mut lobby: Lobby = world.read_model(lobby_code);

            if player_address == lobby.host_player.address {
                lobby.host_ready = true;
            } else {
                lobby.guest_ready = true;
            }

            world.write_model(@lobby);
            world.emit_event(@PlayerReady{lobby_code, player: player_address});
        }

        fn selectDojomon(
            ref self: ContractState,
            lobby_code: u32, dojomon_id: u32
        ){
            let mut world = self.world_default();
            let player_address = get_caller_address();

            let mut lobby: Lobby = world.read_model(lobby_code);

            if player_address == lobby.host_player.address {
                lobby.host_dojomon_id = dojomon_id;
            } else {
                lobby.guest_dojomon_id = dojomon_id;
            }

            let dojomon: Dojomon = world.read_model(dojomon_id);

            world.write_model(@lobby);
            world.emit_event(@PlayerSelectedDojomon{
                lobby_code,
                player: player_address,
                dojomon
            });
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

}