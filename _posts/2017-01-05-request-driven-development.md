---
excerpt: Using form requests to authorise, validate, and perform actions in a Laravel application.
layout: post
nav: blog
title: Request-Driven Development
---
After a well-earned rest over the holiday period, I opened my MacBook to write
my first line of code of 2017. I’d set myself a simple task on a side project of
mine, but in performing the task I decided to employ a different approach.

The task was simple: I wanted an endpoint that when hit would either publish or
un-publish the given item.

I set out and stubbed out the <abbr class="initialism" title="Uniform Resource Locator">URL</abbr>
and corresponding controller method for the action. I then created a form
request class (as it is a Laravel application) and type-hinted it in my
controller method. I was about to put the toggling logic in the controller
method when I thought: if the form request class can handle authorization and
validation, why too could it not perform the actual _logic_ of what the request
is intending?

The form request class represents a _specific_ action in the application. So it
is not completely unreasonable that if it represents that action, the form
request class could to perform the action.

I followed this line of thinking, and ended up with a form request class that
looked similar to this:

```php
class PublishArticleRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()->can('publish', $this->article);
    }

    public function validate()
    {
        return [];
    }

    public function handle()
    {
        return $this->article->publish();
    }
}
```

The controller just type-hints this class and calls the `handle()` method on the
form request class:

```php
class ArticleController extends Controller
{
    public function publish(PublishArticleRequest $request, Article $article)
    {
        $request->handle();

        return redirect()
            ->route('article.show', $article)
            ->withSuccess(trans('messages.article_published'));
    }
}
```

It’s an unusual approach to handling logic in applications. It’s also flawed in
that the logic can only be performed in a HTTP context; it can’t be re-used in
say, a command-line context. But for side projects (as was the case here) or for
quick-and-dirty prototypes, this approach could be useful.
