/*!
 * LoadFonts 1.1
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
	
	var testText = "// LoadFonts([{}]);" // used to measure the width
	var testFonts = "Courier,Verdana" // these fonts are compared to the custom fonts
	var spanFormat = "position:absolute;top:-999px;left:-999px;visibility:hidden;" +
		"display:block;width:auto;height:auto;white-space:nowrap;line-height:normal;" +
		"margin:0;padding:0;font-variant:normal;font-size:20em;font-family:" + testFonts + ";"
	// These variables saves some bytes when minimizing:
	var str = "string"
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
	var watchWidthChange = function watchWidthChange(spans, fallbackStylesheet, delay, onAllFinished) {
		var giveup = delay > 12222 // the cumulated time will be around a minute
		var i = spans.length
		while (i--) {
			var span = spans[i]
			// we have to turn off the fallback stylesheet for the check
			fallbackStylesheet.disabled = true
			if (giveup || span.offsetWidth !== span.origWidth) {
				spans.splice(i, 1)
				kill(span)
			}
			// turn the stylesheet back on
			fallbackStylesheet.disabled = false
		}
		if (spans.length === 0) {
			if (!giveup) {
				onAllFinished()				
			}
		} else {
			setTimeout(function () { watchWidthChange(spans, fallbackStylesheet, delay * 1.3, onAllFinished) }, delay)
		}
	}

	// creates a new stylesheet that can be later appended to document.head
	var createStylesheet = function createStylesheet(content) {
		var s = doc.createElement("style")
		s.setAttribute("type", "text/css") // IE compatibility
		if (s.styleSheet) {
			s.styleSheet.cssText = content
		} else {
			s.appendChild(doc.createTextNode(content))
		}
		return s
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
	 *   loadFonts({family:"Sauna"})
	 *   loadFonts({family:"Dolly", fallback:"Georgia"})
	 *   loadFonts({family:"Dolly", fallback:["Georgia","Times"]})
	 *   loadFonts({family: "Dolly", style: "font-weight: 300"}, 
	 *     {loadingClass:"loading-dolly-r", fallbackClass:"fallback-dolly-r"})
	 *   loadFonts([{family:"Auto"}, {family: "Sauna", style: "font-weight: 700"}], 
	 *     {timeout:1000, fallbackClass:"fallback-webfonts"})
	 *   loadFonts(
	 *     {family:"Fakir"}, 
	 *     {timeout: 2500, onLoad: function(){ setLongCookie("fakir", "loaded") }
	 *   })
	 *
	 * @param {fonts} An object or an array of objects with font families, 
	 *        optionally fallback local fonts, and optionally styles.
	 * @param {options} An object with optional attributes: `timeout`, 
	 *        `loadingClass`, `fallbackClass`, `onFallback`, `onLoad`.
     *        If `loadingClass` is provided, it will be applied immediately and
	 *        removed once the fallback happens or the loading finished.
	 *        If `fallbackClass` is provided it will be applied to the <html>
	 *        element after the specified timeout if loading isn't finished.
	 *        The default for `timeout` is 2222 ms.
	 *        If `onFallback` is provided it will be called upon fallback.
	 *        If `onLoad` is provided it will be called when loading finished.
	 * @param {successCallback} function that will be called backed after all fonts
	 *        were loaded. Optional.
	 */
	var loadFonts = function loadFonts(fonts, options) {
		if (!(fonts instanceof Array)) {
			fonts = [fonts]
		}
		switch (typeof options) {
			case "undefined": options = {}
			case "object": break
			case "number": options = {timeout: options}; break
			// case str: options = {fallbackClass: options}; break
			default: throw "options"
		}
		var fallbackClass = options.fallbackClass || ""
		var loadingClass = options.loadingClass || ""
		var fallbackStylesheet
		var spans = []
		var fontfaceDefinitions = ""
		var body = doc.body
		if (!body) {
			// cannot work without the document.body
			throw "no body"
		}
		// create a separate span for each font
		for (var i = 0, l = fonts.length; i < l; i++) {
			var font = fonts[i]
			var family = font.family
			var style = font.style
			var localFallback = font.fallback
			var span = doc.createElement("span")
			span.style.cssText = spanFormat + (style ? style : "")
			span.appendChild(doc.createTextNode(testText))
			// put it into the body
			body.appendChild(span)
			// remember the size with the default test fonts
			span.origWidth = span.offsetWidth
			// change the font to the font family to be loaded
			span.style.fontFamily = "'" + family + "'," + testFonts
			// check whether the size changed, meaning the font is already ready
			if (span.origWidth !== span.offsetWidth) {
				// font was already loaded
				kill(span)
			} else {
				// collect span
				spans.push(span)
				// create 
				if (localFallback) {
					if (str === typeof localFallback) {
						localFallback = [localFallback]
					}
					fontfaceDefinitions += "@font-face{font-family:'" + family + "';src:local('" + 
						localFallback.join("'),local('") + "')" + (style ? style : "") + "}"
				}
			}
		}
		if (fontfaceDefinitions) {
			fallbackStylesheet = createStylesheet(fontfaceDefinitions)
		}
		// success() will be executed after the font was loaded
		var success = function success() {
			// the fallback class must be removed to reveal the font
			removeTopLevelClass(fallbackClass)
			removeTopLevelClass(loadingClass)
			// remove extra stylesheet if any
			kill(fallbackStylesheet)
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
			if (fallbackClass || fallbackStylesheet) { // this CSS className needs to be applied after the timeout
				var timeout = options.timeout || 2222
				var fallbackTimerId = setTimeout(function fallback() {
					// fall back routine
					// replaces the loading class with the fallback class
					removeTopLevelClass(loadingClass)
					if (fallbackClass) {
						html.className += " " + fallbackClass
					}
					if (fallbackStylesheet) {
						// adds the fallback @font-face definitions to the document
						doc.getElementsByTagName("head")[0].appendChild(fallbackStylesheet)
					}
				}, timeout)
				// redefine onAllFinished to clear the timeout as well
				onAllFinished = function () {
					clearTimeout(fallbackTimerId) // no need for the fallback anymore
					success() 
				}
			}
			// initiate backround watching
			watchWidthChange(spans, fallbackStylesheet || {}, 23, onAllFinished)
		}
	}

	return loadFonts
}))
