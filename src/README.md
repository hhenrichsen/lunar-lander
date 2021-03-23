<div align="center">
    <a href="https://hhenrichsen.github.io/lunar-lander">
        <img src="assets/Lander.png?raw=true" width="120">
        <h1>Lunar Lander | src</h1>
    </a>
</div>

This is where the TypeScript lives, and I've split it up into a variety of 
folders for my own organizational purposes.

## Core
This contains my core engine content, including things like drawing textures,
2D Vector math, basic pages/menuing, state management, and persistence. It also
provides Commands, which allow for a basic event system. This is likely 
something that'll be expanded in the future.

## Content
This is where game-specific content lives, like default configurations, state
declarations that are plugged into the generics in Core, and game objects like
the lander itself.

## `index.ts`
This is a basic file that manages kicking everything off.

## `init.ts`
This is called by `index.ts` and initializes the global environment, from page
structure to specific persistence.