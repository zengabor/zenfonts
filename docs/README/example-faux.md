### Control the order of fonts

There is a strategy where you first load the base font (e.g., roman) of a typeface, and only start loading the rest of the fonts from that typeface afterwards. While you are loading the rest the browser can already fake the italic and/or bold versions. Whether this makes sense for you probably depends on many factors, most probably on the typical bandwidth of your audience. 

This can get quite complex. Here’s an example:

````html
<style>
body { font-family: Sauna }

</style>
<script>
var allSauna = [
	"Sauna", 
	{family: "Sauna", style: "font-style: italic"}, 
	{family: "Sauna", style: "font-weight: bold"}
]
var isSaunaProbablyCached = document.cookie.indexOf("sauna=cached") > -1
if (isSaunaProbablyCached) {
	zenfonts(allSauna, { fallbackClass: "fallback-sauna", timeout: 1000 })
} else {
	zenfonts("Sauna", {
		fallbackClass: "fallb-sauna-r",
		loadingClass:  "fallb-sauna-i fallb-sauna-b",
		onSuccess: function () {
			zenfonts( allSauna, { 
				loadingClass: "faux-sauna", timeout: 10000, 
				onSuccess: function () {
					 document.cookie="sauna=cached; expires=Wed, 1 Jan 2020 00:00:00 UTC; path=/"
				}
			})
		}
	})
}
</script>
````
