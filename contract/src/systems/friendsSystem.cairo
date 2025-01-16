use dojo_starter::models::{
    PlayerStats,
    ReceiverFriendRequest, Friend
};
use starknet::{ContractAddress, get_caller_address};

// Define the interface
#[starknet::interface]
trait IFriendSystem<T> {
    fn sendFriendRequest(ref self: T, receiver_felt252: felt252);
    fn acceptFriendRequest(ref self: T, sender_felt252: felt252);
}

// Dojo contract
#[dojo::contract]
pub mod friendsSystem {
    
    use super::{
            IFriendSystem, PlayerStats, ReceiverFriendRequest, Friend
        };
        use starknet::{ContractAddress, get_caller_address};
        use dojo::model::{ModelStorage, ModelValueStorage};
        use dojo::event::EventStorage;

    #[abi(embed_v0)]
    impl FriendImpl of IFriendSystem<ContractState> {
        

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

}