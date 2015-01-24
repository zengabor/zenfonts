# Zenfonts

A tiny JavaScript helper to load and pre-load web fonts that are specified via @font-face. It uses best practices from other solutions, but it's still a unique combination:

- It's tiny (793 bytes minimized and gzipped), so it can be easily included in every page.
- It can preload a font before it's used.
- It can solve the “invisible text” issue (WebKit-based browsers on slow network) by applying a class during font loading.
- It can also solve the Flash Of Unformatted Text, aka [FOUT](http://www.paulirish.com/2009/fighting-the-font-face-fout/) (still happens in Internet Explorer).
- Supports practically all browsers. Tested under the latest browser on Android, iOS, OS X, Windows, as well as under IE6+, Firefox 3.6+.

Please note that Zenfonts isn't replacing the mechanic of loading web fonts. Instead, it is more like a safety valve as the majority of the browser population (Chrome desktop, Chrome for Android, Firefox, Opera) handles font-loading already quite smart, avoiding both FOUT and “invisible text”. Your fonts are also cached after the first load, and many times the network is fast enough. Zenfonts is there for you if everything fails: the fonts is not cahced, the network is very slow and the browser isn't handling it properly (most notably WebKit-based browsers, like iOS and older Android browsers. Zenfonts was made to make sure that even of those extreme cases are taken care, and you can have a peace of mind.


## Usage

You can include the minimized version in the head. However, make sure you only call Zenfonts() once the body has been created. A good place is right after the `<body>` tag:
	
````
<body>
    <script>Zenfonts("Unibody", {fallbackClass: "fallback-unibody", timeout: 2500})</script>
	...
````
`Zenfonts()` returns immediately after calling but it stays in the background and periodically checks whether the fonts is loaded. Note that this background checking gets slower and slower with time and Zenfonts gives up after about a minute and removes itself entirely. So it won't slow down the page.

`Zenfonts()` have two parameters:

1. `fonts` which is either an array or a single one. Every passed font can be specified as a string (e.g., `Liza`) or as an object with optional style attributes, e.g. `{family: "Liza"}` or `{family: "Sauna", style: "font-weight: bold"}`. The font-families that you pass as parameters must be specified in your CSS as `@font-face` declarations, e.g., `@font-face { font-family: "Liza"; src: url("/fonts/liza.woff") }`
2. `options` which is an object with attributes that are all optional: `loadingClass` which is applied during loading, `fallbackClass` which is only applied if `timeout` is reached before the font is loaded, `timeout` which defines the time before the fallbackClass is applied (default is `2222`), and `onLoad` which is a callback function that will be executed once the font is successfully loaded

Once the font is loaded the background checks of Zenfonts stop (and it removes `loadingClass` from the `<html>` element, if it was provided). However, if the networks is slow or the font is blocked somehow and `timeout` is reached then Zenfonts applies the `fallbackClass` to the `<html>` element. After that Zenfonts still keeps staying in the background and when the font is finally loaded, it removes the `fallbackClass`. Note that both `loadingClass` and `fallbackClass` can be a list of classes, separated by spaces, e.g., `"loading-liza loading-sauna"`

There are many ways to utilize Zenfonts. Below is a few examples.


### Example 1: Preload fonts

Handy if you know that a specific font will be needed and you want to make sure the browser loads it. There is no harm done calling `Zenfonts()` even if the font is already in the browser cache. It will simply quit.

Preloading a single font, called Dolly:

```
Zenfonts("Dolly")
```

Of course, if some elements on your page already uses this font-family then the browser will load in anyway, and calling `Zenfonts()` doesn't make sense. (And note that Internet Explorer will load every fonts that are references in `@font-face` definitions.) So you would use the above code if the current page doesn't use "Dolly" but you know that you may display a dialog box with this font, or the user may navigate to another page which uses "Dolly".


Preloading multiple fonts:

```
Zenfonts(["Dolly", "Fakir", "Bello"])
```

Preloading fonts with specific styles:

```
Zenfonts({family:"Dolly", style:"font-style: italic"})
```
or
```
Zenfonts([
    "Fakir",
	{family:"Sauna", style:"font-weight: 300"},
	{family:"Sauna", style:"font-weight: 700; font-style: italic"}
])
```

And if you want to set a cookie once a font was loaded:

```
Zenfonts("Fakir", {
    onLoad: function () {
        document.cookie = "fakir=loaded; expires=Wed, 22 Jan 2025 00:00:00 UTC"
    }
})
```

### Example 2: Fixing “invisible text” (WebKit-based browsers)

Fixing invisible text requires preparation in the CSS as Zenfonts will apply a CSS class if the loading of the font is too slow.

```
Zenfonts("Dolly", {fallbackClass: "fallback-dolly"})
```

And in your CSS you may have something like:

```
...
body { font-family: "Dolly", Georgia, serif; }
.fallback-dolly body { font-family: Georgia, serif; }
...
```

This way even in current WebKit-based browsers (old Android and iOS) the font-loading times out after a while instead of waiting forever for the font.


You can also change the timeout for the fallback to 1 second from the default 2222 ms:

```
Zenfonts("Fakir", {fallbackClass: "fallback-fakir", timeout: 1000})
```

Note that if the font is loaded before the timeout (because the network is fast enough or the font was already cached) then Zenfonts will simply quit without applying `fallbackClass` as there is no issue. This is an important philosophy of Zenfonts.

**Demo:** TBD


### Example 3: Controlling the order of font loading

To avoid multiple redrawing of the page on slow networks you can list all all required fonts in an array so that Zenfonts makes sure everything is loaded or fall back.

```
Zenfonts(["Dolly", "Dolly-Italic", "Dolly-Bold"], {fallbackClass: "fb-dolly fb-dolly-i fb-dolly-b"})
```

If you want to make sure more important fonts load first, you can do that too:

```
Zenfonts(
    "Dolly", 
    {
		// make sure Italic and Bold won't be loaded initially:
        loadingClass: "fb-dolly-i fb-dolly-b",
        fallbackClass: "fb-dolly",
		// start loading Italic and Bold once the Regular was loaded:
        onLoad: function () {
			Zenfonts(["Dolly-Italic", "Dolly-Bold"], {fallbackClass: "fb-dolly-i fb-dolly-b"})
        }
    }
)
```

**Demo:** TBD


### Example 4: Fixing FOUT (Internet Explorer)

Internet Explorer will flash the text till all fonts are fully loaded. To fix this you may decide to hide specific elements or everything until the fonts are loaded. Here's one way to do it with Zenfonts:


```
<head>
    ...
    <!--[if IE]><style>.ie-fontloading body {visibility: hidden}</style><![endif]-->
    <script>...zenfonts-min.js embedded here...</script>
</head>
<body>
    <script>Zenfonts("Auto", {loadingClass: "ie-fontloading"})
```

This way the entire `body` stays hidden in Internet Explorer until the fonts are ready (either from the browser cache or from the network) or until `timeout`.


**Demo:** TBD


## License

[Public Domain](http://unlicense.org). You can do with it whatever you want and I am not responsible for anything.
