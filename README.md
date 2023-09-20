# About cipher

cipher is an artificial intelligence (AI) written in TypeScript for Screeps, a multiplayer programming strategy game. The aim of this AI is to run completely autonomous without the need of any manual building placement or other human intervention.

**Current version: cipher v0.0.5**

### May I use or modify cipher?

You are free to use and modifiy this codebase. However, in my opinion Screeps only makes fun, when programming your own AI and watching you colony grow! That being said, I'll try to make this codebase as readable as possible. Keep in mind, that I am no professional programmer and only write this AI in my free time. Also, I'm sure that much of this code can be written more efficiently or elegantly. Probably both. Feel free to open issues if you feel, that parts of this codebase need improvements, but please refrain from pull requests.

# Installation

To use cipher as your AI in Screeps you need to download or clone this repository to your machine. Furthermore you will need `npm` to install all needed dependencies. Make sure to have Node.js version 12 installed. This codebase uses `rollup` to bundle the compiled Typescript into one single `main.js`. Make sure your machine uses the local installation of `rollup` of this repository instead of any globally installed version.

Rename `screeps.sample.json` to `screeps.json` and replace each value depending on the server you are playing on.

    git clone https://github.com/lukhuber/cipher.git
    cd cipher
    npm install

To compile and deploy the code use one of the following commands (depending on the server you are playing on) in the root directory.

    npm run push-main
    npm run push-sim
    npm run push-season
    npm run push-pserver

## Features

### Current features

- Statistics overview in each `room` using `RoomVisual` (very rudimentary
- Automatic bunker planning and building
- Modular approach to codebase
  - `Architect` responsible for `room` initialization and base planning
  - `Manager` responsible for creation of `Requests`
  - `Supervisor` responsible for assigment of `Requests`
- Not so smart creep spawner
- Various console commands

### Upcoming features

- Assignment of `Tasks` to idle creeps
- Independent mining and upgrade sites
- Remote mining
- Room scouting
- Defensive capabilities (no specific plans yet)
- Offensive capabilities (no specific plans yet)

These feature are not in any particular order, but represent a simple TODO list for me

### Known Bugs

- Harvesters throw an error during their very first tick, as mining site is not yet assigned
- The very first upgrader in each room doesn't move as no energy is available to it
- Full creeps on their way to upgrade are not deleted from the upgrade request list, when they are diverted to fill the room
- Build requests are not ordered correctly in visual display