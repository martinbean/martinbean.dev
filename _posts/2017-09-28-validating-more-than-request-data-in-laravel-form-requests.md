---
layout: post
nav: blog
title: Validating More Than Request Data in Laravel Form Requests
---
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateArticleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'headline' => 'required|string|max:255',
            'summary' => 'required|string|max:255',
            'body' => 'required|string',
        ];
    }
}
```

- Needed to validate _state_ of a model

## Route-model binding

**Route–model binding** allows you to automatically inject model instances into
your routes and controllers based on URL parameters.

Given the following route:

```php
<?php

Route::get('articles/{article}', 'ArticleController@show');
```

The `{article}` route parameter would be injected into your controller action
and you would then look for an `Article` model instance matching that value:

```php
<?php

namespace App\Http\Controllers;

use App\News\Article;

class ArticleController extends Controller
{
    public function show($article)
    {
        $article = Article::findOrFail($article);

        return view('article.index', compact('article'));
    }
}
```

Route–model will do the model look-up for you, and then inject that model into
your controller action. All you have to do is type-hint the parameter will your
model class:

```php
<?php

namespace App\Http\Controllers;

use App\News\Article;

class ArticleController extends Controller
{
    public function show(Article $article)
    {
        // $article will be the Article model instance that
        // matches the primary key specified in the URL

        return view('article.show', compact('article'));
    }
}
```

This dramatically cleans up your controller of querying models; a lot of actions
will now just be single-line methods that simply return a view with some data.

Another benefit of using route–model binding is that you can then access model
instances in your form request classes:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShowArticleRequest extends FormRequest
{
    public function authorize()
    {
        // You can access the bound Article instance in the following ways:
        // $this->route()->parameter('article')
        // $this->route('article')
        // $this->article
    }
}
```

With model instances, you can then access any of the methods on that class.

## Validating model state

In a video on demand application, I wanted to validate a `Video` model was
“valid” before publishing it. To publish videos I created a simple controller
action:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublishVideoRequest;
use App\Media\Video;

class VideoController extends Controller
{
    public function video(PublishVideoRequest $request, Video $video)
    {
        $video->publish();

        return response(null, 204);
    }
}
```

I started putting the validation in the `publish()` method on the `Video` model
like this:

```php
<?php

namespace App\Media;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class Video extends Model
{
    public function publish()
    {
        $attributes = [
            'name' => $this->name,
            'description' => $this->description,
            'rental_price' => $this->rental_price,
            'available_to_rent' => $this->available_to_rent,
            'encodings' => $this->encodings()->count(),
        ];

        $rules = [
            'name' => 'required|max:255|unique:videos',
            'description' => 'required|max:255',
            'available_to_rent' => 'required|boolean',
            'rental_price' => 'required_if:available_to_rent,1|numeric|min:1',
            'encodings' => 'required|min:1',
        ];

        $messages = [
            'encodings.min' => 'The video has not been transcoded yet.',
        ];

        $validator = Validator::make($attributes, $rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $this->forceFill([
            'published_at' => $this->freshTimestamp(),
        ])->save();
    }
}
```

After a while though, I felt as though I was putting too much in the `publish()`
method, took a step back, and then wondered what it would look like if the
**request** validated whether a video could be published or not.

At their simplest, form request validate the form data by calling the `all()`
method. Because form requests extends the HTTP request class, this is the same
as `$request->all()`. I _could_ have overridden this method, but then calling
`$request->all()` in my controller wouldn’t yield the expected result, i.e. any
POST data.

Looking at the methods available on the form request class, there’s another
method available: `validationData()`. Perfect! We can instead implement this
method in the form request class:

```php
<?php

class PublishVideoRequest extends FormRequest
{
    public function validationData()
    {
        return [
            'name' => $this->video->name,
            'description' => $this->video->description,
            'rental_price' => $this->video->rental_price,
            'available_to_rent' => $this->video->available_to_rent,
            'encodings' => $this->video->encodings()->count(),
        ];
    }
}
```

You’ll notice I’m accessing the properties on the model using `$this->video`
instead of accessing any submitted data from the request itself.

I can also move the validation rules to the form request into the `rules()`
method as expected:

```php
<?php

class PublishVideoRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|max:255|unique:videos',
            'description' => 'required|max:255',
            'available_to_rent' => 'required|boolean',
            'rental_price' => 'required_if:available_to_rent,1|numeric|min:1',
            'encodings' => 'required|min:1',
        ];
    }
}
```
