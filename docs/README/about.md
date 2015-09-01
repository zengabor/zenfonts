## About

Zenfonts is a tiny JavaScript helper to (pre)load web fonts. It’s not replacing the way of loading web fonts. Rather, Zenfonts is there to help you when the fonts are not loaded in time.

If you are really serious about performance & a smooth experience consider not using web fonts at all. Most platforms have a handful of beautiful fonts already installed which don’t have any of the drawbacks of web fonts. However, if you decide to use web fonts then Zenfonts can be a big help for you:

- It can solve the “long invisible text” issue (iPhone and old WebKit-based Android browsers on slow network) by applying a fallback class during font loading.
- It can also solve the Flash Of Unformatted Text, aka [FOUT](http://www.paulirish.com/2009/fighting-the-font-face-fout/) which still happens in Internet Explorer and Edge.
- It can preload fonts before they are used (e.g., in a dialog box or on a next page).
- Supports practically all browsers. Tested and works under Android 2.2+ browser, Chrome 14+, Edge, Firefox 3.6+, IE6+, Opera 10.6+, Safari 4.1+ for iOS & OS X.
- It’s tiny (759 bytes minimized & gzipped), ready to be inlined in your page.

Of course, loading web fonts is not a problem in most cases. The network is fast enough, the font files are cached after the first load, and the majority of the browser population (Chrome desktop, Chrome for Android, Firefox, Opera) handles font-loading already quite smart, avoiding both the initial flickering and reflow and the “long invisible text” problem by falling back to the next available font after 3&nbsp;seconds. Other browsers, on the other hand, most prominently iPhones, iPads and old Android browsers hide the text too long if the loading process is slow. Think of Zenfonts as a safety valve. It saves your site if everything else fails.

In the long run Zenfonts will be obsolete once the wonderful [css-font-rendering](https://github.com/KenjiBaheux/css-font-rendering/) becomes available in the majority of the browser population. At the moment there isn’t a single browser supporting it, so Zenfonts may be quite useful.
