## How it works

_Tip:_ Feel free to skip this dry theory section & go straight to [Examples](#examples).

`zenfonts(fonts, options)` returns immediately after calling but it stays in the background and periodically checks whether the specified fonts are loaded. Zenfonts acts only when the four basic events occur (see below), performing what you specified. (Note that this background checking gets less and less frequent with time. Finally, by default after 10 seconds, Zenfonts gives up and removes itself completely.)

_Important:_ The font-families you reference in the `fonts` parameter must be already specified, typically in your CSS as `@font-face` declarations.

The two parameters detailed:

1\. `fonts` is either an array or a single one. Every passed font is either specified as a string or as an object with optional style attributes. Some examples:

- `"Liza"`
- `["Liza", "Sauna"]`
- `{family:"Sauna", style:"font-weight: bold"}`
- `["Sauna", {family:"Sauna", style:"font-style:italic"}, {family:"Sauna", style:"font-weight:bold"}]`

2\. `options` is an object with attributes that are all optional: 

- `loadingClass` is applied during loading (before success / fallback / swap).
- `fallbackClass` is applied only if the `fallback` timeout value is reached before all fonts were loaded. 
- `fallback` defines the time before the `fallbackClass` is applied (default is `2000`).
- `swap` is final timeout after the font loading is given up (default is `9999`); it must be equal to `fallback` or higher.
- `onSuccess` is a callback function that is executed once all specified `fonts` were successfully loaded.
- `onSwap` is a callback function that is executed if at least one of the `fonts` could not be  loaded.

Here is a complex example:

````js
var saunaFonts = ["Sauna", {family:"Sauna", style:"font-style:italic"}, {family:"Sauna", style:"font-weight:bold"}]
var options = { 
    loadingClass: "loading-ie",
    fallbackClass: "fallback-headers fallback-bodytext", 
    fallback: 2500, swap: 2500,
    onSuccess: setSaunaCookies, 
    onSwap: function () { zenfonts(saunaFonts) } 
}
zenfonts(saunaFonts, options)
````

Note that both `loadingClass` and `fallbackClass` can be a list of classes, separated by spaces, e.g., `"loading-headers loading-bodytext"`. With the help of these two parameters you can design in detail how to handle the loading phase and how to fall back to other fonts if the specified fonts could not be loaded in time. 



Here are the four basic events, and what the actions Zenfonts performes at each:

### START: You call zenfonts()

1. `loadingClass` is applied on the root `<html>` tag (if you provided it).
2. A hidden DIV is created for each font you specified, forcing the browser to load those fonts within.

### SUCCESS: The specified fonts are all loaded

1. `loadingClass` is removed (if you provided it).
2. `fallbackClass` is removed (if it was applied earlier). 
3. `onSuccess` it is executed (if you provided it).

### FALLBACK: fonts not loaded until timeout (2 seconds by default)

1. `fallbackClass` is applied on the root `<html>` tag (if you provided it).
2. `loadingClass` is removed (if you provided it).

### SWAP: Zenfonts gives up (10 seconds by default)

1. `onSwap` is executed (if you provided it).
2. `loadingClass` is removed (if you provided it).
3. `fallbackClass` is not removed.
4. Zenfonts stops the monitoring & quits.
