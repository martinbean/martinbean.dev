---
title: Maintaining Aspect Ratio in CSS
meta_description: A little CSS trick on how to maintain aspect ratio of block-level elements in fluid designs.
layout: default
---
# Maintaining Aspect Ratio in CSS

One common problem I face is, maintaining the aspect ratio of a block-level element.
Say you have something like a photo gallery, and you want all the items to retain the same aspect ratio within fluid-width columns; a common responsive web design layout problem.

The answer is mind-numbingly simple and I’m blogging it this evening for posterity and in an attemp to help any one else who may have this issue.

I can’t take all the credit, as the technique was taken from the fantastic [Zurb Foundation](http://foundation.zurb.com/)’s “flex-video” component.

Say you have mark-up like the following:

{% highlight html %}
<div class="albums">
  <div class="album">
    <a class="album-cover" href="#">
      <img src="//placehold.it/220x124" alt="Album Title" />
    </a>
  </div>
  …
</div>
{% endhighlight %}

The CSS is simple: set the `height` to zero and apply `padding-bottom`.
The value you use for the `padding-bottom` depends on the aspect ratio you’re going for.
In my case, I wanted an aspect ratio of 16:9 so to calculate the `padding-bottom` value you do the simple calculation of:

<p><strong>(9&#8287;&#247;&#8287;16)&#8287;&times;&#8287;100&#8287;=&#8287;56.25</strong></p>

This means our `padding-bottom` should be 56.25%. In our CSS:

{% highlight css %}
.album-cover {
    display: block;
    height: 0;
    padding-bottom: 56.25%;
    overflow: hidden;
}
{% endhighlight %}

And <i lang="fr">voil&agrave;</i>, you should find that your album cover retains its aspect ratio if within a fluid-width container and resizing your viewport.
Hope this helps some one!