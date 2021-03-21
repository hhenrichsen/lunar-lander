<div align="center">
    <a href="https://hhenrichsen.github.io/lunar-lander">
    <img src="assets/Lander.png?raw=true" width="120">
    <h1>Lunar Lander</h1>
    </a>
</div>

This is one of my projects for CS5410, Game Development at Utah State University. The requirement for this was either JavaScript or C#; I compromised and used TypeScript. 

## Building

Run the following:
```
npm install
npm run build
```
Then open `lunar-lander/dist/index.html` in your browser. If you don't want
to build it yourself, open [this](https://hhenrichsen.github.io/lunar-lander)
link in your browser.

## Libraries Used
* None. All code is by me.

## Utilities Used
* Webpack (runs the transpiler/polyfills/compilation together)
* TypeScript (transpiler)
* Babel (code polyfills for older browsers)
* ESLint (code linter)
* Prettier (code formatter)