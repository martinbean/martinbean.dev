---
excerpt: Need multiple user types in your Laravel application? Use roles instead of multiple user tables.
laravel_version: 9
layout: post
title: Simple role-based authentication in Laravel
---
A common thing I see in Laravel communities such as the [Laracasts discussion forums][1] is developers who want multiple user types in their application, decide to then create multiple “user” models and tables, and then find they have issues with things like authorisation. My advice in 99% of these scenarios is: don’t create multiple user models and tables. A user is a user. Use roles to determine what a user can and cannot do in your application.

Using roles can sound scary and complicated but it doesn’t have to be. It can be something as simple as a string with the name of a role (i.e. “admin” or “manager”). You can also easily add single role and multiple roles to users in your Laravel applications. Below are two simple approaches to both single roles and multiple roles.

## Single roles
If a user should only have a single role in your application then this is the most straightforward approach. You can add a `role` column to your `users` table, and then check the value of the column when you need to check a user’s role.

First, create a migration that adds the column to your `users` table:

### Migration
```
php artisan make:migration add_role_column_to_users_table --table=users
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('user', function (Blueprint $table) {
            $table->string('role')->nullable();
        });
    }

    public function down()
    {
        Schema::table('user', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
}
```

### Middleware
To then check the role, you can use middleware. We can use a [middleware parameter][2] to specify the role to check for. In fact, checking for a role is actually the example in the Laravel docs!

#### Create middleware
```
php artisan make:middleware EnsureUserHasRole
```

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if ($request->user()->role === $role) {
            return $next($request);
        }

        abort(403);
    }
}
```

{% capture tip_content %}
Any time you’re dealing with a `Request` object you can get the authenticated user without resorting to the `Auth` facade or `auth()->user()` helper. Just call `$request->user()` and that will return the authenticated user. You can do this in controllers as well.
{% endcapture %}
{% include tip.html content=tip_content %}

#### Register the middleware
Because the middleware class has a parameter, we’ll need to register it in your **app/Http/Kernel.php** file:

```php
protected $routeMiddleware = [
    'role' => \App\Http\Middleware\EnsureUserHasRole::class,
    // Other route middleware...
];
```

You can then apply the middleware to a route or a route group:
```php
Route::middleware(['auth', 'role:admin'])->group(function () {
    // User is authentication and has admin role
});
```

Be sure to include the `auth` middleware before the `role` middleware so that the user is authenticated. The user will need to be authenticated first before the `role` middleware can check the user’s role.

## Multiple roles
If in your application users can have multiple roles, rather than a single role, then you’ll need to extend your models a bit.

One approach is to create a `Role` model that contains the name of roles, and then define a many-to-many relationship between your `Role` and `User` models.

### Models and migrations
First, create the `Role` model and its corresponding migration:

```
php artisan make:model Role -m
```

Then fill out the role table migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('roles');
    }
}
```

Now create a pivot table to link roles to users. Following Laravel’s naming conventions, the table would be named `role_user`:

```
php artisan make:migration create_role_user_table --create=role_user
```
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('role_user', function (Blueprint $table) {
            $table->primary(['role_id', 'user_id']);
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('role_user');
    }
}
```

You can now set up the corresponding relationships in the two models:

```php
class Role extends Model
{
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
```
```php
class User extends Authenticatable
{
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
```

### Middleware
This will make the middleware more complicated though, as we now have to query a relation, rather than simply read the value of a column. But the process is the same: check for a role and alow the request if the user _does_ have the role, or return a `403 Forbidden` error response if they do not.

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if ($request->user()->roles()->where('name', '=', $role)->exists()) {
            return $next($request);
        }

        abort(403);
    }
}
```

The usage is exactly the sample (add `role:foo` to a route or route group), but it will now query the roles relation instead.

## Conclusion
So, next time you’re dealing with an application with multiple user types, consider using roles instead of splitting your users across multiple models and tables. It’ll make users in your application much easier to deal with!

There are, of course, _some_ scenarios where users may need to be segregated for legal or regulatory reasons, but for 99% of cases where you just want different “types”, the above will suffice.

[1]: https://laracasts.com/discuss
[2]: https://laravel.com/docs/8.x/middleware#middleware-parameters
