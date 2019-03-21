---
excerpt: How to add a command bus to Laravel applications without installing any packages.
title: Command Bus in Laravel
---
Laravel 5.0 was released in early 2015. It was a radical departure from Laravel
4 (so much so, Laravel 5.0 was originally Laravel 4.3, but “bumped” the version
when it became much more than a “minor” update).

One of the features introduced in Laravel 5.0 was a command bus
([laravel.com/docs/5.0/bus][1]), but by version 5.1 it disappeared, instead
supplanted by queued jobs. Except it didn’t.

“Jobs” in Laravel 5.1+ is merely a name change. The command bus component still
exists under the hood in Laravel and is what jobs use to dispatch themselves.
When you create and dispatch a synchronous (non-queued) job, you’re essentially
dispatching a self-handling command. Laravel by default assumes jobs are
self-handling, but it is possible to separate a “command” and its handler in
separate classes if you prefer.

## Creating a command and handler class
[Laravel’s queues documentation][2] seems to use a “process podcast” example
throughout, so I’ll stick with that.

### Command class
The command class for processing a podcast doesn’t look too different to the job
example in the queues documentation; it just doesn’t have a `handle()` method:

```php
<?php

namespace App\Commands;

use App\Podcast;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessPodcast
{
    use Dispatchable;

    public $podcast;

    public function __construct(Podcast $podcast)
    {
        $this->podcast = $podcast;
    }
}
```

We define the class and pass it parameters (which are then stored on the object
as public properties). Because dependencies are type-hinted, the command class
almost acts as a [data transfer object][3] (DTO): you’ll only be able to
instantiate the command class if you pass valid arguments to it.

We’ve removed the queue-related trait and interface as we want commands to be
handled synchronously (immediately, rather than queued) but have kept the
`Dispatchable` trait for convenience.

### Handler class
The handler class would be where you would implement your `handle()` method:

```php
<?php

namespace App\Handlers\Commands;

use App\AudioProcessor;
use App\Commands\ProcessPodcast;

class ProcessPodcastHandler
{
    protected $processor;

    public function __construct(AudioProcessor $processor)
    {
        $this->processor = $processor;
    }

    public function handle(ProcessPodcast $command)
    {
        $this->processor->process($command->podcast);
    }
}
```

Note: some things _do_ change when implementing your handler in a separate class
like this, though.

The `handle()` method now receives a single argument: the command class. In the
Laravel documentation for queues, it says:

<blockquote class="blockquote"><p class="mb-0">The <code>handle</code> method is
called when the job is processed by the queue. Note that we are able to
type-hint dependencies on the <code>handle</code> method of the job. The Laravel
service container automatically injects these dependencies.</p></blockquote>

This is no longer the case in a command handler class now that the `handle()`
method instead receives the command. Handler classes are resolved by the service
container though, so you can just inject dependencies in its constructor instead
like we have done with the `AudioProcessor` class.

Finally, inside the handler’s `handle()` method, we use the processor instead we
injected in the handler’s constructor to process the podcast passed in via the
command class.

## Mapping commands to handlers
If you try and dispatch the `ProcessPodcast` command now it won’t work, as we
have not told Laravel how to handle it. To do this, we have to define a mapping.
A good place to do this is in a service provider.

If you have a small number of commands, you can define all of your command and
handler mappings in a single service provider:

```php
<?php

namespace App\Providers;

use App\Commands\ProcessPodcast;
use App\Handlers\Commands\ProcessPodcastHandler;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\ServiceProvider;

class BusServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Bus::map([
            ProcessPodcast::class => ProcessPodcastHandler::class,
        ]);
    }
}
```

If you have a larger application and you have multiple service providers for
components or modules in your application, then you can call `Bus::map()` in
each of those service providers to add mapping’s for that particular module’s
commands and handlers:

```php
<?php

namespace App\Domain\Podcasts;

use App\Domain\Podcasts\Commands\ProcessPodcast;
use App\Domain\Podcasts\Handlers\Commands\ProcessPodcastHandler;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\ServiceProvider;

class PodcastServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->registerCommandHandlers();
    }

    private function registerCommandHandlers()
    {
        Bus::map([
            ProcessPodcast::class => ProcessPodcastHandler::class,
        ]);
    }
}
```

## Dispatching commands
Now that you have created your command and handler classes, and mapped them to
each other, you can dispatch them from controllers, console commands etc:

```php
<?php

namespace App\Http\Controllers;

use App\Commands\ProcessPodcast;
use App\Http\Requests\StorePodcastRequest;
use App\Podcast;

class PodcastController extends Controller
{
    public function store(StorePodcastRequest $request)
    {
        $podcast = Podcast::create($request->validated());

        // Dispatch the command to its handler
        ProcessPodcast::dispatch($podcast);
    }
}
```

## Summary
So in closing, it _is_ possible to have a command bus out of the box in Laravel
without having to install any third-party packages or write additional code.
The process is:

* Create a job class, but remove the `handle()` method and queuing support.
* Create a corresponding handler class.
* Create a mapping for your new command and handler classes.
* Dispatch the job and it will be handled synchronously.

## Bonus: Pipelines
One additional feature of the bus component is that it has a notion of a
“pipeline”. Pipelines can be thought of as middleware for commands, and each
pipeline class in fact has a similar signature to a middleware class.

Pipelines can be defined anywhere in your application but again, it makes sense
to define them in a service provider class:

```php
<?php

namespace App\Providers;

use App\Bus\LogCommand;
use App\Bus\UseDatabaseTransactions;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\ServiceProvider;

class BusServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Bus::pipeThrough([
            LogCommand::class,
            UseDatabaseTransactions::class,
        ]);
    }
}
```

A pipeline class has a `handle()` method that takes the command and the next
class in the pipeline as its arguments:

```php
<?php

namespace App\Bus;

use Closure;
use Illuminate\Support\Facades\DB;

class UseDatabaseTransactions
{
    public function handle($command, Closure $next)
    {
        return DB::transaction(function () use ($command, $next) {
            return $next($command);
        });
    }
}
```

Again, pipeline classes are resolved by Laravel’s service container so you can
type-hint any dependencies in their constructors:

```php
<?php

namespace App\Bus;

use Closure;
use Psr\Log\LoggerInterface;

class LogCommand
{
    protected $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function handle($command, Closure $next)
    {
        $result = $next($command);

        $this->logger->debug('Command handled: '.get_class($command));

        return $result;
    }
}
```

[1]: https://laravel.com/docs/5.0/bus
[2]: https://laravel.com/docs/master/queues
[3]: https://en.wikipedia.org/wiki/Data_transfer_object
