# Dojomon

**Dojomon** is an engaging and decentralized 2D top-down pixel multiplayer game inspired by the **Pokemon anime series**, built using the **Dojo Game Engine** on StarkNet. The game merges classic Pokemon-style gameplay with modern blockchain technology to deliver a nostalgic yet innovative experience. Players can explore a dynamic world, catch and train DojoMons, compete in online battles, and maintain farms for resources, all while earning on-chain rewards and climbing competitive leaderboards.

## 🌟 Project Overview

Dojomon is a **provable game** built entirely using the **Dojo Stack**, a decentralized game engine on StarkNet. The game offers **two main modes**:

1. **Story Mode**: Players embark on a journey to catch DojoMons, battle gym trainers, and become champions of their world.
    
2. **Competitive Mode**: Online multiplayer battles with ranked matchmaking and a league system (from Bronze to Grandmaster), alongside casual matches with friends using lobby codes.
    

Players can also engage in farming systems to grow food, recover their DojoMons' health, and earn coins for purchasing items in an in-game shop. The provable mechanics ensure fairness, ownership, and transparency throughout the game, all powered by StarkNet’s scalability and security.

## 📈 Key Features

#### 🎮 Core Gameplay:

- Turn-Based Battle System:
    
    1. Engage in strategic battles with gym trainers, wild DojoMons, or other players.
    
    2. Leverages randomness (e.g., critical hits, misses) to make battles unpredictable and exciting.
    
    3. Earn experience points (EXP) for your DojoMons to level up and evolve.
    
- Catch and Train DojoMons:
    
    1. Use in-game items like DojoBalls to catch wild DojoMons.
    
    2. Train your DojoMons to increase their stats and unlock new evolutions.
    
- Evolution System:
    
    1. DojoMons evolve into stronger forms when they reach specific levels or use evolution items like stones.
    
    2. Evolutions improve stats and unlock new abilities.
    

🌍 Game Modes:

- Story Mode:
    
    1. Battle and capture wild DojoMons to build your roster.
    
    2. Defeat gym trainers to earn badges, coins, and EXP.
    
- Competitive Mode:
    
    1. Online multiplayer battles with ranked matchmaking.
    
    2. League progression system: Bronze → Silver → Gold → Platinum → Diamond → Grandmaster.
    
    3. Casual battles with friends using lobby codes.
    

#### 🛠️ **Support Systems**:

- **Farming System**:
    
    1. Harvest food to restore your DojoMons’ health and stats after battles.
    
    2. Sell excess food for coins or use it to increase EXP and level up DojoMons.
    
- **Shop**:
    
    1. Spend coins to buy DojoBalls, potions, evolution stones, and training equipment.
    
    2. Higher-tier DojoBalls improve your chances of capturing rare and high-stat DojoMons.
    

## 📦 Tech Stack

- Frontend:
    
    React + Vite: Used for building a fast, modern, and interactive user interface.
    
    Dojoclient: Provides seamless querying of on-chain data from StarkNet, enabling real-time updates for players (e.g., battle results, DojoMon stats).
    
- Backend:
    
    Dojo Stack: A decentralized provable game engine running entirely on StarkNet.
    
    Cairo Language: Used to write the game logic, battle system, farming mechanics, and other core on-chain functionalities.
    
- Database:
    
    On-Chain Storage:
    
    All core game data (e.g., player stats, DojoMon attributes) is stored directly on StarkNet using Dojo’s storage system.
    

## 🛠️ How It Works

1. **Onboarding**:
    
    - New players sign up using **Cartridge Controllers**, ensuring seamless wallet creation and StarkNet integration.
        
    - Players spawn into the game world as a new trainer with starter DojoMons.
        
2. **Story Mode**:
    
    - Players explore the map, battle wild DojoMons, and capture them using DojoBalls.
        
    - Battles are provable and processed entirely on-chain using Dojo systems.
        
3. **Competitive Mode:**
    
    - Players enter matchmaking to battle other trainers in turn-based battles.
        
    - Results are stored on-chain, and winners earn trophies and coins.
        
4. **Resource Management**:
    
    - Players maintain farms to harvest food, restore stats, and boost their DojoMons.
        
    - Coins earned from battles or farming are used to purchase items in the shop.
        
5. **Shop and Evolution**:
    
    - Players can evolve their DojoMons using EXP or evolution stones purchased from the shop.
        
    - Evolved DojoMons gain stronger stats and new abilities, making them more competitive in battles.
        

## 📌 Technicals

- **Decentralized Gameplay**:
    
    - The entire game logic is processed on-chain using **Cairo** and the Dojo Stack.
        
    - Every battle, resource update, and evolution is cryptographically provable.
        
- **Provable Fairness**:
    
    - Turn-based randomness (e.g., crits, misses) is implemented via on-chain verifiable randomness.
        
    - This ensures all outcomes are tamper-proof and fair.
        
- **Real-Time Querying**:
    
    - The **Dojoclient** library enables real-time updates for players by fetching on-chain data.
        
- **Multiplayer**:
    
    - Competitive and casual matchmaking is managed through smart contracts, ensuring fairness and decentralized control.
        

## 📅 **Project Future**

- **Dojomon** has immense potential for growth:
    
    1. **Community Events**:
        
        - Weekly tournaments and seasonal leagues for competitive players.
            
        - Limited-time story events with unique rewards.
            
    2. **Marketplace**:
        
        - A player-driven marketplace for trading DojoMons, items, and resources.
            
    3. **Land Ownership**:
        
        - Introduce a land-based system where players can buy, sell, and upgrade their farms.
          
