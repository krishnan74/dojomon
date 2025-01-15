use starknet::{ContractAddress};

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct PlayerStats{
    #[key]
    pub player: ContractAddress,
    pub gold: u32,
    pub level: u32,
    pub exp: u32,
    pub food: u32,
    pub trophies: u32,
    pub league: League,
    pub host_lobby_code: felt252,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Lobby{
    #[key]
    pub lobby_code: felt252,
    pub host_player: ContractAddress,
    pub guest_player: ContractAddress,
    pub host_ready: bool,
    pub guest_ready: bool,
    pub host_dojomon_id: felt252,
    pub guest_dojomon_id: felt252,
    pub can_join: bool,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct ReceiverFriendRequest{
    #[key]
    pub receiver: ContractAddress,
    pub sender: ContractAddress,
    pub active: bool,
    pub accepted: bool,
}

#[derive (Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Friend{
    #[key]
    pub friend: ContractAddress,
    pub player: ContractAddress,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DojoMon{
    #[key]
    pub dojomon_id: felt252,
    pub player: ContractAddress,
    pub name: felt252,
    pub health: u32,
    pub attack: u32,
    pub defense: u32,
    pub speed: u32,
    pub level: u32,
    pub exp: u32,
    pub dojomon_type: DojomonType,
    pub position: Position,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DojoBall{
    #[key]
    pub dojoball_id: felt252,
    pub player: ContractAddress,
    pub dojomon_id: felt252,
    pub position: Position,
    pub dojoball_type: DojoBallType,
    pub has_dojomon: bool,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
struct Counter {
    #[key]
    counter: u32,
    player_count : u32,
    dojoball_count: u32,
    dojomon_count: u32,
}

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
pub struct Position{
    pub x: u32,
    pub y: u32,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug)]
pub enum DojomonType{
    Fire,
    Water,
    Grass,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug)]
pub enum League{
    Bronze,
    Silver,
    Gold,
    Platinum,
    Diamond,
    Master,
    GrandMaster,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug,)]
pub enum DojoBallType{
    Dojoball,
    Greatball,
    Ultraball,
    Masterball,
}




