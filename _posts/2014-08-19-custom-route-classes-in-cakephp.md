---
layout: post
meta_description: "CakePHP offers the ability to specify custom classes for handling routes in your applications."
title: Custom route classes in CakePHP
---
Some times in CakePHP applications, you want custom routes.
If you’re using the framework’s default routes, then out of the box they take the format of:

**http://example.com/:controller/:action/:param1/:param2**

This allows you to dispatch a route like **http://example.com/articles/view/1** to a controller action like:

```php
<?php
class ArticlesController extends AppController {

	public public view($id = null) {
		if (!$id || !$this->Article->exists($id)) {
			throw new NotFoundException('Invalid article');
		}
		$article = $this->Article->findById($id);
		$this->set(compact('article'));
	}
}
```
But this format doesn’t cut it for most situations.
For example, most website owners like to use slugs (or “friendly” URLs).
So the above URL would instead become something like **http://example.com/articles/view/lorem-ipsum-dolor-set-amit**.

Assuming you have a column named `slug` in your `articles` table, you could modify your `view()` action as follows:

```php
<?php
class ArticlesController extends AppController {

	public public view($slug = null) {
		if (!$id) {
			throw new NotFoundException('Invalid article');
		}
		$article = $this->Article->findBySlug($id);
		if (!$article) {
			throw new NotFoundException('Invalid article');
		}
		$this->set(compact('article'));
	}
}
```
But this isn’t efficient. It’s coupling the parameters our controller action is expecting to the URL parameters.
And it would only get more complicated if we decided we wanted additional parameters to be present in the URL, such as the article’s published date
(i.e. **http://example.com/articles/2014/08/19/lorem-ipsum-dolor-set-amit**).

A solution to this is to create our very own route class, and use that to handle incoming URLs and re-write them if necessary.

I took this approach recently for the problem above: I wanted URLs to contain both a date and slug.
To handle this, I created a class called `DateSlugRoute`, and saved it to **app/Routing/Route/DateSlugRoute.php**.
The class looks like this:

```php
<?php

App::uses('Article', 'Model');
App::uses('CakeRoute', 'Routing/Route');
App::uses('ClassRegistry', 'Utility');

class DateSlugRoute extends CakeRoute {

	public function parse($url) {
		$params = parent::parse($url);
		if (empty($params)) {
			return false;
		}
		$this->Article = ClassRegistry::init('Article');
		$year = $params['year'];
		$month = $params['month'];
		$day = $params['day'];
		$date = sprintf('%04d-%02d-%02d', $year, $month, $day);
		$article = $this->Article->find('first', array(
			'conditions' => array(
				'DATE(Article.created)' => $date,
				'Article.slug' => $params['slug'],
				'Article.published' => true,
			),
			'fields' => array('Article.id'),
			'recursive' => -1,
		));
		if ($article) {
			$params['pass'] = array($article['Article']['id']);
			return $params;
		}
		return false;
	}
}
```

So what‘s going on? Well, custom route classes in CakePHP have to extend the core `CakeRoute` class.
As we extend that class, we also overload the `parse()` method.
In this route class, I’m:

1. Checking if the `$params` array is empty. If it is, I return as the route doesn’t match what I’m looking for.
3. I then grab the year, month, day, and slug from the passed parameters.
4. I then perform a search on the `Article` model for the passed date and slug values.
5. If there’s a matching record, I overwrite `$params['pass']` to be an array with a single value: the article’s ID (this array is what’s passed to controller actions as parameters).

Because only the model ID gets passed to the controller action, that means we don’t need to re-write the method to accommodate the URL structure.

This is a bare-bones approach to custom route classes in CakePHP.
It can be improved greatly (such as caching the results of the model look-ups),
but hopefully it is enough to open up this part of CakePHP to you and experiment with writing your own custom route classes!
