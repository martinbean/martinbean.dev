---
excerpt: How to create signed S3 object URLs using version 3 of the AWS PHP SDK.
layout: post
title: Creating a signed URL with AWS SDK v3
---
I used version 3 of the Amazon Web Services <abbr class="initialism" title="PHP: Hypertext Preprocessor">PHP</abbr> <abbr class="initialism" title="Software Development Kit">SDK</abbr> after being a long-time user of version 2.

Previously, you used to be able create a signed <abbr class="initialism" title="Uniform Resource Locator">URL</abbr> for an <abbr class="initialism" title="Simple Storage Service">S3</abbr> object by specifying an expiry time as the third parameter for the <code>getObjectUrl()</code> method.
However, this has changed in version 3 of the SDK.

Now, the code to get a pre-signed URL looks like this:

```php
// Create S3 client

$command = $client->getCommand('GetObject', [
    'Bucket' => 'your-bucket',
    'Key' => 'your-object-key'
]);

$request = $client->createPresignedRequest($command, '+10 minutes');

$presignedUrl = (string) $request->getUri();
```

It’s a bit more verbose, but hopefully this helps some one else after it had me stumped for a short while.
