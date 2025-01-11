use starknet::{ContractAddress};

#[derive(Drop, Serde, Debug)]
#[dojo::model]
pub struct PlayerStats{
    #[key]
    pub player: ContractAddress,
    pub gold: u32,
    pub level: u32,
    pub exp: u32,
    pub food: u32,
    pub dojomonIds: Array<u32>,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DojoMon{
    #[key]
    pub dojomonId: u32,
    pub player: ContractAddress,
    pub name: felt252,
    pub health: u32,
    pub attack: u32,
    pub defense: u32,
    pub speed: u32,
    pub level: u32,
    pub exp: u32,
}

