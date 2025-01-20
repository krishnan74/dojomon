use dojomon::models::{PlayerStats, Counter, Dojomon, DojoBallType, DojomonType, DojoBall, Position, League, Lobby, Move};
use starknet::{ContractAddress};


//action events
#[derive(Drop, Serde, Debug)]
#[dojo::event]
pub struct PlayerSpawned {
    #[key]
    pub player: ContractAddress,
    pub stats: PlayerStats,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::event]
pub struct DojomonCreated {
    #[key]
    pub dojomon_id: u32,
    pub player: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct DojomonCaptured {
    #[key]
    pub dojomon_id: u32,
    pub player: ContractAddress,
}

#[derive(Drop, Serde, Debug)]
#[dojo::event]
pub struct PlayerJoined {
    #[key]
    lobby_code: u32,
    player: ContractAddress,
}

//lobby events
#[derive(Drop, Serde, Debug)]
#[dojo::event]
pub struct PlayerSelectedDojomon {
    #[key]
    lobby_code: u32,
    player: ContractAddress,
    dojomon: Dojomon,
}

#[derive(Drop, Serde, Debug)]
#[dojo::event]
pub struct PlayerReady {
    #[key]
    lobby_code: u32,
    player: ContractAddress,
}

//battle events
#[derive(Drop, Serde, Debug)]
#[dojo::event]
pub struct PlayerAttacked {
    #[key]
    pub lobby_code: u32,
    pub attacker_dojomon: Dojomon,
    pub defender_dojomon: Dojomon,
    pub move: Move,
    pub lobby: Lobby,
}

#[derive(Drop, Serde, Debug)]
#[dojo::event]
pub struct BattleEnded {
    #[key]
    lobby_code: u32,
    won_dojomon_id: u32,
    lost_dojomon_id: u32,
}