<p align="center">
	<a href="https://zengabor.github.io/zenfonts/">
		<img src="https://zengabor.github.io/zenfonts/zenfonts.png" alt="Zenfonts">
	</a>
</p>


#### [**Demo**](https://zengabor.github.io/zenfonts/) &nbsp; &nbsp;  [**Download**](https://github.com/zengabor/zenfonts/archive/latest.zip) &nbsp; &nbsp; [**About**](#about) &nbsp; &nbsp; [**Install**](#install) &nbsp; &nbsp; [**How it works**](#how-it-works) &nbsp; &nbsp; [**Examples**](#examples) &nbsp; &nbsp; [**License**](#license)


# Web Fonts Are Beautiful. Once&nbsp;They&nbsp;Are&nbsp;Loaded.



Isn’t it frustrating when text is already there, yet you cannot read it because the fonts are not loaded yet? And when Internet Explorer flickers the text? How&nbsp;unprofessional!

Take control over font loading. Just the way you want. Zenfonts&nbsp;can&nbsp;help.

*759&nbsp;bytes of vanilla JavaScript. Works everywhere.*

## About

Zenfonts is a tiny JavaScript helper to (pre)load web fonts. It’s not replacing the way of loading web fonts. Rather, Zenfonts is there to help you when the fonts are not loaded in time.

If you are really serious about performance & a smooth experience consider not using web fonts at all. Most platforms have a handful of beautiful fonts already installed which don’t have any of the drawbacks of web fonts. However, if you decide to use web fonts then Zenfonts can be a big help for you:

