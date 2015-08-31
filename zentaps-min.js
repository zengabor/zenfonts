/**
 * Zentaps 0.5.0
 * https://github.com/zengabor/zentaps/
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


(function (win) {
	"use strict"
	
	// The finger should not move more than this in any direction between the touchstart & touchend:
	var offsetTolerance = 15 // pixels

	// Zentaps only waits so long for the browser's click before it triggers its own click:
	var browserClickDeadline = 10 // miliseconds

	// Taps must be shorter than this:
	var theLongestTap = 500 // miliseconds

	// New taps in the same area are ignored for so many miliseconds after a tap:
	var ghostTime = 500 // miliseconds
	
	// var click = "click"
	// var touchend = "touchend"
	
	var addEventListener = function (elem, eventType, func) {
		elem.addEventListener(eventType, func, true)
	}

	var removeEventListener = function (elem, eventType, func) {
		elem.removeEventListener(eventType, func, true)
	}
	
	// Create individual touchend event handler
	var touchendListener = function (touchstartEvent) {
		var listener = function (event) {
			var elem = event.target
			var isSamePosition = function (newEvent) {
				return (
					Math.abs(touchstartEvent.pageX - newEvent.pageX) < offsetTolerance &&
					Math.abs(touchstartEvent.pageY - newEvent.pageY) < offsetTolerance
				)
			}
			removeEventListener(elem, "touchend", listener)
			if (isSamePosition(event)) {
				var browserClickDetector // this is called when the browser triggers the click before browserClickDeadline
				var zenClicker // this will trigger a click if the browser misses the deadline
				var ghostBuster // this will catch any ghost clicks after zenClicker
				var retireGhostBuster = function () { removeEventListener(win, "click", ghostBuster) }

				// This is a handler for the natural click, which happens in Chrome and on iOS on a slightly longer tap.
				// The handler then cleans up and lets the event follow its natural course (tao).
				browserClickDetector = function () {
					removeEventListener(win, "click", browserClickDetector)
					clearTimeout(zenClicker)
				}
				addEventListener(win, "click", browserClickDetector)

				// This makes sure that subsequent clicks from the browser are busted:
				ghostBuster = function (ghostEvent) {
					// TODO: the timeStamp === 0 trick works on iOS but I need to test it on other phones as well
					if (isSamePosition(ghostEvent)) { // && ghostEvent.timeStamp === 0) { 
						ghostEvent.stopImmediatePropagation()
						ghostEvent.preventDefault()
						// ghostEvent.stopPropagation()
						retireGhostBuster()
					}
				}

				zenClicker = setTimeout(function () {
					removeEventListener(win, "click", browserClickDetector)
					elem.click()
					setTimeout(function () { addEventListener(win, "click", ghostBuster) }, 1)
					setTimeout(retireGhostBuster, ghostTime)
				}, browserClickDeadline)
			}
		}
		return listener
	}

	// Let’s exclude non touch capable & old browsers, as well as Chrome 32+
	if ("ontouchend" in win && "addEventListener" in win && (+(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1]) < 32) {

		// Global handler which creates touchend handlers on the individual elements being touched:
		addEventListener(win, "touchstart", function (event) {
			if (event.targetTouches && event.targetTouches.length < 2) { // only single finger
				var tel = touchendListener(event)
				var elem = event.target
				addEventListener(elem, "touchend", tel)
				setTimeout(function () { removeEventListener(elem, "touchend", tel) }, theLongestTap)
			}
		})
	}

})(this);


