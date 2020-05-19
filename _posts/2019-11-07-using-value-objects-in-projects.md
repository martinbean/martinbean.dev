---
excerpt: Using value objects to give meaning to primitives in your projects.
title: Using Value Objects to Give Meaning
---
I’m currently re-building a video on demand platform I operate, [Your Fight Site VOD][1].
During the build, I’ve found myself using more and more _value objects_.

If you’re unfamiliar with value objects, they’re simply objects that represent simple things, but not _specific_ things.
An object representing a specific thing would be an entity.
These two terms are usually found when discussing _Domain-driven design_ or “DDD”).

An example highlighting the difference between a value object and an entity can be found in money.
For example, if I had £10 and you had £10, then those two monetary _values_ would be equal.
However, individual bank notes are numbered; we can’t have the same bank note, so individual notes would be represented as _entities_ (and probably use their serial numbers as their identifiers).

## Value objects for single properties
In my application, I’ve been unearthing values that can be elevated from simple, primitive values to a value object.
One is a video’s duration.
I store this as a simple integer (representing the number of seconds), but this presented the opportunity to create a `Duration` object.
Now that number (i.e. 3,600) has **meaning**. The class looks like this:

```php
class Duration
{
    private $seconds;

    public function __construct(int $seconds)
    {
        $this->seconds = $seconds;
    }

    public function asMinutes(): int
    {
        return (int) floor($this->seconds / 60);
    }

    public function asTimeString(): string
    {
        return Carbon::today()->addSeconds($this->seconds)->toTimeString();
    }

    public function __toString()
    {
        return (string) $this->seconds;
    }
}
```

The class is instantiated with an integer value (and can’t be created with any other value).
As it’s a class, I can then define methods for common operations, such as getting different representations of the value (i.e. as minutes, or as a HH:MM:SS-formatted time string).

I’ve also defined as `__toString()` method. This is so I can use it in [Eloquent][2] models.
I can add a [mutator][3] for my `duration` attribute to instead return this new value object:

```php
class Video extends Model
{
    public function getDurationAttribute($value): ?Duration
    {
        if ($value > 0) {
            return new Duration($value);
        }

        return null;
    }
}
```

Now when I call `$video->duration`, I’ll get a `Duration` instance (if the duration is greater than zero).
If I use this attribute in a [Blade][4] template, then it’ll just be cast to a string and the original value presented thanks to the `__toString()` method:

```html
{% raw %}<p>Duration: {{ $video->duration }}</p>{% endraw %}
```

## Value objects for multiple properties
In my application, a video can also be rented and streamed for a predetermined length of time and amount.
This time and amount is set by the content owner.
I have three properties representing this:

* `rental_amount`
* `rental_interval`
* `rental_interval_count`

Their names are influenced by [Stripe’s `plan` object][5].

* `rental_amount` is an integer, representing the price in pence.
* `rental_interval` is a constant; one of day, week, month, or year.
* `rental_interval_count` is the number of days/weeks/months/years a customer can rent the video.

Together, these make up what I’ve called the _rental terms_. I’ve therefore created a class that takes the values of these three properties:

```php
class RentalTerms
{
    private $amount;
    private $interval;
    private $intervalCount;

    public function __construct(int $amount, string $interval, int $intervalCount)
    {
        $this->ensureIntervalIsValid($interval);

        $this->amount = $amount;
        $this->interval = $interval;
        $this->intervalCount = $intervalCount;
    }

    public function getAmountFormatted(): string
    {
        return Cashier::formatAmount($this->amount);
    }

    public function getIntervalFormatted(): string
    {
        switch ($this->interval) {
            case 'day':
                return trans_choice('1 day|:count days', $this->intervalCount);
            case 'week':
                return trans_choice('1 week|:count weeks', $this->intervalCount);
            case 'month':
                return trans_choice('1 month|:count months', $this->intervalCount);
            case 'year':
                return trans_choice('1 year|:count years', $this->intervalCount);
        }
    }

    private function ensureIntervalIsValid(string $value): void
    {
        if (! in_array($value, ['day', 'week', 'month', 'year'])) {
            throw new InvalidArgumentException('Interval is invalid');
        }
    }
}
```

As this class doesn’t map to a single value, I just added a “getter” to my `Video` class:

```php
class Video extends Model
{
    public function getRentalTerms(): RentalTerms
    {
        return new RentalTerms(
            $this->rental_amount,
            $this->rental_interval,
            $this->rental_interval_count
        );
    }
}
```

Again, I can use methods on the object to get the rental terms in a variety of helpful formats throughout the application, and in Blade templates:

```html
<!-- Example: Rent for £3.99 for 1 month -->
{% raw %}<p>
  Rent for {{ $terms->getAmountFormatted() }}
  for {{ $terms->getIntervalFormatted() }}
</p>{% endraw %}
```

Hopefully this gives you some ideas if you’ve not used value objects in your projects before!

[1]: https://vod.yourfightsite.com/?utm_source=martinbean&utm_medium=website&utm_campaign=post
[2]: https://laravel.com/docs/master/eloquent
[3]: https://laravel.com/docs/master/eloquent-mutators#defining-a-mutator
[4]: https://laravel.com/docs/master/blade
[5]: https://stripe.com/docs/api/plans/object
