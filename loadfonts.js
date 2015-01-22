/*!
 * LoadFonts 1.2
 * https://github.com/GaborLenard/LoadFonts/
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
(function (root, definition) {

	root.LoadFonts = definition()

}(window, function () {
	"use strict"

	// these fonts are compared to the custom fonts:
	var testFonts = "Courier,Verdana"
	// These variables saves some bytes when minimizing:
	var doc = document
	var html = doc.documentElement

	// Removes an element from its parent and releases it
	var kill = function kill(element) {
		if (element) {
			var p = element.parentNode
			if (p) {
				p.removeChild(element)
			}
			element = 0
		}
	}

	// Check executed recursively to check the array of spans for width change.
	// The array is handled as a single unit, all must be downloaded before it's done.
	var watchWidthChange = function watchWidthChange(spans, delay, onAllFinished) {
		var giveup = delay > 12222 // the cumulated time will be around a minute
		var i = spans.length
		while (i--) {
			var span = spans[i]
			if (giveup || span.offsetWidth !== span.origWidth) {
				spans.splice(i, 1)
				kill(span)
			}
		}
		if (spans.length === 0) {
			if (!giveup) {
				onAllFinished()
			}
		} else {
			setTimeout(function () { 
				watchWidthChange(spans, delay * 1.3, onAllFinished) 
			}, delay)
		}
	}

	// a browser-agnostic way to remove class name from <html>
	var removeTopLevelClass = function addTopLevelClass(className) {
		if (className) {
			html.className = html.className.replace(
				new RegExp("(^|\\s)*" + className + "(\\s|$)*", "g"), " "
			)
		}
	}

	/**
	 * Loads the specified fonts in a hidden span, forcing the browser to load them.
	 * If the @param {fonts} is an Array, it either contains one or more strings or
	 * Objects or both, mixed. The Objects must have attribute `family` containing
	 * the font-family. Optional attribute is `style`.
	 *
	 * Examples: 
	 *   loadFonts("Sauna Pro")
	 *   loadFonts(["Sauna Pro", "Dolly Pro"])
	 *   loadFonts({family:"Sauna", style: "font-style:italic; font-weight:700"},
	 *     {timeout: 999, loadingClass:"sauna-load", fallbackClass:"sauna-fallb"})
	 *   loadFonts(
	 *     ["Fakir-Black", {family:"Fakir-Italic", style:"font-style:italic"}],
	 *     {timeout: 2500, onLoad: function () { setLongCookie("fakir","loaded") }
	 *   )
	 *
	 * @param {fonts} An object or an array of objects with font families,
	 *        optionally styles (see examples above).
	 * @param {options} An object with optional attributes: `timeout`,
	 *        `loadingClass`, `fallbackClass`, and `onLoad`.
     *        If `loadingClass` is provided, it will be applied immediately and
	 *        removed once the fallback happens or the loading finished.
	 *        If `fallbackClass` is provided it will be applied to the <html>
	 *        element after the specified timeout if loading isn't finished.
	 *        The default for `timeout` is 2222 ms.
	 *        If `onLoad` is provided it will be called when loading finished.
	 */
	var loadFonts = function loadFonts(fonts, options) {
		if (!(fonts instanceof Array)) {
			fonts = [fonts]
		}
		options = options || {}
		var fallbackClass = options.fallbackClass || ""
		var loadingClass = options.loadingClass || ""
		var body = doc.body
		if (!body) {
			// cannot work without the document.body
			throw "no body"
		}
		// create a separate span for each font
		var spans = []
		for (var i = 0, l = fonts.length; i < l; i++) {
			var font = fonts[i]
			if ("string" === typeof font) {
				font = {family: font}
			}
			var family = font.family
			var style = font.style
			var span = doc.createElement("span")
			span.style.cssText = "position:absolute;top:-999px;left:-999px;visibility:hidden;" +
				"display:block;width:auto;height:auto;white-space:nowrap;line-height:normal;" +
				"margin:0;padding:0;font-variant:normal;font-size:20em;font-family:" + testFonts + ";" +
				(style ? style : "")
			span.appendChild(doc.createTextNode("// LoadFonts([{}]);"))
			// put it into the body
			body.appendChild(span)
			// remember the size with the default test fonts
			span.origWidth = span.offsetWidth
			// change the font to the font family to be loaded
			span.style.fontFamily = "'" + family + "'," + testFonts
			// check whether the size changed, meaning the font is already loaded
			if (span.origWidth !== span.offsetWidth) {
				// font is already loaded
				kill(span)
			} else {
				// collect spans for watching
				spans.push(span)
			}
		}
		// success() will be executed after the font was loaded
		var success = function success() {
			// make sure the loading class is removed
			removeTopLevelClass(loadingClass)
			// the fallback class must be removed to reveal the font
			removeTopLevelClass(fallbackClass)
			// execute onLoad callback if provided
			if (options.onLoad) {
				options.onLoad()
			}
		}
		if (spans.length === 0) {
			// no fonts need to be watched, everything is loaded already
			success()
		} else {
			// put up loading class if there is any
			if (loadingClass) {
				html.className += " " + loadingClass
			}
			// onAllFinished() will be called after all the fonts in these spans were loaded
			var onAllFinished = success
			if (fallbackClass) { // this CSS className needs to be applied after the timeout
				var timeout = options.timeout || 2222
				var fallbackTimerId = setTimeout(function fallback() {
					// replaces the loading class with the fallback class
					removeTopLevelClass(loadingClass)
					if (fallbackClass) {
						html.className += " " + fallbackClass
					}
				}, timeout)
				// redefine onAllFinished to clear the timeout as well
				onAllFinished = function () {
					clearTimeout(fallbackTimerId) // no need for the fallback anymore
					success()
				}
			}
			// initiate backround watching
			watchWidthChange(spans, 23, onAllFinished)
		}
	}

	return loadFonts
}))
