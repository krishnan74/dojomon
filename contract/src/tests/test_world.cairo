#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
use dojo::model::{ModelStorage, ModelValueStorage, ModelStorageTest};
    use dojo::world::WorldStorageTrait;
    use dojo_cairo_test::{spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef};
    use core::starknet::contract_address::contract_address_to_felt252;


    use dojo_starter::systems::actions::{actions, IActionsDispatcher, IActionsDispatcherTrait};
    use dojo_starter::systems::friendSystem::{friendSystem, IFriendSystemDispatcher, IFriendSystemDispatcherTrait};
    use dojo_starter::systems::battle::{battle, IBattleDispatcher, IBattleDispatcherTrait};
    use dojo_starter::models::{PlayerStats, m_PlayerStats, Position, Counter, m_Counter, DojoMon, m_DojoMon, DojoBallType , DojomonType , DojoBall, m_DojoBall, League, Lobby, m_Lobby, ReceiverFriendRequest, m_ReceiverFriendRequest, Friend, m_Friend, Move, m_Move, MoveEffect};


    impl LeagueIntoFelt252 of Into<League, felt252> {
        fn into(self: League) -> felt252 {
            match self {
                League::Bronze => 'Bronze',
                League::Silver => 'Silver',
                League::Gold => 'Gold',
                League::Platinum => 'Platinum',
                League::Diamond => 'Diamond',
                League::Master => 'Master',
                League::GrandMaster => 'GrandMaster',
            }
        }
    }

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "dojo_starter", resources: [
                TestResource::Model(m_PlayerStats::TEST_CLASS_HASH),
                TestResource::Model(m_DojoMon::TEST_CLASS_HASH),
                TestResource::Model(m_DojoBall::TEST_CLASS_HASH),
                TestResource::Model(m_Counter::TEST_CLASS_HASH),
                TestResource::Model(m_Lobby::TEST_CLASS_HASH),
                TestResource::Model(m_ReceiverFriendRequest::TEST_CLASS_HASH),
                TestResource::Model(m_Friend::TEST_CLASS_HASH),
                TestResource::Model(m_Move::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
                TestResource::Contract(friendSystem::TEST_CLASS_HASH),
                TestResource::Contract(battle::TEST_CLASS_HASH),
            ].span()
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"dojo_starter", @"actions").with_writer_of([dojo::utils::bytearray_hash(@"dojo_starter")].span()), 
            ContractDefTrait::new(@"dojo_starter", @"battle").with_writer_of([dojo::utils::bytearray_hash(@"dojo_starter")].span()),
            ContractDefTrait::new(@"dojo_starter", @"friendSystem").with_writer_of([dojo::utils::bytearray_hash(@"dojo_starter")].span())

        ].span()
    }

    fn print_dojomon_stats(
        dojomon: DojoMon,
    ) {
        println!("Dojomon ID: {}", dojomon.dojomon_id);
        println!("Dojomon Name: {}", dojomon.name);
        println!("Dojomon HP: {}", dojomon.health);
        println!("Dojomon Attack: {}", dojomon.attack);
        println!("Dojomon Defense: {}", dojomon.defense);
        println!("Dojomon Speed: {}", dojomon.speed);
        println!("Dojomon Type: {:?}", dojomon.dojomon_type);
        println!("Dojomon Position: ({}, {})", dojomon.position.x, dojomon.position.y);
    }

    fn print_move_stats(
        move: Move,
    ) {
        println!("Move ID: {}", move.id);
        println!("Move Name: {}", move.name);
        println!("Move Power: {}", move.power);
        println!("Move Accuracy: {}", move.accuracy);
        println!("Move Type: {:?}", move.move_type);
        println!("Move Description: {}", move.description);
        println!("Move Effect: {:?}", move.effect);
    }
    

    #[test]    
    fn test_spawn() {
        //let caller = starknet::contract_address_const::<0x0>();

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };


        // actions_system.spawnPlayer(
        //     DojomonType::Fire(())
        // );

        // let initial_player: PlayerStats = world.read_model(caller);

        // let player_league: felt252 = League::Bronze.into();

        // assert(
        //     initial_player.gold == 100 && 
        //     initial_player.level == 1 &&
        //     initial_player.exp == 0 &&
        //     initial_player.food == 100 &&
        //     initial_player.trophies == 0 &&
        //     initial_player.league.into() == player_league &&
        //     initial_player.host_lobby_code == 0,
        //     'wrong initial stats'
        // );

        // println!("player spawned");

        let defender_dojomon_id : felt252 = actions_system.createDojomon(
            'Squirtle',
            100,
            100,
            100,
            100,
            DojomonType::Water(()),
            Position{
                x: 0,
                y: 0,
            },
        );

        let attacker_dojomon_id : felt252 = actions_system.createDojomon(
            'Charmander',
            100,
            100,
            100,
            100,
            DojomonType::Fire(()),
            Position{
                x: 0,
                y: 0,
            },
        );

        let defender_dojomon: DojoMon = world.read_model(defender_dojomon_id);
        let attacker_dojomon: DojoMon = world.read_model(attacker_dojomon_id);


        //println!("Attacker Dojomon spawned");
        //print_dojomon_stats(attacker_dojomon);

        //println!("Defender Dojomon spawned");
       // print_dojomon_stats(defender_dojomon);

        let move_id : u32 = 4;
        let move_name : felt252 = 'Ember';
        let move_description : ByteArray = "A small flame attack that may leave the opponent burned." ;

        let move = Move {
            id: move_id,
            name: move_name,
            power: 40,
            accuracy: 100,
            move_type: DojomonType::Fire(()),
            description: move_description,
            effect: MoveEffect::Burn(()),
        };

        world.write_model(@move);

        println!("Attacker Dojomon id from test {}", attacker_dojomon_id);

        test_attack(attacker_dojomon_id, defender_dojomon_id, move_id);

    }

    #[test]
    fn test_friend_system (){

        //let caller = starknet::contract_address_const::<0x0>();

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"friendSystem").unwrap();
        let friends_system = IFriendSystemDispatcher { contract_address };

        let receiver_felt252 = contract_address_to_felt252 (starknet::contract_address_const::<0x1>());

        friends_system.sendFriendRequest(
            receiver_felt252
        );

        // friends_system.acceptFriendRequest(
        //     receiver_felt252
        // );

        let friend_request: ReceiverFriendRequest = world.read_model(starknet::contract_address_const::<0x1>());

        assert(
            friend_request.receiver == starknet::contract_address_const::<0x1>() &&
            friend_request.sender == starknet::contract_address_const::<0x0>() &&
            friend_request.accepted == false &&
            friend_request.active == true,
            'wrong friend request'
        );

    }

    fn test_attack(
        attacker_dojomon_id: felt252,
        defender_dojomon_id: felt252,
        move_id: u32,
    ) {

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"battle").unwrap();
        let battle_system = IBattleDispatcher { contract_address };

        let after_attack_attacker_dojomon: DojoMon = world.read_model(attacker_dojomon_id);

        println!("Attacker Dojomon Stats after attack");
        print_dojomon_stats(after_attack_attacker_dojomon);

        battle_system.attack(attacker_dojomon_id, defender_dojomon_id, move_id);

        let after_attack_defender_dojomon: DojoMon = world.read_model(defender_dojomon_id);

        

        println!("Defender Dojomon Stats after attack");
        print_dojomon_stats(after_attack_defender_dojomon);

    


    }

    
}
