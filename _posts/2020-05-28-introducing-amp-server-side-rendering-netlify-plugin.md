---
excerpt: "I’m pleased to announce an AMP server-side rendering build plugin I’ve created for Netlify is now available!"
title: Introducing the AMP Server-Side Rendering Netlify Plugin
twitter_card_type: summary_large_image
twitter_card_image: /img/posts/2020-05-28-introducing-the-amp-server-side-rendering-netlify-plugin/twitter-card-image.jpg
---
I’m pleased to announce that the [AMP Server-Side Rendering][1] plugin is now available on [Netlify][2]!

The plugin can be installed by adding its name to your **netlify.toml** file:

```toml
[[plugins]]
package = "netlify-plugin-amp-server-side-rendering"
```

The plugin will then optimise any HTML files in your site’s publish directory.

More information on Netlify’s build plugins can be found on their documentation:
[docs.netlify.com/configure-builds/build-plugins][3]

## Background
A few weeks ago, I decided to change the <abbr class="initialism" title="Top-Level Domain">TLD</abbr> of my website’s domain
from **.co.uk** to the more ~~hipster~~ <ins>developer-friendly</ins> **.dev**.
This set off a cascade of changes that included refreshing the site’s design, moving from GitHub Pages to Netlify for hosting,
and deciding to experiment with an AMP-first website.

### What’s AMP?
[AMP][4] is a Google initiative to deliver faster websites.
It does this by introducing essentially a subset of HTML to limit what web pages can include and reduce their weight.
Google also increases speed of AMP sites faster by caching them, and serving sites from these caches.
However, there is some criticism in this approach as the AMP caches are Google-branded and essentially introduce a “walled garden” on the web operated by Google.
Nonetheless, I wanted to try out AMP for its potential of improved speeds and performance.

### Optimising AMP
Another criticism of AMP is that it requires a boilerplate JavaScript library to be installed in pages.
This boilerplate hides the content of your web page until it’s performed some layout calculations for elements, and then displays your content.

One optimisation Google suggests is to server-side render your AMP pages.
This means AMP’s layouts calculations are done up-front and therefore there’s no need to hide and show your content.
Google offers a JavaScript module, which can be used in Node.js scripts to pre-render AMP pages.

I was already hosting my website with Netlify so when I saw they announce Build Plugins,
I thought that made the perfect opportunity for an AMP server-side rendering plugin.

The plugin is pretty simple, finding HTML files in a Netlify site’s publish directory and then using Google’s library to optimise them.
It’s these optimised HTML files that are then actually served by Netlify. No more content hiding or delays in rendering!

If you have any questions on AMP, Netlify, or anything else covered above, then I’d be happy to answer them!
Feel free to [reach out to me on Twitter][5].

[1]: https://www.npmjs.com/package/netlify-plugin-amp-server-side-rendering
[2]: https://www.netlify.com
[3]: https://docs.netlify.com/configure-builds/build-plugins
[4]: https://amp.dev
[5]: https://twitter.com/martinbean
