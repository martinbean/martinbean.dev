---
excerpt: How to use private packages on Bitbucket as Composer dependencies for PHP projects on Heroku.
layout: post
title: Using Private Repositories in Composer on Heroku
---
I’m a big fan of [Heroku][1]. I enjoy writing code, but I don’t enjoy wrangling
servers to run my code. Heroku is a “platform-as-a-service” (PaaS) provider,
meaning it provides a hosting platform and all you have to do is push code; it
will configure load-balanced servers and services for you.

Another service I use is [Bitbucket][2]. Bitbucket is great for hosting private
repositories if you’re boot-strapping or don’t want to pay [GitHub][3] for
private repositories. I use Bitbucket to host the source code for my personal
projects that are closed source.

If you’re working on personal projects then you may also host the source code of
packages in private repositories. To use these private packages as [Composer][4]
dependencies in an application you deploy to Heroku, you’ll need to go through
some configuration steps. The steps are roughly:

1. Create an OAuth consumer in your Bitbucket account.
2. Add a `COMPOSER_AUTH` environment variable to your Heroku application.
3. Set the repository URL in your **composer.json** file.

## Create an OAuth consumer in Bitbucket
1. Sign in to your Bitbucket account: [https://bitbucket.org/account/signin/][4]
2. Click your avatar in the bottom-left of the screen.
3. Click on “Bitbucket settings”.
4. Choose “OAuth” from the “Access Management” section.
5. Click the “Add consumer” button under the “OAuth consumers” heading.
6. Set the name to “Heroku” and add a dummy callback URL; something like “https://example.com” is fine.
7. Give the consumer the read repositories permission, and click “Save”.
8. You’ll now have a new consumer. Make a note of its **Key** and **Secret** values.

## Add environment variable to Heroku
You’ll now need to add a `COMPOSER_AUTH` environment variable to your Heroku
application. As the name suggests, it specifies to Composer how to authenticate
access private repositories. Documentation for this environment variable (and
other available variables) is here:
[https://getcomposer.org/doc/03-cli.md#composer-auth][5]

The environment variable’s value with be a JSON object. The object should look
like this:

```json
{
    "bitbucket-oauth": {
        "bitbucket.org": {
            "consumer-key": "XXX",
            "consumer-secret": "XXX"
        }
    }
}
```

Obviously, replace the `XXX` values with the key and secret that was generated
when you created your OAuth consumer on Bitbucket.

Now, set the environment variable in your Heroku app. You can either use the
Heroku dashboard or the [Heroku CLI][6]. Setting an environment variable using
the CLI looks like this:

```text
$ heroku config:set COMPOSER_AUTH='{ \
    "bitbucket-oauth": { \
        "bitbucket.org": { \
            "consumer-key": "XXX", \
            "consumer-secret": "XXX" \
        } \
    } \
}' --app name-of-your-app
```

Be sure to use the actual name of your application for the `--app` flag.

## Configure the repository URL
The final step to be able to use a private hosted package is to add to your
**composer.json** file as a dependency, and set its URL.

Add a `repositories` key to your **composer.json** file if one does not exist
already. It should be an array of objects. Each object should have a `type` and
a `url` value. For packages hosted on Bitbucket, the `type` would be `vcs` and
the URL would be the _HTTPS_ URL of the repository, i.e.

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://bitbucket.org/your-username/your-repository-name.git"
        }
    ]
}
```

It’s important you use the HTTPS URL, as the SSH URL does not work when
authenticating using OAuth.

Finally, add the name of your package as it is in its own **composer.json** file
as a dependency of your application:

```json
{
    "require": {
        "your-vendor-name/your-package-name": "dev-master"
    },
    "repositories": [
        {
            "type": "vcs",
            "url": "https://bitbucket.org/your-username/your-repository-name.git"
        }
    ]
}
```

Commit the changes.

## Finishing up
Now, when you next deploy your application to Heroku (using `git push heroku`),
if your consumer key and secret, repository URL, and package name are all
correct; Heroku should use OAuth to authenticate with Bitbucket and be able to
pull down your package’s source code!

[1]: https://heroku.com/
[2]: https://bitbucket.org/
[3]: https://github.com/
[4]: https://bitbucket.org/account/signin/
[5]: https://getcomposer.org/doc/03-cli.md#composer-auth
[6]: https://devcenter.heroku.com/articles/heroku-cli
