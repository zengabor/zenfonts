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
zenfonts("Liza")
```

```js
zenfonts(["Dolly", "Fakir", "Bello"])
```

```js
zenfonts([
    "Sauna",
	{family:"Sauna", style:"font-weight: 300"},
	{family:"Sauna", style:"font-weight: bold; font-style: italic"}
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
