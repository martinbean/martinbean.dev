---
excerpt: How to install and use Homestead on a per-project basis with Laravel applications.
layout: post
title: Using Homestead on a per-project basis
---
A lot of developers use [Homestead](https://laravel.com/docs/master/homestead) when working on [Laravel](https://laravel.com/)-based projects.
But the default approach seems to be to install Homestead globally and use it as a replacement for something like [MAMP](https://www.mamp.info/), and serve _all_ of your Laravel projects through a single instance.
This approach has some drawbacks, which can be mitigated by using Homestead on a per-project basis instead.

## What is Homestead?

Homestead is a pre-built virtual machine image, tailored for Laravel projects.
When launched via [VirtualBox](http://www.virtualbox.org/), it acts a computer within your computer, meaning any software installed to isn’t installed on your actual computer.
These virtual machines can then be booted, shut down, and also quickly created and destroyed.

Homestead is an [Ubuntu](http://www.ubuntu.com/)-based virtual machine and comes with all the software pre-installed you’d need to run 99% of Laravel applications:
[nginx](https://www.nginx.com/), [PHP](http://www.php.net/), [MySQL](https://www.mysql.com/), [PostgreSQL](https://www.postgresql.org/), [Node.js](https://nodejs.org/) and much, much more.

## Why install on a per-project basis?

Homestead is configured using a [YAML](http://yaml.org/) file.
This YAML file tells Homestead where to find sites’ files on your computer, databases to create, and so on.
When you start a new project, you have to add an entry to this file and re-provision.

When using Homestead on a per-project basis, you keep this file with your project and it contains only that project’s settings.
That means you can quickly clone a project if it’s under source control (and it should be), and quickly boot a Homestead instance for that project.
This is especially helpful when setting an existing project up on a new computer, as you don’t need to manually set up Homestead and configure it for your project.

## Getting started

If you have a new or existing Laravel project, adding Homestead to it is the same.
Homestead is installed as a [Composer](https://getcomposer.org/) dependency, so run the following command:

```
$ composer require laravel/homestead --dev
```

Once installed, you need to initialise some files Homestead will require:

```
$ php vendor/bin/homestead make
```

This will create an **Homestead.yaml** file, where you configure your Homestead instance.

There are a handful of options you can specify with the `make` command:

* `--name` to name the virtual machine
* `--hostname` to set the hostname for the virtual machine
* `--ip` to set the IP address to reference the virtual machine
* `--after` to generate a Shell script that’s ran during provisioning
* `--aliases` to add some helpful aliases
* `--example` to create a “blueprint” **Homestead.yaml.exmaple** file

I’d suggest _always_ including the `--example` option, so that people cloning your project can quickly copy that file, similar to how Laravel includes a **.env.example** file.

It’s always good to specify as many of the other options as you can, too.
I always set `--name` to a “slugged” version of my project’s name.
I also always add the `--after` and `--aliases` options.
The **after.sh** file is a great place to install Composer dependencies, migrate, and run any seeds:

```bash
#!/bin/sh

cd src
composer install --no-progress
php artisan migrate --seed

# Do any other provisioning unique to your application
```

The `--ip` options lets you set an IP address for the machine, so that you can add custom host names.
It’ll be set to `192.168.10.10` by default.

After you have filled out your application’s settings in your **Homestead.yaml** file, you can boot Homestead.
This is the same command as if you had it installed globally:

```
$ vagrant up
```

Like a globally-installed Homestead instance it will read your **Homestead.yaml** file, configure the machine, and provision it.
Once provisioned, you can access it via SSH:

```
vagrant ssh
```

## Working with Homestead on other machines

Once you’ve committed the newly-created files to your source control repository, you can use it on other machines.
However, it does come with the caveat that the new machine must have Composer installed.

After cloning your project, copy **Homestead.yaml.example** to **Homestead.yaml**, and amend any settings for your new environment.
The only setting that should really need to be changed is in the `sites` block, and specifying the path to the project on your machine.

There is also the caveat that you must have Composer installed on this machine.
As Homestead is a Composer dependency, you need to have Homestead installed before you can use it.
If you tried to run `vagrant up` you would get the following error message:

```
There was an error loading a Vagrantfile. The file being loaded
and the error message are shown below. This is usually caused by
a syntax error.

Path: /path/to/project/root/Vagrantfile
Line number: 12
Message: LoadError: cannot load such file -- /path/to/project/root/vendor/laravel/homestead/scripts/homestead.rb
```

To remedy this, [install Composer](https://getcomposer.org/doc/00-intro.md) on your machine and then install your dependencies:

```
$ composer install
```

With the Homestead package installed, you can now run `vagrant up`.

## Conclusion

It would be nice if Homestead could be used on a per project basis like this _without_ having to install Composer and dependencies first.
The ideal approach would be to clone a project and be able to run `vagrant up` immediately.
However, bundling your Homestead configuration with the project it’s serving makes life a little easier.

Although I’m currently investigating [Docker](https://www.docker.com/) in my [day job](https://www.thelawsuperstore.co.uk/),
I’ll still be using Homestead in this fashion for other projects for the immediate future.
Each project has different requirements, and there is no “one size fits all” when it comes to serving them.
For me, Homestead nicely fills the gap between “quick and easy” (something like MAMP or [Valet](https://laravel.com/docs/master/valet), another Laravel offering) and Docker.
