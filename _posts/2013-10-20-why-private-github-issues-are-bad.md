---
layout: post
meta_description: The community is urging GitHub to add private issues. I explain why I think they’re a bad idea.
title: Why Private GitHub Issues Are Bad
---
There’s been a discussion recently about whether or not [GitHub](https://github.com/) should introduce private issues.
Personally, I’m against this for various reasons.

The main argument for private issues is to disclose security issues and vulnerabilities on repositories.
While I can see the merit in that, it creates more problems than it solves.

Ignoring the fact that one could just contact a repository owner if such an issue arose, one of the problems it creates (by design) is the lack of visibility.

Let’s take a popular repository that recently had a massive security issue not so long back: Ruby on Rails.
The framework powers many sites, so a security concern with Rails is wide-reaching—a perfect candidate for a private issue.
But, as I say it’s a popular repository.
So if one person has seen a vulnerability then chances are *lots* of people have, and are going to want to breach it to the repository owner.

So one person creates a private issue. And another. And another.
Why? Because the people can’t see the other private issues.

On Twitter, [@trodrigues](https://github.com/trodrigues) was one of the people who suggested private issues on GitHub.
I shared my concerns, and this was his response:

<blockquote class="twitter-tweet"><p><a href="https://twitter.com/martinbean">@martinbean</a> <a href="https://twitter.com/github">@github</a> then you just wouldn&#39;t allow it in your projects. problem solved</p>&mdash; Tiago Rodrigues (@trodrigues) <a href="https://twitter.com/trodrigues/statuses/385398823830716416">October 2, 2013</a></blockquote>

Yes. Problem solved. A problem created by the introduction of private issues in the first place.

As the owner of a popular repository like Rails’ this is going to be overwhelming.
For every one else who maybe writes open source software in their spare time, it’s going to be disheartening to see the incoming additional administration work I’m going to have to do now in merging duplicate issues.
I’ve also got to respond **individually** to each private issue, as visibility isn’t shared.
If ten people have broached the same issue, then that’s ten threads of conversation I’ve got to maintain.
If I’m a developer with a full time job and I maintain an open source project in my spare time, this is now valuable time I’ve got to spend communicating rather than **fixing** the actual issue.

There’s also another major flaw: what if someone just writes about the security issue in a public issue any way?
Private issues just doesn’t solve the problem.

What are your thoughts on private issues on GitHub (and other code hosting websites to maintain fairness)?
Let me know if the comments below; I’d be interested to hear your views.