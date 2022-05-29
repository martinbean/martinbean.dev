---
excerpt: "Making use of one of Laravel’s most helpful features: the service container."
title: Binding Configured Services to Laravel’s Container
---
Laravel’s [service container][1] is one of its most helpful features.
It allows developers to type-hint dependencies in their classes, and automatically get a properly-configured class instance injected.
It’s therefore disheartening to not see developers take full advantage of it when working with third-party <abbr class="initialism" title="Application Programming Interface">API</abbr>s and <abbr class="initialism" title="Software Development Kit">SDK</abbr>s.

One common approach I see in Laravel applications is developers `new`-ing up instances of <abbr class="initialism" title="Software Development Kit">SDK</abbr>s like this:

```php
$client = new \Nexmo\Client(
    new \Nexmo\Client\Credentials\Basic(
        config('services.nexmo.key'),
        config('services.nexmo.secret')
    )
);
```

This is fine in one place, but this <abbr class="initialism" title="Software Development Kit">SDK</abbr> maybe instantiated in multiple places (controllers, console commands, jobs etc).

Instead, the <abbr class="initialism" title="Software Development Kit">SDK</abbr> could be added to the service container, so that when classes request an instance of `Nexmo\Client`, they get an instance with the credentials already configured.

Services are added to the service container in Laravel via [service providers][2].
Providers have two lifecycle methods: `register` and `boot`. The `register` method is where you should add bindings to the service container.
The `boot` method is for performing actions after _all_ service providers have registered their services.

Nexmo is a service, so it makes a perfect candidate for a service provider.
I tend to create service providers for all third-party libraries I’m working with (Nexmo, Facebook, Stripe etc). We can use [Artisan][3] to generate a new service provider class for us:

```sh
php artisan make:provider NexmoServiceProvider
```

This creates a file at **app/Providers/NexmoServiceProvider.php**.
We can remove the `boot` method, but we do need to flesh out the `register` method:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Nexmo\Client;
use Nexmo\Client\Credentials\Basic;

class NexmoServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(Client::class, function () {
            return new Client(
                new Basic(
                    $this->app['config']['services.nexmo.key'],
                    $this->app['config']['services.nexmo.secret']
                )
            );
        });
    }
}
```

Binding a singleton means that the first time `Nexmo\Client` is requested, a new instance is created, and any subsequent requests for `Nexmo\Client` yields the same instance instead of instantiating a new instance.

Next, we need our service provider to designate that it _provides_ the `Nexmo\Client` class. Add this method to the bottom of the class:

```php
public function provides()
{
    return [
        Client::class,
    ];
}
```

Finally, register the service provider by adding it to the `providers` array in your Laravel application’s **config/app.php** file:

```php
/**
 * Application Service Providers...
 */
// ...
App\Providers\NexmoServiceProvider::class,
```

Now you can type-hint `Nexmo\Client` in your classes, and begin using it straight away!

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Nexmo\Client as NexmoClient;

class SmsMessageController extends Controller
{
    protected $nexmo;

    public function __construct(NexmoClient $nexmo)
    {
        $this->nexmo = $nexmo;
    }

    public function store(Request $request)
    {
        $response = $this->nexmo->message()->send([
            'from' => config('services.nexmo.from'),
            'text' => $request->input('text'),
            'to' => $request->input('recipient'),
        ]);

        // Rest of your controller action...
    }
}
```

[1]: https://laravel.com/docs/master/container
[2]: https://laravel.com/docs/master/providers
[3]: https://laravel.com/docs/master/artisan
[4]: https://laravel.com/docs/master/billing
