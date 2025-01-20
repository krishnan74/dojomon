#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage, ModelValueStorage, ModelStorageTest};
    use dojo::world::WorldStorageTrait;
    use dojo::world::WorldStorage;
    use dojo::world::IWorldDispatcherTrait;
    use dojo_cairo_test::{spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef};
    use core::starknet::contract_address::contract_address_to_felt252;


    use dojomon::systems::actions::{actions, IActionsDispatcher, IActionsDispatcherTrait};
    use dojomon::systems::friendSystem::{friendSystem, IFriendSystemDispatcher, IFriendSystemDispatcherTrait};
    use dojomon::systems::battle::{battle, IBattleDispatcher, IBattleDispatcherTrait};
    use dojomon::systems::lobby::{lobby, ILobbyDispatcher, ILobbyDispatcherTrait};
    use dojomon::systems::shop::{shop, IShopDispatcher, IShopDispatcherTrait};
    use dojomon::events::{
        PlayerSpawned, e_PlayerSpawned,
        DojomonCreated, e_DojomonCreated,
        DojomonCaptured, e_DojomonCaptured,   
        PlayerAttacked, e_PlayerAttacked,
        PlayerSelectedDojomon, e_PlayerSelectedDojomon,
        PlayerReady, e_PlayerReady,
        PlayerJoined, e_PlayerJoined,
        BattleEnded, e_BattleEnded,
    };
    use dojomon::models::{PlayerStats, m_PlayerStats, Position, Counter, m_Counter, Dojomon, m_Dojomon, DojoBallType , DojomonType , DojoBall, m_DojoBall, League, Lobby, m_Lobby, LobbyType, ReceiverFriendRequest, m_ReceiverFriendRequest, Friend, m_Friend, Move, m_Move, MoveEffect};
    use dojomon::utils::random::{Random, RandomImpl, RandomTrait};


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

    impl LobbyTypeIntoFelt252 of Into<LobbyType, felt252>{
        fn into (self: LobbyType) -> felt252 {
            match self {
                LobbyType::Public => 'Public',
                LobbyType::Private => 'Private',
            }
        }
    }

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "dojomon", resources: [
                TestResource::Model(m_PlayerStats::TEST_CLASS_HASH),
                TestResource::Model(m_Dojomon::TEST_CLASS_HASH),
                TestResource::Model(m_DojoBall::TEST_CLASS_HASH),
                TestResource::Model(m_Counter::TEST_CLASS_HASH),
                TestResource::Model(m_Lobby::TEST_CLASS_HASH),
                TestResource::Model(m_ReceiverFriendRequest::TEST_CLASS_HASH),
                TestResource::Model(m_Friend::TEST_CLASS_HASH),
                TestResource::Model(m_Move::TEST_CLASS_HASH),
                TestResource::Event(e_PlayerSpawned::TEST_CLASS_HASH),
                TestResource::Event(e_DojomonCreated::TEST_CLASS_HASH),
                TestResource::Event(e_DojomonCaptured::TEST_CLASS_HASH),
                TestResource::Event(e_PlayerAttacked::TEST_CLASS_HASH),
                TestResource::Event(e_PlayerSelectedDojomon::TEST_CLASS_HASH),
                TestResource::Event(e_PlayerReady::TEST_CLASS_HASH),
                TestResource::Event(e_PlayerJoined::TEST_CLASS_HASH),
                TestResource::Event(e_BattleEnded::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
                TestResource::Contract(friendSystem::TEST_CLASS_HASH),
                TestResource::Contract(battle::TEST_CLASS_HASH),
                TestResource::Contract(lobby::TEST_CLASS_HASH),
            ].span()
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"dojomon", @"actions").with_writer_of([dojo::utils::bytearray_hash(@"dojomon")].span()), 
            ContractDefTrait::new(@"dojomon", @"battle").with_writer_of([dojo::utils::bytearray_hash(@"dojomon")].span()),
            ContractDefTrait::new(@"dojomon", @"friendSystem").with_writer_of([dojo::utils::bytearray_hash(@"dojomon")].span()),
            ContractDefTrait::new(@"dojomon", @"lobby").with_writer_of([dojo::utils::bytearray_hash(@"dojomon")].span())

        ].span()
    }

    fn print_dojomon_stats(
        dojomon: Dojomon,
    ) {
        println!("Dojomon ID: {}", dojomon.dojomon_id);
        println!("Dojomon Name: {}", dojomon.name);
        println!("Dojomon HP: {}", dojomon.health);
        println!("Dojomon Attack: {}", dojomon.attack);
        println!("Dojomon Defense: {}", dojomon.defense);
        println!("Dojomon Speed: {}", dojomon.speed);
        println!("Dojomon Type: {:?}", dojomon.dojomon_type);
        println!("Dojomon Position: ({}, {})", dojomon.position.x, dojomon.position.y);
        println!("Dojomon Image: {}", dojomon.image_id);
    }

    fn print_player_stats( 
        player: PlayerStats,
    ) {
        println!("Player Name: {}", player.name);
        println!("Player Gold: {}", player.gold);
        println!("Player Level: {}", player.level);
        println!("Player Exp: {}", player.exp);
        println!("Player Food: {}", player.food);
        println!("Player Trophies: {}", player.trophies);
        println!("Player League: {:?}", player.league);
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
        

        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        let (contract_address, _) = world.dns(@"battle").unwrap();
        let battle_system = IBattleDispatcher { contract_address };

        let (contract_address, _) = world.dns(@"lobby").unwrap();
        let lobby_system = ILobbyDispatcher { contract_address };

        println!("world created");

        let player1_address: felt252 = '0x0';
        let player2_address: felt252 = '0x1';

        let player1_name: felt252 = 'Player1';
        let player2_name: felt252 = 'Player2';

        let attacker_dojomon_id = actions_system.spawnPlayer(
            player1_address, player1_name,
            DojomonType::Fire(())
        );

        println!("player1 spawned");

        print_player_stats(world.read_model(player1_address));

        println!("");

        let defender_dojomon_id = actions_system.spawnPlayer(
            player2_address, player2_name,
            DojomonType::Water(())
        );

        println!("player2 spawned");

        print_player_stats(world.read_model(player2_address));

        println!("");

        let initial_player: PlayerStats = world.read_model(caller);

        let player_league: felt252 = League::Bronze.into();



        assert(
            initial_player.gold == 100 && 
            initial_player.level == 1 &&
            initial_player.exp == 0 &&
            initial_player.food == 100 &&
            initial_player.trophies == 0 &&
            initial_player.league.into() == player_league,
            'wrong initial stats'
        );
    }

    #[test]    
    fn test_attack(){
        let attacker_dojomon_id : u32 = actions_system.createDojomon(
            player1_address,
            'Charmander',
            100,
            40,
            30,
            40,
            0,
            DojomonType::Fire(()),
            Position{
                x: 0,
                y: 0,
            },
            false,
            false,
        );

        let defender_dojomon_id : u32 = actions_system.createDojomon(
            player2_address,
            'Squirtle',
            110,
            30,
            35,
            35,
            0,
            DojomonType::Water(()),
            Position{
                x: 0,
                y: 0,
            },
            false,
            false
        );

        let attacker_dojomon: Dojomon = world.read_model(attacker_dojomon_id);
        let defender_dojomon: Dojomon = world.read_model(defender_dojomon_id);

        println!("Attacker Dojomon spawned");
        //print_dojomon_stats(attacker_dojomon);

        println!("");

        println!("Defender Dojomon spawned");
        //print_dojomon_stats(defender_dojomon);

        println!("");

        

        let lobby_code: u32 = lobby_system.createLobby(
            LobbyType::Public(()),
        );


        loop {

            let attacker_dojomon: Dojomon = world.read_model(attacker_dojomon_id);
            let defender_dojomon: Dojomon = world.read_model(defender_dojomon_id);

            if( 
                attacker_dojomon.health == 0 || 
                defender_dojomon.health == 0 || attacker_dojomon.attack == 0 ||
                defender_dojomon.attack == 0 || attacker_dojomon.defense == 0 ||
                defender_dojomon.defense == 0 || attacker_dojomon.speed == 0 ||
                defender_dojomon.speed == 0
            ) {
                break;
            }
        
            battle_system.attack(lobby_code, attacker_dojomon_id, defender_dojomon_id, 1, false);

            let after_attack_attacker_dojomon: Dojomon = world.read_model(attacker_dojomon_id);

            let after_attack_defender_dojomon: Dojomon = world.read_model(defender_dojomon_id);

            println!("
                Charmander attacked Squirtle with Ember
            ");

            println!("Attacker Dojomon Stats after attack");
            print_dojomon_stats(after_attack_attacker_dojomon);

            println!("");

            println!("Defender Dojomon Stats after attack");
            print_dojomon_stats(after_attack_defender_dojomon);

        };


        println!(" --- Battle Ended --- ");

        println!(" Player 1 Stats ");
        print_player_stats(world.read_model(player1_address));

        println!("");

        println!(" Player 2 Stats ");

        print_player_stats(world.read_model(player2_address));
    }

    #[test]    
    fn test_catch_dojomon () {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        let player_address: felt252 = '0x0';
        
        let dojomon_id : u32 = actions_system.createDojomon(
            player_address,
            'Charmander',
            50,
            20,
            30,
            20,
            0,
            DojomonType::Fire(()),
            Position{
                x: 0,
                y: 0,
            },
            false,
            false,
            004
        );

        actions_system.catchDojomon(
            dojomon_id,
            DojoBallType::Dojoball(())
        );

        let dojomon: Dojomon = world.read_model(dojomon_id);

        println!("Dojomon Image: {}", dojomon.image_id);


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

    #[test]
    fn test_buy_dojoball(){
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"shop").unwrap();
        let shop_system = IShopDispatcher { contract_address };


        
            const DOJOBALL_PRICE : u32 = 50;
            const GREATBALL_PRICE : u32 = 100;
            const ULTRABALL_PRICE : u32 = 200;
            const MASTERBALL_PRICE : u32 = 300;


        let player = PlayerStats {
            address: starknet::contract_address_const::<0x0>(),
            name: 'Player',
            gold: 100,
            level: 1,
            exp: 0,
            food: 100,
            trophies: 0,
            league: League::Bronze(()),
        };

        let player_stats: PlayerStats = world.read_model(player.address);


        let initial_gold: u32 = player_stats.gold;

        shop_system.buyDojoBall(
            DojoBallType::Dojoball(()),
            1
        );

        let player_stats: PlayerStats = world.read_model(player_address);



        assert(
            player_stats.gold == initial_gold - DOJOBALL_PRICE,
            'wrong gold after buying dojoball'
        );

        let counter: Counter = world.read_model(COUNTER_ID);

        assert(
            counter.dojoball_count == 1,
            'wrong dojoball count'
        );
    }

    #[test]
    fn test_harvest_food(){
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        let player = PlayerStats {
            address: starknet::contract_address_const::<0x0>(),
            name: 'Player',
            gold: 100,
            level: 1,
            exp: 0,
            food: 100,
            trophies: 0,
            league: League::Bronze(()),
        };

        world.write_model(@player);

        let player_stats: PlayerStats = world.read_model(player.address);

        let initial_food: u32 = player_stats.food;

        actions_system.harvestFood(
            10
        );

        let new_player_stats: PlayerStats = world.read_model(player.address);

        assert(
            new_player_stats.food == initial_food + 10,
            'wrong food after harvesting'
        );
    }

    #[test]
    fn test_feed_dojomon(){
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IActionsDispatcher { contract_address };

        let player = PlayerStats {
            address: starknet::contract_address_const::<0x0>(),
            name: 'Player',
            gold: 100,
            level: 1,
            exp: 0,
            food: 100,
            trophies: 0,
            league: League::Bronze(()),
        };

        world.write_model(@player);

        let player_stats: PlayerStats = world.read_model(player.address);

        let initial_food: u32 = player_stats.food;

        let dojomon_id : u32 = actions_system.createDojomon(
            player.address,
            'Charmander',
            50,
            20,
            30,
            20,
            0,
            DojomonType::Fire(()),
            Position{
                x: 0,
                y: 0,
            },
            false,
            false,
            004
        );

        let dojomon: Dojomon = world.read_model(dojomon_id);

        let initial_health: u32 = dojomon.health;

        actions_system.feedDojomon(
            dojomon_id,
            10
        );

        let new_dojomon: Dojomon = world.read_model(dojomon_id);

        assert(
            new_dojomon.health == initial_health + 50,
            'wrong health after feeding'
        );

        let new_player_stats: PlayerStats = world.read_model(player.address);

        assert(
            new_player_stats.food == initial_food - 10,
            'wrong food after feeding'
        );
    }

    #[test]
    fn test_random_between_0_2() {
       // starknet::testing::set_contract_address(111.try_into().unwrap());
        let mut randomizer = RandomImpl::new('world');
        let mut i = 0;
        loop {
            if i == 10 {
                break;
            }

            let rand = randomizer.between::<u8>(0, 10);
            println!("Random number: {:?}", rand);

            i += 1;
        };
    }

    #[test]
    fn test_create_lobby() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"lobby").unwrap();
        let lobby_system = ILobbyDispatcher { contract_address };


        let lobby_code: u32 = lobby_system.createLobby(
            LobbyType::Public(()),
        );

        let lobby: Lobby = world.read_model(lobby_code);

        assert(
            lobby.host_player.address == "" &&
            lobby.guest_player.address == "" &&
            lobby.is_vacant == true &&
            lobby.lobby_type == LobbyType::Public(())
            ,
            'wrong lobby'
        );
    }

    #[test]
    fn test_join_lobby() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"lobby").unwrap();
        let lobby_system = ILobbyDispatcher { contract_address };

        let lobby_code: u32 = lobby_system.createLobby(
            LobbyType::Public(()),
        );

        let player1_address: felt252 = '0x0';
        let player2_address: felt252 = '0x1';

        lobby_system.joinLobby(
            lobby_code,
            player1_address
        );

        let lobby: Lobby = world.read_model(lobby_code);

        assert(
            lobby.host_player.address == player1_address &&
            lobby.guest_player.address == "" &&
            lobby.is_vacant == false &&
            lobby.lobby_type == LobbyType::Public(())
            ,
            'wrong lobby'
        );

        lobby_system.joinLobby(
            lobby_code,
            player2_address
        );

        let lobby: Lobby = world.read_model(lobby_code);

        assert(
            lobby.host_player.address == player1_address &&
            lobby.guest_player.address == player2_address &&
            lobby.is_vacant == false &&
            lobby.lobby_type == LobbyType::Public(())
            ,
            'wrong lobby'
        );
    }
    
}
