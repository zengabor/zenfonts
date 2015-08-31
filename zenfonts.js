/**
 * Zenfonts 3.0.0
 * https://github.com/zengabor/zenfonts/
 *
 * Copyright 2015 Gabor Lenard
 *
 * This is free and unencumbered software released into the public domain.
 * 
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 * 
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 * For more information, please refer to <http://unlicense.org>
 *
 */

/*jshint devel:true, asi:true */

this.zenfonts = (function (doc) {
	"use strict"

	// The width of this font(s) is compared to the web fonts:
	var testFonts = "serif"
	var docElem = doc.documentElement

	var makeChecker = function makeChecker(div, origWidth) {
		return function (forceRemove) {
			if (forceRemove || div.offsetWidth !== origWidth) {
				var p = div.parentNode
				if (p) {
					p.removeChild(div)
				}
				return true
			}
		}
	}

	// A browser-agnostic way to remove a class name from the documentElement
	var removeTopLevelClass = function removeTopLevelClass(className) {
		if (className) {
			docElem.className = docElem.className.replace(
				new RegExp("(^|\\s)*" + className + "(\\s|$)*", "g"), " "
			)
		}
	}
	
	/**
	 * Loads the specified fonts in hidden div elements, making the browser load them.
	 * If the @param {fonts} is an array, it either contains one or more strings or
	 * objects or both, mixed. The objects can have the optional attribute `style`.
	 *
	 * Examples: 
	 *   Zenfonts("Sauna Pro")
	 *   Zenfonts("Sauna Pro", {onSuccess: handleLoadFinished})
	 *   Zenfonts(["Sauna Pro", "Dolly Pro"])
	 *   Zenfonts({family:"Sauna", style: "font-style:italic; font-weight:700"},
	 *     {fallback: 999, loadingClass:"sauna-load", fallbackClass:"sauna-fallb"})
	 *   Zenfonts(
	 *     ["Fakir-Black", {family:"Fakir-Italic", style:"font-style:italic"}],
	 *     {fallback: 2500, onSuccess: function () { setCookie("fakir","loaded") }
	 *   )
	 *
	 * @param {fonts} An object or an array of objects with font families,
	 *        optionally styles (see examples above).
	 * @param {options} An object with the following optional attributes: 
	 *        `loadingClass`, `fallbackClass`, `fallback`, `swap`,
	 *        `onSuccess`, and `onSwap`.
	 *        If `loadingClass` is provided it is applied immediately and
	 *        removed once the fallback happens or the loading finished.
	 *        If `fallbackClass` is provided it is applied to the <html> element
	 *        if loading wasn’t finished until the specified `fallback` timeout.
	 *        (Note that `loadingClass` and `fallbackClass` each can be either a
	 *        single class or a list of classes, space separated.)
	 *        The default value for `fallback` is 2000 ms which is 2 seconds.
	 *        `swap` is another timeout after the `fallbackClass` remains active;
	 *        therefore `swap` must be equal to `fallback` or higher.
	 *        The default value for `swap` is 9999 ms.
	 *        If `onSuccess` is provided it is called when loading is finished.
	 *        If `onSwap` is provided it is called when loading is given up.
	 */
	return function zenfonts(fonts, options) {
		if (!(fonts instanceof Array)) {
			fonts = [fonts]
		}
		options = options || {}
		if (!doc.body) {
			return setTimeout(function () { zenfonts(fonts, options) }, 1)
		}
		// Create a separate div for each font:
		var checkers = []
		var i = fonts.length
		while (i--) {
			var font = fonts[i]
			if (typeof font === "string") {
				font = {family: font}
			}
			var family = font.family
			var div = doc.createElement("div")
			div.style.cssText = "position:absolute;top:-999px;left:-9999px;visibility:hidden;" +
				"white-space:nowrap;font-size:20em;font-family:" + testFonts + ";" + font.style || ""
			div.appendChild(doc.createTextNode("// Zenfonts([{}]);"))
			doc.body.appendChild(div)
			var checker = makeChecker(div, div.offsetWidth)
			// Change the font to the font family to be loaded:
			div.style.fontFamily = "'" + family + "'," + testFonts
			// If the size hasn’t changed already, add it to the list of checkers:
			if (!checker()) {
				checkers.push(checker)
			}
		}
		var fallbackClass = options.fallbackClass
		// onSuccess will be executed after all fonts was loaded
		var success = function success() {
			// The fallback class must be removed to reveal the web font:
			removeTopLevelClass(fallbackClass)
			// Execute the onLoad callback if provided:
			if (options.onSuccess) {
				options.onSuccess()
			}
		}
		if (checkers.length === 0) {
			// All fonts are already loaded. Zenfonts quits.
			return success()
		}
		// Apply loading class if there is any:
		var loadingClass = options.loadingClass
		if (loadingClass) {
			docElem.className += " " + loadingClass
		}
		var fallbackTimeout = options.fallback || 2000
		// success() will be called after all the fonts were loaded
		if (fallbackClass) { // this is applied after the fallback timeout
			var fallbackTimerId = setTimeout(function fallback() {
				removeTopLevelClass(loadingClass)
				docElem.className += " " + fallbackClass
			}, fallbackTimeout)
			// Redefine success to clear the fallback timeout as well:
			var origSuccess = success
			success = function () {
				clearTimeout(fallbackTimerId) // no need for the fallback anymore
				origSuccess()
			}
		}

		var giveUpAfter = new Date().getTime() + Math.max(fallbackTimeout, options.swap || 9999);

		// Initiate recursive backround check on the array of checkers for width change.
		// The array is handled as a single unit, all must be loaded before it's done.
		// success() is only called if all the fonts were loaded successfully.
		// onSwap() is called when Zenfonts gives up.
		// removeLoadingClass() is called in any case, either after success or after Zenfonts gives up.
		(function monitorWidth(delay) {
			setTimeout(function () {
				var giveUp = new Date().getTime() >= giveUpAfter
				if (giveUp && options.onSwap) {
					options.onSwap()
				}
				var i = checkers.length
				while (i--) {
					if (checkers[i](giveUp)) {
						checkers.splice(i, 1)
					}
				}
				if (checkers.length === 0) {
					if (!giveUp) {
						success()
					}
					removeTopLevelClass(loadingClass)
				} else {
					monitorWidth(delay * 1.5)
				}
			}, delay)
		})(9)

	}

})(document);


