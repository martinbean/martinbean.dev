---
excerpt: How to protect Eloquent models in your Laravel application from being updated or deleted.
title: Protect Eloquent Models From Being Updated or Deleted
---
Some times in applications, you define models that are meant to be created only and never updated nor deleted.
Things like audit logs, balance adjustments, etc.
Once created, these models should exist and never be altered or discarded.

I faced this scenario in an application recently. I had `Charge` and `Refund` models.
Similar to Stripe’s entities of the same name, a charge could be created but should then never be updated and deleted (and the same with refunds).
The reason being: these models are related to _accounting_.
We should never change accounting entries once written!

To stop instances of these models from being updated or deleted, I created some traits that I can apply to my models. They look like this:

```php
namespace App\Concerns;

trait CannotBeDeleted
{
    final public function delete()
    {
        throw new \RuntimeException('Model cannot be deleted.');
    }
}
```
```php
namespace App\Concerns;

trait CannotBeUpdated
{
    final public function update(array $attributes = [], array $options = [])
    {
        throw new \RuntimeException('Model cannot be updated.');
    }

    final protected function performUpdate(Builder $query)
    {
        throw new \RuntimeException('Model cannot be updated.');
    }
}
```

When applied to an Eloquent model…

```php
namespace App\Billing;

use App\Concerns\CannotBeDeleted;
use App\Concerns\CannotBeUpdated;
use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    use CannotBeDeleted, CannotBeUpdated;
}
```

…they override Eloquent’s methods for deleting and updating.
Overriding the `performUpdate()` method means it’ll also catch any attempts to update instances using `save()` calls.

It’s also possible to combine these traits in a third trait:

```php
namespace App\Concerns;

trait CanOnlyBeCreated
{
    use CannotBeDeleted, CannotBeUpdated;
}
```

This means you only need to apply a single trait to your model if you wish:

```php
namespace App\Billing;

use App\Concerns\CanOnlyBeCreated;
use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    use CanOnlyBeCreated;
}
```

Let me know what you think of this approach or if you have your own, alternative solution to this problem.
