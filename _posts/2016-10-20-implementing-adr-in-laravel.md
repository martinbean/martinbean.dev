---
excerpt: "An example of implementing the Action–Domain–Responder pattern in Laravel."
layout: post
nav: blog
title: Implementing ADR in Laravel
---
The <abbr class="initialism" title="Model–View–Controller">MVC</abbr> pattern has become widespread in web development,
but it was never meant to be used in websites and web applications.

Different people have different interpretations of MVC, and what code should go where.
To this end, a newer pattern meant to build upon MVC but more suited to web applications is **ADR: Action–Domain–Responder**.

ADR groups the functionality of applications into _actions_.
Actions execute any business logic for that action, before passing the result to a _responder_ where it is presented as a view.

As first glance, it seems similar to MVC but it provides a more clear separation of concerns, and there’s no argument as to what goes where. For example, in an MVC application, where do you set response headers?
The controller? A view class? There’s no definitive answer whereas with ADR there is: the responder class.
Giving the similarities, it’s also easy to convert an existing MVC application to follow the ADR pattern.

So let’s look at implementing the ADR pattern in [Laravel](https://laravel.com/).

## Directory Structure

As we’re not going to be using MVC, we can be a bit more creative in where to store things.
A good idea is to keep action, domain and responder classes together.
So if we had a blog, a simple directory structure may look like this:

* /app
  * /Blog
    * /Actions
      * ListPostsAction.php
      * ViewPostAction.php
    * /Domain
      * /Collections
        * PostCollection.php
      * /Entities
        * Post.php
      * /Repositories
        * PostRepository.php
    * /Responders
      * ListPostsResponder.php
      * ViewPostResponder.php

This makes searching for classes relating to a certain part of your _business domain_ easier.
“I need to find a blog action class. Well that will be in **app/Blog/Actions**.”

## Routing

Since we’re no longer using controller classes, we need to modify the router slightly.
Laravel’s opinionated in that it expects routes to be in the **app/Http/Controller** directory.

Open your **app/Providers/RouteServiceProvider.php** file.
You’ll see the `mapWebRoutes()` method defines a route group.
Remove the `namespace` key.
This will allow us to specify the full namespace of our action classes since they are grouped by _domain_.

Using the example classes above, our **routes/web.php** may look like this now:

```php
// Blog Posts
Route::get('/blog', 'App\Blog\Actions\ListPostsAction');
Route::get('/blog/{article}', 'App\Blog\Actions\ViewPostAction');
```

In Laravel 5.3, if you do not specify an action then Laravel will attempt to call the `__invoke()` magic method on the named class.
This is perfect for our single-use action classes!

## Actions

As above, actions are just classes that represent one specific action in your application.
Listing blog posts is one such action, so we name the class as such.
An implementation may look like this:

```php
<?php

namespace App\Blog\Actions;

use App\Blog\Domain\Repositories\PostRepository;
use App\Blog\Responders\ListPostsResponder;

class ListPostsAction
{
    public function __construct(PostRepository $posts, ListPostsResponder $response)
    {
        $this->posts = $posts;
        $this->response = $response;
    }

    public function __invoke()
    {
        $posts = $this->posts->all();

        return $this->response->send($posts);
    }
}
```

As the action class would be resolved by Laravel’s service container during routing,
we can type-hint the dependencies our actions needs in its constructor.
So we inject the post repository and the action’s corresponding responder class.

In the `__invoke()` method (where the action does its work), we simply retrieve a collection of posts and then pass it to our (not-yet-existing) responder class.
So let’s create that class!

## Responders

A responder class takes some domain data and displays it.
It’s only just is to make a response, so it’s akin to a presenter in that instance.

In the action class, I used a `send()` method as it seems more “Laravel-y”.
So a `ListPostsResponder` class may look like this:

```php
<?php

namespace App\Blog\Responders;

use Illuminate\Database\Eloquent\Collection;

class ListPostsResponder
{
    public function send(Collection $posts)
    {
        return view('post.index', compact('posts'));
    }
}
```

Nothing too advanced here.
The responder is given a collection of `Post` models and renders it in a view.

Responders are where you perform _any_ logic related to returning a response.
So it’s here you’d set any headers (i.e. cache expiration) or render a JSON representation if requested by the user:

```php
public function send(Collection $posts)
{
    if (request()->wantsJson()) {
        return response()->json(compact('posts'));
    } else {
        return view('post.index', compact('posts'));
    }
}
```

## Conclusion

Following the ADR pattern will see an increase in the number of classes in your application
(as each action has its own class, rather than being a method in a controller class),
but it does mean each class has a single responsibility and is named after the task it’s performing.

In a large codebase, it can become difficult to track down which controller an action is in,
especially if working with many people who have different ideas of how things should be structured.

What are your thoughts on ADR?
Are you already using it?
Think it may be appropriate for your next project?
I would love to hear your thoughts in the comments.
