---
excerpt: "Improving Laravel 5’s registrar service by re-factoring from façades."
layout: post
nav: blog
title: "Improving Laravel 5’s registrar service"
---
<p class="alert alert-info">
  <span class="fa fa-info-circle"></span>
  This article is relevant to Laravel 5.0.x only.
</p>

<p class="lead">Comparing Laravel 5 to Laravel 4, there seems to have been a move from façades in the former, to programming to contracts in the latter.
The majority of the code in the new Laravel application skeleton follows this approach, but there are places where it doesn’t and still uses façades.</p>

When you create a new Laravel 5 application, you get everything you need to authenticate users out of the box.
It’s no longer opt-in; everything is provided: a controller to register users and then log them in, reset passwords, a model, and migrations.
The way it registers users is via a **service class**, called `Registrar`, which you can find at **app/Services/Registrar.php**.

In a fresh Laravel 5 installation, the Registrar class looks like this:

```php
<?php namespace App\Services;

use App\User;
use Validator;
use Illuminate\Contracts\Auth\Registrar as RegistrarContract;

class Registrar implements RegistrarContract {

	/**
	 * Get a validator for an incoming registration request.
	 *
	 * @param  array  $data
	 * @return \Illuminate\Contracts\Validation\Validator
	 */
	public function validator(array $data)
	{
		return Validator::make($data, [
			'name' => 'required|max:255',
			'email' => 'required|email|max:255|unique:users',
			'password' => 'required|confirmed|min:6',
		]);
	}

	/**
	 * Create a new user instance after a valid registration.
	 *
	 * @param  array  $data
	 * @return User
	 */
	public function create(array $data)
	{
		return User::create([
			'name' => $data['name'],
			'email' => $data['email'],
			'password' => bcrypt($data['password']),
		]);
	}

}
```

Immediately we can see a façade (`Validator`) and a method being accessed statically on the `User` model.
There’s also a global function `bcrypt` (a helper provided by Laravel) called.
These are dependencies of the class, so we can clean it up by instead injecting them.

Classes resolved by Laravel’s service container have their dependencies injected automatically.
This is achieved by type-hinting the dependencies in the class’s constructor.
Using reflection, the service container reads them and injects a suitable implementation if one has been registered.
Controllers are no exception to this.

If we look at the constructor of the [`AuthController`][0], we can see the `Registrar` class is type-hinted as a dependecy.
Well, in Laravel’s service container, not only are classes’ dependencies resolved, but so are *those* classes’ dependencies.
We can therefore use this to inject the dependencies into the `Registrar` class.

Above we identified three dependencies:

1. The validation service
2. The user model
3. The `bcrypt` helper

## The User model dependency

We need to do some work with the user model before we can use it in our service class.
What we will do is create an interface, apply it to the model, and bind the model to the interface in Laravel’s service container.
First, create a new file called **app/Contracts/User.php** and add the following:

```php
<?php namespace App\Contracts;

interface UserRepository {

	//

}
```

This interface has no implementation details; we’re just going to use it to type-hint on.

In your `User` model class, underneath the namespace import the interface:

```php
use App\Contracts\UserRepository as UserRepositoryContract;
```

And then implement it in the class itself:

```php
class User extends Model implements AuthenticatableContract, CanResetPasswordContract, UserRepositoryContract {
```

A lot of people advocate the use of the repository pattern in Laravel applications, but I find it overkill unless you’re developing large, ambitious applications.
For simple, CRUD-like applications, I find this “pseudo” repository approach sufficient.

## The Validator dependency

If we look at the [façade class reference][1] page on the Laravel docs, we can see the `Validator` façade is actually an instance of `Illuminate\Validation\Factory`.
But we want to type-hint on an interface, not an implementation.
Looking at the code for that class, we can see it implements an interface called `Illuminate\Contracts\Validation\Factory`, so that’s what we’ll type-hint on.

## The `bcrypt` dependency

Our final dependency is the `bcrypt` helper, which lives in [this file][3].
Looking at the function, we can see it calls `hash` from the service container, and then the `make` method on that object.
Referring back to the façade class reference, we find `hash` is bound to `Illuminate\Contracts\Hashing\Hasher`.
Perfect, an interface! We now have the three interfaces we need to add to the `Registrar` constructor.

## Adding the constructor

Open the `Registrar` class and create a constructor like this:

```php
public function __construct(ValidationFactory $validation, UserRepository $users, Hasher $hasher)
{
	$this->validator = $validator;
	$this->users = $users;
	$this->hasher = $hasher;
}
```

Also add the properties to the top of the file for transparency:

```php
protected $validator;
protected $users;
protected $hasher;
```

And finally import the namespaces:

```php
use App\Contracts\UserRepository;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Contracts\Hashing\Hasher;
```

We’re not using the `Validator` façade any more, so remove the line that reads:

```php
use Validator;
```

## Re-factoring the `validator` method

We can now re-factor out the façade usage in the `validator` method.
Replace `return Validator::make` with `return $this->validator->make`. Done!

## Re-factoring the `create` method

Instead of calling the `create` method on the `User` model statically, we now use our class property instead.
Replace `return User::create` with `return $this->users->create`.

We can also take out that call to the global `bcrypt` function.
Instead, use `$this->hasher->make($data['password'])`.

## Done!

And with that, we’re done!
Our `Registrar` class now explicity declares the dependencies it requires to operate, and they are injected via Laravel’s service container.
With the dependencies being injected in the constructor, this class can now be used elsewhere, even in non-Laravel scenarios.

You can see the completed `Registrar` class with the improvements above here:
[https://gist.github.com/martinbean/3d87c6fecbb267f887cd][4].
Let me know your thoughts.

[0]: https://github.com/laravel/laravel/blob/master/app/Http/Controllers/Auth/AuthController.php
[1]: http://laravel.com/docs/master/facades#facade-class-reference
[2]: https://github.com/laravel/framework/blob/5.0/src/Illuminate/Validation/Factory.php
[3]: https://github.com/laravel/framework/blob/5.0/src/Illuminate/Foundation/helpers.php
[4]: https://gist.github.com/martinbean/3d87c6fecbb267f887cd
