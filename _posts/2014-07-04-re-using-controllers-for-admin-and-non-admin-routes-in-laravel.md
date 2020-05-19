---
excerpt: Re-using controllers for admin and non-admin routes in Laravel
title: Re-using controllers for admin and non-admin routes in Laravel
---
I’ve been using Laravel a lot recently, and grown to like it quite a bit.
Another thing I’m fond of is RESTful web services, and naturally fell in favour with resource controllers within Laravel.

Most web development projects require a public front-end and some sort of administration interface, and a project I recently worked on was no different.

The usual approach is to create separate controllers and views for the front-end and back-end.
However, my thought process was: a resource controller manipulates a resource (whether that be a user, an article, a product, or whatever) no matter the context.
I therefore wanted to find a way to re-use my resource controllers for both public and admin actions.

My approach was as follows:

* Add an `admin` prefix (and filter) to admin routes
* In the controller, check the request prefix
* If the request prefix was `admin`, show one view
* If the request _didn’t_ have the `admin` prefix, show a user-specific view

## Routes
The first step for me was to define my routes for the admin and non-admin parts of the site.
This meant my routes file ended up looking similar to this:

```php
// Route–model binding
Route::model('item', 'Item');

// Public routes
Route::resource('item', 'ItemController', array('only' => array('index', 'show')));

// Admin routes
Route::group(array('prefix' => 'admin'), function () {
    Route::resource('item', 'ItemController');
});
```

So now the following URLs are accessible:

* **http://example.com/item**
* **http://example.com/item/**<code>{item}</code>
* **http://example.com/admin/item**
* **http://example.com/admin/item/create**
* **http://example.com/admin/item/**<code>{item}</code>**/edit**

Also, as an aside, I’m using [route–model binding][1], which will detect an ID passed in the URL and instead actually inject an instance of the `Item` model matching that primary key, into your controller methods.

I’ve also restricted front-end actions to `index` and `show` only as our theoretical users wouldn’t need to be able to create/edit/delete items,
only administrators would be able to do that.

## Controllers
To be able to re-use controllers for both front- and back-end actions, we need a way to detect if we’re being accessed via an admin URL or not.
Thankfully, Laravel has a lot of helpful methods for working with requests.

In your `BaseController` we can add a helper method, that other controllers will inherit, to detect whether we have an admin request or not:

```php
class BaseController extends Controller
{
    public function isAdminRequest()
    {
        return Route::getCurrentRoute()->getPrefix() === 'admin';
    }
}
```

We can then use this method in say, our `ItemController` (so long as it extends the `BaseController`):

```php
class ItemController extends BaseController
{
    public function index()
    {
        $view = $this->isAdminRequest() ? 'item.admin.index' : 'item.index';

        return View::make($view, [
            'items' => Item::paginate(),
        ]);
    }
}
```
This is a simple example in which we’re just swapping the view depending on whether this is an admin request or not,
but hopefully it gives you an idea of how to change the output depending on what type of request your controller action receives.

It’s a simple thing, but keeps your codebase [DRY][2] as you’re not having to create duplicate controllers.

[1]: http://laravel.com/docs/routing#route-model-binding
[2]: http://en.wikipedia.org/wiki/Don't_repeat_yourself
