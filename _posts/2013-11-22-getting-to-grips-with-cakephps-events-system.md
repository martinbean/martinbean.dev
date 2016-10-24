---
excerpt: Demystifying the events system in CakePHP 2.
layout: post
title: Getting to grips with CakePHP’s events system
---
<p class="alert alert-info">
  <span class="fa fa-info-circle"></span>
  This article was written about CakePHP 2.x and has been untested with CakePHP 3.x
</p>

<p class="lead"><a href="http://cakephp.org/" rel="external">CakePHP</a> seems to get a slightly unfavourable reputation when compared to the likes of <a href="http://symfony.com/" rel="external">Symfony</a> or <a href="http://framework.zend.com/" rel="external">Zend Framework</a> due to its lack of namespaces and not playing nicely with <a href="http://getcomposer.org/" rel="external">Composer</a> out of the box.
However, that will change in the forthcoming version 3; and CakePHP 2 still remains a pretty easy PHP framework to work with and quickly build web applications with.

A design pattern that is pretty common in <abbr class="initialism" title="Model-View-Controller">MVC</abbr> applications is the [Observer pattern](http://en.wikipedia.org/wiki/Observer_pattern), colloquially known as event handlers.
From the Wikipedia entry, it’s defined as:

>  The observer pattern is a software design pattern in which an object, called the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes, usually by calling one of their methods.

So plainly put: when something changes in your application, you can have code somewhere else that does something too.
This makes for a better separation of concerns and more modular code that’s easier to maintain.

## The events system in CakePHP

CakePHP comes with a built-in events system but it’s poorly documentated, and not the most straightforward of things based on the number of questions on [Stack Overflow](http://stackoverflow.com/) surrounding it.
CakePHP’s implementation follows the traditional Observer pattern set-up pretty closely:

* There are *subjects*, which may be a model or a controller
* Subjects raise *events*
* An *observer* (or *listener*) is “attached” to *subjects* and “listens” for *events* to be raised

So let’s think of a scenario…

## The scenario

A website that accepts user registrations.
When a user registers an account is created for them, but is initially inactive.
A user has to activate their account by clicking a link in an email.

One approach would be just to put the code that sends the activation email in the `User` model itself:

{% highlight php %}
<?php
class User extends AppModel {

    public function afterSave($created, $options = array()) {
        if ($created) {
            $email = new CakeEmail();
            $email->to($this->data[$this->alias]['email']);
            $email->from(array(
                'noreply@example.com' => 'Your Site'
            ));
            $email->subject('Activate your account');
            $email->format('text');
            $email->template('new_user');
            $email->viewVars(array(
                'user' => $this->data[$this->alias]
            ));
            $email->send();
        }
    }
}
{% endhighlight %}

But this is mixing concerns.
We don’t want the code that sends the activation email in our `User` model.
The model should just deal with retrieving, saving, and deleting `User` records.

So what can we do?
We can implement the Observer pattern.

## Raising events

First we can remove the email sending code from our `afterSave()` callback method, and instead raise an event:

{% highlight php %}
<?php
App::uses('CakeEvent', 'Event');

class User extends AppModel {

    public function afterSave($created, $options = array()) {
        if ($created) {
            $event = new CakeEvent('Model.User.created', $this, array(
                'id' => $this->id,
                'data' => $this->data[$this->alias]
            ));
            $this->getEventManager()->dispatch($event);
        }
    }
}
{% endhighlight %}

As you can see, our `afterSave()` method is now much leaner.

Also note the `App::uses()` statement added to the top of the file, to make sure the `CakeEvent` class is imported.
We’re creating an instance of the `CakeEvent` event class, passing it an event name ("`Model.User.created`"), a subject (`$this`), and some data associated with this event.
We want to pass the newly-created record’s ID, and the data of this record.

With event names in CakePHP, it’s recommended to use pseudo name-spacing.
In the above example, the first portion is the tier (`Model`), the second portion is the object within that tier (`User`), and the third portion is a description name of the event (`created`).
So we know from the event name that it’s when a new user record is created.

## Creating a listener

Now we have events being raised, we need code to listen for them.

The first step is to create code to do something when an event is raised.
This is where CakePHP’s documentation starts getting hazy.
It provides sample code, but it doesn’t tell you where to actually put it.
I personally created an **Event** directory at the same level as **Config**, **Controller**, **Model** etc.
I then name my class after what it’s doing.
For this handler, I’m going to call it `UserListener` and save it as **UserListener.php**.

Event listeners in CakePHP implement the `CakeEventListener` interface, and as a result need to implement one method called `implementedEvents()`.
The skeleton code for the listener class then looks like this:

{% highlight php %}
<?php
App::uses('CakeEventListener', 'Event');

class UserListener implements CakeEventListener {

    public function implementedEvents() {
        // TODO
    }
}
{% endhighlight %}

The `implementedEvents()` method expects an associative array mapping event names to methods that should handle such events.
So let’s flesh that out with the one event we’re raising:

{% highlight php %}
public function implementedEvents() {
    return array(
        'Model.User.created' => 'sendActivationEmail'
    );
}
{% endhighlight %}

Simples.

So now, we need to actually create that `sendActivationEmail()` method we’ve specified.
This is where we would put the code to be ran when a user is created.

{% highlight php %}
public function sendActivationEmail(CakeEvent $event) {
    // TODO
}
{% endhighlight %}

The method is passed one argument: an instance of `CakeEvent`.
In fact, this would be the `CakeEvent` instance you raise in your `User` model.
We set some data there (an ID and the current record’s data), and that data is now going to available to us in the instance passed to our listener method.

So now we know what we’re getting, let’s flesh our listener method out some more with that email sending code:

{% highlight php %}
public function sendActivationEmail(CakeEvent $event) {
    $this->User = ClassRegistry::init('User');

    $activationKey = Security::generateAuthKey();

    $this->User->id = $event->data['id'];
    $this->User->set(array(
        'active' => false,
        'activation_key' => $activationKey
    ));
    $this->User->save();

    $email = new CakeEmail();
    $email->from(array(
        'noreply@example.com' => 'Your Site'
    ));
    $email->to($event->data['user']['email']);
    $email->subject('Activate your account');
    $email->template('new_user');
    $email->viewVars(array(
        'firstName' => $event->data['user']['first_name'],
        'activationKey' => $activationKey
    ));
    $email->emailFormat('text');
    $email->send();
}
{% endhighlight %}

The code above is doing the following:

* Creating an instance of the `User` model, as we don’t initially have it available in our listener class
* Generating an activation key for the user
* Setting the activation key for the user in the database, whose ID we get from the event raised
* Sending the activation email, with our generated activation key

And that’s all there is to our listener class.

Because we’re using the `CakeEmail` and `Security` classes in CakePHP, it’s a good idea to make sure they’re loaded.
At the top of the file, add these two lines:

{% highlight php %}
App::uses('CakeEmail', 'Network/Email');
App::uses('Security', 'Utility');
{% endhighlight %}

## Attaching the listener

We now have two out of three components in our Observer pattern set up: events are being raised, and we have code to act on raised events; we just need to hook the two together now.
This is where CakePHP’s documentation just leaves you completely on your own.

One approach is to do this in the **app/Config/bootstrap.php** file.
We need to create an instance of our event listener class and attach it to the `User` model using its event manager.

The code is simple.
At the bottom of your **bootstrap.php** add the following code:

{% highlight php %}
App::uses('ClassRegistry', 'Utility');
App::uses('UserListener', 'Event');

$user = ClassRegistry::init('User');
$user->getEventManager()->attach(new UserListener());
{% endhighlight %}

As you can see, we’re using CakePHP’s `ClassRegistry` utility class to load the `User` model; and then using the `User` model’s event manager to attach our `UserListener` class.
So now when the `User` model fires an event, our `UserListener` class (and any other listener classes attached to it) will be listening for it.
Neat!

## Conclusion

Hopefully you can see the merits of the Observer pattern.
This is just one example; there are many other use cases where this pattern would be appropriate.
Hopefully this blog post will demystify CakePHP’s implementation of this design pattern and you can find areas in your own applications where you can apply it yourself.

If you do use CakePHP’s events system in your own applications, then I’d love to see your implementations and the problems you solved using it.