- It can solve the “long invisible text” issue (iPhone and old WebKit-based Android browsers on slow network) by applying a fallback class during font loading.
- It can also solve the Flash Of Unformatted Text, aka [FOUT](http://www.paulirish.com/2009/fighting-the-font-face-fout/) which still happens in Internet Explorer.
- It can preload fonts before they are used (e.g., in a dialog box or on a next page).
- Supports practically all browsers. Tested and works under Android 2.2+ browser, Chrome 14+, Edge, Firefox 3.6+, IE6+, Opera 10.6+, Safari 4.1+ for iOS & OS X.
- It’s tiny (759 bytes minimized & gzipped), ready to be inlined in your page.

Of course, loading web fonts is not a problem in most cases. The network is fast enough, the font files are cached after the first load, and the majority of the browser population (Chrome desktop, Chrome for Android, Firefox, Opera) handles font-loading already quite smart, avoiding both the initial flickering and reflow and the “long invisible text” problem by falling back to the next available font after 3&nbsp;seconds. Other browsers, on the other hand, most prominently iPhones, iPads and old Android browsers hide the text too long if the loading process is slow. Think of Zenfonts as a safety valve. It saves your site if everything else fails.

In the long run Zenfonts will be obsolete once the wonderful [css-font-rendering](https://github.com/KenjiBaheux/css-font-rendering/) becomes available in the majority of the browser population. At the moment there isn’t a single browser supporting it, so Zenfonts may be quite useful.

## Install

Since web fonts are already in the critical path, you don’t want zenfonts to be another blocking request. Instead, inline the minimized version into the page (you can automate this with [CodeKit](https://incident57.com/codekit/), [grunt](https://gruntjs.com/), etc.). The best place is before the `</head>` closing tag. Then call it as many times as required, with the desired fonts and parameters. For example:

````html
...
    <script>this.zenfonts=function(e){"use strict";var t="serif",n=e.documentElement,a=function s(e,t){return function(n){if(n||e.offsetWidth!==t){var a=e.parentNode;return a&&a.removeChild(e),!0}}},i=function o(e){e&&(n.className=n.className.replace(new RegExp("(^|\\s)*"+e+"(\\s|$)*","g")," "))};return function r(s,o){if(s instanceof Array||(s=[s]),o=o||{},!e.body)return setTimeout(function(){r(s,o)},1);for(var f=[],l=s.length;l--;){var c=s[l];"string"==typeof c&&(c={family:c});var u=c.family,m=e.createElement("div");m.style.cssText="position:absolute;top:-999px;left:-9999px;visibility:hidden;white-space:nowrap;font-size:20em;font-family:"+t+";"+c.style||"",m.appendChild(e.createTextNode("// Zenfonts([{}]);")),e.body.appendChild(m);var p=a(m,m.offsetWidth);m.style.fontFamily="'"+u+"',"+t,p()||f.push(p)}var d=o.fallbackClass,v=function b(){i(d),o.onSuccess&&o.onSuccess()};if(0===f.length)return v();var h=o.loadingClass;h&&(n.className+=" "+h);var y=o.fallback||2e3;if(d){var g=setTimeout(function x(){i(h),n.className+=" "+d},y),w=v;v=function(){clearTimeout(g),w()}}var T=(new Date).getTime()+Math.max(y,o.swap||9999);!function N(e){setTimeout(function(){var t=(new Date).getTime()>=T;t&&o.onSwap&&o.onSwap();for(var n=f.length;n--;)f[n](t)&&f.splice(n,1);0===f.length?(t||v(),i(h)):N(1.5*e)},e)}(9)}}(document);</script>
    <script>
        zenfonts("Beautiful Font", {fallbackClass: "fallback-1", fallback: 1000, swap: 1000})
        zenfonts(["Font2", "Font3"], {loadingClass: "load", fallbackClass: "fallback-2"})
    </script>
</head>
````

_Tip:_ You can actually copy and use the above code to install Zenfonts. The first `<script>` line contains the current version of Zenfonts. Just make sure you copy the entire line.

You can also [download Zenfonts](https://github.com/zengabor/zenfonts/archive/latest.zip), or use npm:

````
npm install zenfonts
````

Of course, your web fonts must be already specified by `@font-face` or must be loaded in some other way (like by a JavaScript font loader). It doesn’t matter how; for Zenfonts it’s all transparent.

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

## Examples

Here are a few generic ways of using Zenfonts. You can combine and extend these techniques for your specific needs.

_Tip:_ Don’t forget to also look at the source of the demo page.

### 1. Group fonts

To minimize reflows (invisible state and/or swap) group fonts that go together, like headlines and body, or the various fonts from the single typeface:

````js
zenfonts(
	["Typeface1", {family: "Typeface1", style: "font-style: italic"}, {family: "Typeface1", style: "font-weight: bold"}],
	{ fallbackClass: "fallback-all" }
)
````

### 2. Quick fallback for critical content

Pay special attention to the fonts used for the most prominent content, like headlines and body text, because reflows can ruin the first experience of your site, and users want to read the content as early as possible. Group these fonts together, and set up an early swap. For example:  

````js
zenfonts(["TitleFont", "BodyFont"], {fallbackClass: "fallback", fallback: 1000, swap: 1000})
````

### 3. Fallback first for critical content

If content is even more critical then you start with a local font. At the same time preload the web font in the background and remember in a cookie when it’s done. When the user navigates to the next page the font is already cached (you can assume this from the existing cookie) so you can switch to your beautiful content font. Even if the cookie lies Zenfonts still controls the loading and will switch quickly to the fallback font. 

Here’s a complete example:

````js
var isLizaProbablyCached = document.cookie.indexOf("liza=cached") > -1
if (isLizaProbablyCached) {
	zenfonts("Liza", { fallbackClass: "fallback-liza", fallback: 1000, swap: 1000 })
} else {
	document.documentElement.className += " fallback-liza"
	zenfonts("Liza", { 
		onSuccess: function () {
			document.cookie="liza=cached; expires=Wed, 1 Jan 2020 00:00:00 UTC; path=/"
		}
	})
}
````

### 4. Preload the fonts you’ll need later

If you know that a specific font will be needed later (e.g., in a dialog box or on a next page) you can use Zenfonts to preload it. There is no harm done even if the font is already in the browser cache because then Zenfonts simply quits. Make sure you don’t specify a `fallbackClass` when doing preloads.

A few examples:

```js
Zenfonts("Liza")
```

```js
Zenfonts(["Dolly", "Fakir", "Bello"])
```

```js
Zenfonts([
    "Sauna",
	{family:"Sauna", style:"font-weight: 300"},
	{family:"Sauna", style:"font-weight: 700; font-style: italic"}
], { 
	onSuccess: function () {
		document.cookie = "sauna=cached; expires=Wed, 1 Jan 2020 00:00:00 UTC"
	}
})
```

### 5. Fonts not loaded in time? Fall back & keep loading.

You can keep loading the fonts after a swap so that they get cached by the browser, and will be available at the next page load. Just call Zenfonts in `onSwap`:  

````js
var myFonts = ["TitleFont", "BodyFont", {family: "BodyFont", style: "font-style: italic"}]
zenfonts(myFonts, {
	fallbackClass: "fallback", fallback: 1000, swap: 1000, 
	onSwap: function () { zenfonts(myFonts) } 
})
````

## License

[Public Domain](http://unlicense.org). You can do with it whatever you want and I am not responsible for anything.

## Other projects by me:

- [Zenscroll](https://github.com/zengabor/zenscroll), a JavasScript module to smooth-scroll web pages and DIVs.
- [Zentaps](https://github.com/zengabor/zentaps), a JavaScript module to eliminate the 300ms tap delay in mobile browsers.
- [Zenvite.com](http://zenvite.com/): Create beautiful invitation pages & get everybody on the same page.

