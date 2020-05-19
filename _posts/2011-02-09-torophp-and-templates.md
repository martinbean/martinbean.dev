---
excerpt: About ToroPHP, a tiny PHP library for templating.
title: ToroPHP and Templates
---
Like most website developers, I’m constantly hunting for that perfect PHP framework that’s going to make my life easier, instead of making my life easier for myself.
However, there’s one framework I’ve recently come across that I think I may have fallen in love with due to its simplicity.

It’s called [ToroPHP][1] and is apparently the framework behind such websites as [convo.io][2] and [Gravity][3] and describes itself as:

> A tiny framework for PHP that lets you prototype web applications quickly.

Well, it does just that, I’ve I jumped at the chance to let it prove itself by using it for a website I currently have under wraps.

Toro is still a very young framework, and out of the box it doesn’t really have great support for templating.
It’s great having a framework do stuff, but you’re more than likely going to want to display something back to your users, no?
I then looked at templating solutions.

Smarty initially struck my mind, but I didn’t like its overhead.
I then came across the succinctly-named [“php-template”][4] project on [GitHub][5], which with its single file footprint and Smarty-like interface proved a good fit.
And here’s how I integrated it…

The first thing to set up is both the Toro framework and php-template.

```php
<?php

require_once 'includes/toro.php';
require_once 'includes/template.php';

define('TPL_PATH', dirname(__FILE__) . '/templates/');

$routes = [
    ['/', 'MainHandler'],
    // Additional routes here, i.e. ['about/', 'AboutHandler']
];

$tpl = new Template(TPL_PATH);

class MainHandler extends ToroHandler
{
    public function get()
    {
        // Put home page stuff here
    }
}

$site = new ToroApplication($routes);
$site->serve();

$tpl->display('layout.tpl.php');
```

This is how Toro tells you to set up a new application, but the problem we have is there is no template handling without the framework.
Let’s rectify this.

Toro works by setting up handlers (that extends a generic handler built into Toro) for each page or section of your website or web application.
Therefore, I decided to overload the `__construct()` method of the default Toro handler to set up the objects I needed.
Below shows how to use our template helper within a Toro application, but you can then use the same approach for database helpers, form helpers, and so on.

First we need to create a new handler we’ll use for our custom handlers:

```php
<?php

class MyToroHandler extends ToroHandler
{
    public $tpl;

    public function __construct()
    {
        global $tpl;

        $this->tpl = $tpl;
    }
}
```

Out of the box, the `__construct()` method of the default `ToroHandler` class is empty, so we can safely override it without having to import parent methods or whatever.
Above, I’ve very simply imported the global `$tpl` variable (containing a php-template instance) that is then assigned as a class property.
This means that we can now add to our php-template instance from extending classes.

We can now move on to creating our custom handlers for our website’s or application’s pages/sections.

```php
<?php

class MainHandler extends MyToroHandler
{
    public function get()
    {
        $this->tpl->set('title', 'My Home Page');
        $this->tpl->set('content', 'Welcome to my website!');
    }
}
```

There we go: a basic home page handler.
You should be able to see from above we’re extending our custom Toro handler, which sets up an instance of php-template.
In doing so, we can then access its methods as a class property.
When we’re finished, the fully rendered template will then be sent back to the visitor as (hopefully) a nice HTML page.

Hopefully this will give you a good starting point on utilising two great lightweight frameworks for quickly producing web sites and web applications.
For more information, check out the following resources:

* https://github.com/anandkunal/ToroPHP
* https://github.com/ianoxley/php-template

[1]: http://toroweb.org/
[2]: http://convo.io/
[3]: http://gravity.com/
[4]: https://github.com/ianoxley/php-template
[5]: https://github.com
