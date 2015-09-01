
### 6. Check out the source code of this page

In the head you can see the CSS files for Google fonts which define the @font-face entries.

Then the CSS rules related to the web fonts are inlined in a `<style>` block. After the normal definition of the font-family there is always a fallback with the right prefix: `.fallback`, `.fallback-logotype`, and `.fallback-mono`. (Which could be done more elegantly with a CSS preprocessor, like Sass.)

Right after comes the minimized version of Zenfonts inlined, and then three calls of zenfonts():

1. For the body text with a low fallback & equal swap timeout, so content won't get blocked long. There is also a loading class to avoid FOUT on IE & Edge.
2. I give a lot more time for the logotype as it doesn't cause reflows, and I keep loading it for another 30 seconds in case of a swap.
3. Finally, the font for the code examples fall back after 1 second but then they keep loading until the default 10 seconds timeout and they appear as soon as they become available (the code uses preformatted line breakes so there can't be significant reflows).

This is an example of finding the best strategy for each type of content/font combinations.

To experience how this page loads on a slow network:

1. Disable the browser's cache or clear it. (Otherwise fonts may be loaded from there.)
2. Load the page on a slow or emulated network. (E.g., turn on network throttling in Chrome DevTools, or use a slow mobile network.)

