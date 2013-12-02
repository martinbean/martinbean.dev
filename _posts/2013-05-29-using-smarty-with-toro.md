---
layout: post
meta_description: A tutorial on implementing the Smarty template engine into a ToroPHP app.
title: Using Smarty with Toro
---
[ToroPHP](https://github.com/anandkunal/ToroPHP/) is a small open source project I contribute to.
One of the issues opened recently asked how to use the [Smarty](http://www.smarty.net/) template engine with Toro.

## Download Smarty and Toro

The first step is to download both Smarty and Toro from their respective websites.
Also make sure you create a **.htaccess** file as per Toro’s recommendation.

Once you’ve downloaded both libraries, create an **index.php** file and include both libraries.

## Create a default route

In your **index.php**, set up Toro with a default route:

{% highlight php %}
<?php
require('/path/to/Toro.php');
require('/path/to/Smarty.class.php');

Toro::serve(array(
    '/' => 'HomeHandler'
));
{% endhighlight %}

## Creating the home handler

The above will look for a class called `HomeHandler`.
Create this class and then include it in your **index.php** file after Toro and Smarty.

Your handler class should look like this:

{% highlight php %}
<?php
class HomeHandler
{
    public function get()
    {
        // TODO
    }
}
{% endhighlight %}

## Creating a view handler

I like to wrap my view logic into a class that I can then include in my handlers in Toro projects.
The class is simple, and has a signature that looks a little like this:

{% highlight php %}
<?php
class View
{
    protected $templateEngine;
    protected $templateExtension;

    public function __construct() {}
    public function assign($key, $value) {}
    public function display($templateName) {}
}
{% endhighlight %}

The theory is, I can change my template engine from Smarty to say, Twig, without having to re-write any view logic in my handlers.

## Fleshing out the view handler

First, let’s flesh out the constructor. Here I’ll set up Smarty and any configuration variables.

{% highlight php %}
public function __construct()
{
    $this->templateEngine = new Smarty();
    $this->templateEngine->setTemplateDir('/path/to/templates');
}
{% endhighlight %}

Next, the `assign` method is where you would set template data.
This can just act as a wrapper for Smarty’s own `assign` method, as no other processing is needed:

{% highlight php %}
public function assign($key, $value)
{
    $this->templateEngine->assign($key, $value);
}
{% endhighlight %}

The final step is to flesh out the `display` method, which would give us a compiled template back.

{% highlight php %}
public function display($templateName)
{
    $this->templateEngine->display($templateName . $this->templateExtension);
}
{% endhighlight %}

Again, it just wraps Smarty’s method of the same name in this instance.

## Setting a template extension

The final step is to set the template extension.
Simply replace `protected $templateExtension;` with `protected $templateExtension = '.tpl';` at the top of the `View` class.

## Using our view handler

To use your view handler, you will need to include the class in your **index.php** file.
After that, using it in your handlers is as simple as:

{% highlight php %}
<?php
class HomeHandler
{
    public function get()
    {
        $view = new View();
        $view->assign('title', 'Home');
        $view->display('home');
    }
}
{% endhighlight %}

## Conclusion

This is just a simple starter to show you have to approach this problem, and by no means the “official” way to add templating to Toro.
There are many improvements that could be made, such as initializing the View file and injecting the template engine in a bootstrap file, and not directly within the View class itself.

If you have added templating to Toro then I’d love to hear from you and how you approached it.