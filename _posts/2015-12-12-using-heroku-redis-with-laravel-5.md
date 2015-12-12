---
excerpt: How to set up a Laravel 5 application on Heroku using Heroku’s Redis add-on.
layout: post
title: Using Heroku Redis with Laravel 5
---
<p class="lead">Recently, I moved a Laravel 5 application to <a href="https://heroku.com/" rel="external">Heroku</a>.
  The application’s previous host allowed access to the file system but Heroku uses an “ephemeral” file system, making it unsuitable for storing sessions, cache data etc.</p>

With no access to the file system, it means an alternative solution is needed to store this data on Heroku.
In the end, I settled on Redis using Heroku’s own add-on.

Laravel almost supports Redis out of the box.
It can be configured in the database configuration file, but you first need to install the Redis PHP client via Composer:

```
$ composer require predis/predis
```

If you open Laravel’s database configuration file at **config/database.php** and scroll to the bottom, you’ll see a section with the `redis` key.
Depending on the version of Laravel you’re using, the values will either be hard-coded or fetched from environment variables.
To use Redis with Laravel on Heroku, we need to use environment variables, so re-write the Redis block to look like this if it doesn’t already:

```php
'redis' => [

    'cluster' => false,

    'default' => [
        'host' => env('REDIS_HOST'),
        'port' => env('REDIS_PORT'),
        'password' => env('REDIS_PASSWORD'),
        'database' => 0,
    ],

],
```

If you haven’t already, add the [Heroku Redis][2] add-on to your Heroku application.
Choose the plan that is most appropriate for your application size.

Once installed, you’ll notice your Heroku application has a new environment variable: `REDIS_URL`.
Unfortunately, this isn’t what Laravel is expecting.

Back in **database.php**, at the top of the file, before the config array is opened, we need to do a little bit of logic to parse the Redis configuration <abbr class="initialism" title="Uniform Resource Locator">URL</abbr> into the environment variables Laravel is expecting.
Add the following _after_ the opening `<?php` tag, and _before_ the array is opened:

```php
<?php

if (getenv('REDIS_URL')) {
    $url = parse_url(getenv('REDIS_URL'));

    putenv('REDIS_HOST='.$url['host']);
    putenv('REDIS_PORT='.$url['port']);
    putenv('REDIS_PASSWORD='.$url['pass']);
}
```

This checks if `REDIS_URL` is defined as an environment variable and if so, parses the URL and places the relevant components into new environment variables.

Once committed and deployed, your Laravel application will be able to connect to Redis, which you can use as your session and/or cache driver, or for any other ad hoc needs.

[1]: https://heroku.com/
[2]: https://elements.heroku.com/addons/heroku-redis
