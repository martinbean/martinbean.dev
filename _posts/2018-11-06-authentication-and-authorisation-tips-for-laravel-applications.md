---
excerpt: "Patterns that I’ve personally found to lead to maintainable Laravel application, as well as patterns that don’t."
title: Authentication and authorisation tips for Laravel applications
---
Over the past five years, I’ve worked primarily with Laravel applications and in
that time have seen patterns both that lead to unmanageable applications as well
as those that lead to easy-to-manage applications.

In this post, I boil down some pitfalls to try and avoid in your applications,
as well as patterns I follow that I‘ve found from experience to keep your
application easy to navigate and maintain.

## Have a single User model
When your application has more than one “type” of user, it’s tempting to create
another model to represent the second type, i.e. an `Admin` model. **Don’t**.

Creating a second user model immediately increases the amount of files needed to
authenticate a user; on top of the second model you now need to maintain a second
authentication guard, controllers, and views.

Additional user models also adds additional complexities. If you have two guards
(one for your “regular” user and one for your “admin” user), what happens when
you want to have a route that allows access to _both_ users? Or if you have more
than two user models, a subset (i.e. two out of three user types)? There’s a more
appropriate solution instead.

## Authorisation
Authorisation is one of the most overlooked features of Laravel. The difference
between _authentication_ and _authorisation_ is, succinctly:

* **Authentication** is checking _who_ a user is.
* **Authorisation** is checking _what_ a user can do.

If you have a single user model, then you should use authorisation to check what
routes your users can access.

There are various places you can authorise a user: via middleware, in form
request classes, using a dedicated policy class, using custom gates, and so on.

### Custom middleware classes
You can also create custom middleware classes to restrict access to specific
user types, too. If you have an administration panel in your application then
you obviously want to restrict that to admin users also. Designating a user as
an admin can be as simple as adding a `is_admin` column to your `users` table.
An `admin` middleware could then check for admin users like this:

```php
class VerifyUserIsAdministrator
{
    public function handle($request, Closure $next)
    {
        if ($request->user()->is_admin == true) {
            return $next($request);
        }

        // Throw 403 Forbidden exception.
        // We know who the user is, but they are not an administrator.
        abort(403);
    }
}
```

### Form request classes
Form request classes are custom request classes can be used to validate incoming
request data, but also perform authorisation. When you create a new form request
class using Artisan (`php artisan make:request`) it contains an `authorize()`
method. Here you can return a boolean as to whether the current user should be
allowed to execute the request.

This is a good spot to check attributes, on either the `User` model or any
models bound to the request using [route–model binding][1]. So if your application
allows a comment to be updated, but only within 10 minutes of it being posted
and only by the original author, then you could perform those checks in your
form request class:

```php
class UpdateCommentRequest extends FormRequest
{
    public function authorize()
    {
        // Check author relation on comment model is the current user
        // Check comment was created less than 10 minutes ago
        return $this->comment->author->is($this->user()) &&
               $this->comment->created_at->lt(now()->subMinutes(10));
    }
}
```
```php
class CommentController extends Controller
{
    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        // Form request authorisation and validation passed
    }
}
```

### Policies
I personally prefer creating resourceful controllers in my Laravel applications.
My development process usually goes:

1. Create a model.
2. Create a resource controller for that model.
3. Define routes, and use route–model binding.
4. Create a policy for the same model.

Using the above conventions makes for an easily-navigatable project: given a
model, I (or someone else) knows where to look for the controller for that model
and any authorisation logic for that model’s controller.

Another advantage of using resourceful controllers is that you can apply _all_
methods of a policy class in one fell swoop like this:

```php
class ArticleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Article::class);
    }

    public function update(UpdateArticleRequest $request, Article $article)
    {
        $article->update($request->validated());

        // Redirect back to newly-updated article
    }
}
```

The combination of having an `Article` policy class; using route–model binding;
and form request classes for validation makes for slim controller actions that
are seldom longer than one line. Actions contain no validation logic, no
authorisation logic—they just do what they’re intended.

## Conclusion
I’ve been working with Laravel projects for just over five years now. I’ve worked
on both new and already-existing codebases. Following the above conventions has
resulted in the more maintainable and easy-to-navigation projects.

Of course every application differs in size, but even applications with more
complex business logic can have their operations boiled down to manipulating
resources in a RESTful manner.

Things like fulfilling an order, developers may be tempted to create a `fulfill()`
method on an `OrderController` class, but would “fulfilling an _order_ resource
not result in creating a new _fulfillment_ resource? When you think of operations
like that, you can then start creating nested resource controllers, even if those
controllers don’t actually create new Eloquent models:

```php
class OrderFulfillmentController extends Controller
{
    public function store(CreateFulfillmentRequest $request, Order $order)
    {
        $order->markAsFulfilled();

        // Redirect back to order
    }
}
```

Sticking with a resource controller means you can still take advantage of form
request classes and policies for authorisation (i.e. checking which users can
fulfill orders).

Hopefully you’ve picked up some tips for this post, and lead to more manageable
Laravel applications.

[1]: https://laravel.com/docs/5.7/routing#route-model-binding
