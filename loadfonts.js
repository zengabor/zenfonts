/*!
 * LoadFonts 1.0
 * https://github.com/GaborLenard/LoadFonts/
 *
 * Copyright 2015 Gabor Lenard
 * Released under the MIT license
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Gabor Lenard
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Date: 2015-01-18T20:39Z
 */

/*jshint devel:true, asi:true */
(function (root, definition) {

	root.LoadFonts = definition()

}(window, function () {
	"use strict"
	
	var doc = document
	var html = doc.documentElement
	
	// private recursive routine to regularly check the array of spans for width change
	var watchWidthChange = function watchWidthChange(spans, delay, doneCallback) {
		var i = spans.length
		while (i--) {
			var span = spans[i]
			if (span.offsetWidth !== span.origWidth) {
				span.parentNode.removeChild(span)
				spans.splice(i, 1)
			}
		}
		if (spans.length === 0) {
			doneCallback()
		} else {
			setTimeout(function () { watchWidthChange(spans, delay * 1.25, doneCallback) }, delay)
		}
	}
	
	/**
	 * Loads the specified fonts in a hidden span, forcing the browser to load them.
	 * If the @param {fonts} is an Array, it either contains one or more strings or Objects 
	 * or both, mixed. The Objects must have attribute `family` containing the font-family.
	 * Optional attribute is `style`.
	 *
	 * Examples: 
	 *		loadFonts("Sauna")
	 *		loadFonts("Dolly", "hide-dolly")
	 *		loadFonts({family: "Dolly", style: "font-weight: 300"}, "hide-dolly")
	 *		loadFonts(["Sauna", {family: "Dolly", style: "font-weight: 300"}], "hide-dolly")
	 *		loadFonts(["Bello", "Liza"], "hide-webfonts", 1000)
	 *		loadFonts("Fakir", "hide-webfonts", 3000, function(){ setLongCookie("fakir", "loaded") })
	 *
	 * @param {fonts} Either an Array or a string, each containing a single font-family. 
	 * @param {fallbackClass} The CSS className that will be applied if the font wasn't loaded within the {fallbackTimeout}
	 * @param {fallbackTimeout} The time in ms before the fallbackClass is applied. Optional. If missing or falsy (including 0), the default 777 is used.
	 * @param {successCallback} function that will be called backed after all fonts were loaded. Optional.
	 */
	var loadFonts = function loadFonts(fonts, fallbackClass, fallbackTimeout, successCallback) {
		var body = doc.body
		if (!body) {
			return 
		}
		if (!(fonts instanceof Array)) {
			fonts = [fonts]
		}
		var spans = []
		for (var i=0, l=fonts.length; i<l; i++) {
			var font = fonts[i]
			if(typeof font === "string") {
				font = {family: font}
			}
			var span = doc.createElement("span")
			span.style.cssText = "display:block;position:absolute;top:-9999px;left:-9999px;" +
				"visibility:hidden;width:auto;height:auto;white-space:nowrap;line-height:normal;" +
				"margin:0;padding:0;font-variant:normal;font-size:300px;font-family:Georgia,sans-serif;" + 
				(fonts[i].style ? fonts[i].style : "")
			span.appendChild(doc.createTextNode("A1WQy-/#"))
			body.appendChild(span)
			span.origWidth = span.offsetWidth
			span.style.fontFamily = "'" + font.family + "'," + span.style.fontFamily
			if (span.origWidth !== span.offsetWidth) {
				body.removeChild(span)
			} else {
				spans.push(span)
			}
		}
		var cleanup = function cleanup () {
			if (fallbackClass) {
				html.className = html.className.replace(
					new RegExp("(^|\\s)*" + fallbackClass + "(\\s|$)*", "g"), " "
				)
			}
			if (typeof successCallback === "function") {
				successCallback()
			}
		}
		var timerId
		if (spans.length === 0) {
			cleanup()
		} else {
			if (fallbackClass) {
				timerId = setTimeout(function fallback() {
					html.className += " " + fallbackClass
				}, fallbackTimeout || 777)
			}
			watchWidthChange(spans, 23, function () {
				clearTimeout(timerId)
				cleanup()
			})
		}
	}

	return loadFonts
}))
