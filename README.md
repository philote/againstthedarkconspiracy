# Against the Dark Conspiracy System

![A title image for the Against the Dark Conspiracy game system](./assets/cover.webp)

<p align="center">
    <img alt="Foundry Version 12 support" src="https://img.shields.io/badge/Foundry-v12-informational">
    <img alt="Latest Release Download Count" src="https://img.shields.io/github/downloads/philote/againstthedarkconspiracy/latest/total"> 
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/philote/againstthedarkconspiracy"> 
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/philote/againstthedarkconspiracy">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/philote/againstthedarkconspiracy">
</p>
<p align="center">
    <img alt="GitHub" src="https://img.shields.io/github/license/philote/againstthedarkconspiracy"> 
    <a href="https://github.com/philote/againstthedarkconspiracy/issues">
        <img alt="GitHub issues" src="https://img.shields.io/github/issues/philote/againstthedarkconspiracy">
    </a> 
    <a href="https://github.com/philote/againstthedarkconspiracy/network">
        <img alt="GitHub forks" src="https://img.shields.io/github/forks/philote/againstthedarkconspiracy">
    </a> 
    <a href="https://github.com/philote/againstthedarkconspiracy/stargazers">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/philote/againstthedarkconspiracy">
    </a>
</p>
<p align="center">
   	<a href='https://ko-fi.com/G2G3I91JQ' target='_blank'>
					<img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' />
				</a>
</p>

An unofficial, community-supported system for playing the [Against the Dark Conspiracy](https://gallusgames.itch.io/against-the-dark-conspiracy) TTRPG (Created by [Alun Rees](https://twitter.com/AlunRees14), Will Hobson, Paul Rivers, and Lowell Francis) on the Foundry VTT platform.

- The Against the Dark Conspiracy Game: https://gallusgames.itch.io/against-the-dark-conspiracy

If you’ve enjoyed my work and find value in what I create, please consider supporting me with a small donation on [Ko-fi](https://ko-fi.com/G2G3I91JQ). I truly love what I do, and your support helps me dedicate time and resources to ongoing development. Every contribution, no matter the size, makes a difference and allows me to continue doing what I’m passionate about. Thank you for considering—it means the world to me.

![A screenshot of the Against the Dark Conspiracy character sheet and chat output in Foundry VTT](./assets/screenshot.webp)

## Features

- PC Character Sheets
    - Stress Tracking (mostly automated when rolling)
    - Intel Tracking (automated when rolling)
    - Buttons on the sheet to roll the different actions. Includes dialogs to choose what die to use
    - Checking Expertise Available disables choosing expertise die on the roll dialogs
    - Marking an anchor as missing/target disables the "Seek Solace in a Relationship" button & sends the player and Control a message
- NPC Character Sheets for:
    - Nameless Pawns & Nameless Pawns Leaders
    - Named Pawns with the 3 types (you can add power & weaknesses)
    - Supernaturals (supernatural subtypes)
- Safe House Sheet
    - Safe House questions and answers
    - Gear benefit type
- A setting to switch between Conspiracy Types (Vampires, Demons, & Fae)
    - It currently only effects the Supernaturals Character Sheet
- Compendium Packs for:
    - Gear
    - NPC Powers, Weaknesses, & Vulnerabilities
    - Briefing Roll Tables
    - Complication Roll Tables
- A Heat clock
    - Shows for all players, floats in the upper right corner 
    - Only the GM can update it
    - On increase a chat message is show to all players
- Added support for Dice so Nice!, the dice colors match those in the chat window

## To Be Done

- Add expertise descriptions
- When stress is marked, reset expertise
- Adding Gear will update character Load/Gear and show an error dialog when there is no capacity
- Add an Operation template journal to the Compendium
- Better chat message designs
- Add buttons for seek relief from the horror moves in chat
- Improve dialog designs/layouts
- Create default token setup (show name, show intel and stress, link actor, etc..)
- Use Conspiracy type to change the look and feel of sheets

## How to Install

You can install the latest released version of the system by using this manifest link in Foundry VTT.

[Instructions](https://foundryvtt.com/article/tutorial/)

Link: https://github.com/philote/againstthedarkconspiracy/releases/latest/download/system.json

## Content License Note

Against the Dark Conspiracy TTRPG is licensed use under the [Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
