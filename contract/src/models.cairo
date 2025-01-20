use starknet::{ContractAddress};

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct PlayerStats{
    #[key]
    pub address: ContractAddress,
    pub name: felt252,
    pub gold: u32,
    pub level: u32,
    pub exp: u32,
    pub food: u32,
    pub trophies: u32,
    pub league: League,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Inventory{
    #[key]
    pub player: ContractAddress,
    pub dojoballs: u32,
    pub greatballs: u32,
    pub ultraballs: u32,
    pub masterballs: u32,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Lobby{
    #[key]
    pub lobby_code: u32,
    pub host_player: Player,
    pub guest_player: Player,
    pub host_ready: bool,
    pub guest_ready: bool,
    pub host_dojomon: DojomonStruct,
    pub guest_dojomon: DojomonStruct,
    pub is_vacant: bool,
    pub lobby_type: LobbyType,
    pub turn: ContractAddress,

    //for matchmaking purposes
    pub lobby_league: League,
    pub lobby_exp: u32,
    pub lobby_level: u32,

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
pub struct Dojomon{
    #[key]
    pub dojomon_id: u32,
    pub player: ContractAddress,
    pub name: felt252,
    pub health: u32,
    pub max_health: u32,
    pub attack: u32,
    pub defense: u32,
    pub speed: u32,
    pub level: u32,
    pub exp: u32,
    pub evolution: u32,
    pub dojomon_type: DojomonType,
    pub position: Position,
    pub is_free: bool,
    pub is_being_caught: bool,
    pub image_id: u32,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DojoBall{
    #[key]
    pub dojoball_id: u32,
    pub player: ContractAddress,
    pub dojomon_id: u32,
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

#[derive( Drop, Serde, Debug)]
#[dojo::model]
struct Move {
    #[key]
    id: u32,
    #[key]
    dojomon_id: u32,
    name: felt252,
    description: ByteArray,
    power: u32,
    accuracy: u32,
    move_type: DojomonType, 
    effect: MoveEffect,
}

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
pub struct Position{
    pub x: u32,
    pub y: u32,
}

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
pub struct Player{
    pub address: ContractAddress,
    pub name: felt252,
    pub gold: u32,
    pub level: u32,
    pub exp: u32,
    pub food: u32,
    pub trophies: u32,
}

#[derive(Copy, Drop, Serde, IntrospectPacked, Debug)]
pub struct DojomonStruct{
    pub dojomon_id: u32,
    pub player: ContractAddress,
    pub name: felt252,
    pub health: u32,
    pub attack: u32,
    pub defense: u32,
    pub speed: u32,
    pub level: u32,
    pub exp: u32,
    pub evolution: u32,
    pub dojomon_type: felt252,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug)]
pub enum MoveEffect{
    Burn,
    Paralyze,
    Confuse,
    LowerSpecialDefense,
    Flinch,
    Freeze
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug)]
pub enum LobbyType{
    Public, 
    Private,
}

#[derive(Serde, Copy, Drop, Introspect, PartialEq, Debug)]
pub enum DojomonType {
    Fire,
    Water,
    Grass,
    Electric,
    Normal,
    Flying,
    Rock,
    Ground,
    Ice,
    Bug,
    Psychic,
    Dark,
    Steel,
    Dragon,
    Fairy,
    Ghost,
    Poison,
    Fighting,
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




