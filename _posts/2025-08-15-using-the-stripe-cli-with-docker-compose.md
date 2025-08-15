---
excerpt: 'How to use the Stripe CLI as a service within a Docker Compose project.'
title: Using the Stripe CLI with Docker Compose
---
I’m currently re-factoring a shopping cart in a personal <abbr class="initialism" title="content management system">CMS</abbr> project. The shopping cart uses [Stripe][1] to process payments. When working with Stripe, you usually need to listen for webhooks to respond to changes (such as a payment intent failing or succeeding) in order to update state in your own application.

When developing locally, Stripe cannot reach your application without some sort of tunnel. Stripe solves this by proving a [CLI][2] with a `listen` command, that forwards any webhook events to your application running locally. Using the CLI to forward Stripe events looks like this:

```
stripe listen \
    --forward-to localhost/stripe/webhook
```

You can also forward [Stripe Connect][3]-related webhooks (which I needed):

```diff
  stripe listen \
+     --forward-connect-to localhost/stripe-connect/webhook \
      --forward-to localhost/stripe/webhook
```

Up until now, I had been using a shell script to start the above command, which then runs continously in the terminal, but this was getting a bit annoying. As I was using [Laravel Sail][4] (a [Docker Compose][5] wrapper) to run the project, I thought about adding the Stripe CLI as a _service_, so that it’s booted each time I run `sail up`, but the approach will work with vanilla Docker Compose projects as well.

To do so, add a new entry to the `services` block of your **docker-compose.yml** file:

```diff
  services:
      # Existing services...
+     stripe:
+         image: 'stripe/stripe-cli'
+         networks:
+             - sail
+         command: 'listen --api-key ${STRIPE_SECRET} --forward-connect-to app/stripe-connect/webhook --forward-to app/stripe/webhook --skip-update --skip-verify'
+         depends_on:
+             - app
```

{% capture note_content %}
I personally rename the `laravel.test` service to `app` when using Laravel Sail.
{% endcapture %}
{% include note.html content=note_content %}

This uses the `stripe/stripe-cli` image to create a new container named `stripe`. As mentioned, I’m using Sail, so make sure the container is within the `sail` named network. I then mark the `app` service (what I rename the `laravel.test` service) as a dependency. The Stripe CLI cannot forward events to my webhook handler if the application isn’t actually running! You also need to use the container name instead of “localhost” for the `command`.

Now when I run `sail up`, all of the other services are started like normal, as well as a new `stripe` command that forwards webhooks.

[1]: https://stripe.com
[2]: https://docs.stripe.com/stripe-cli
[3]: https://docs.stripe.com/connect
[4]: https://laravel.com/docs/sail
[5]: https://docs.docker.com/compose/
