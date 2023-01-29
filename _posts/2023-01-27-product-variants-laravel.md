---
excerpt: 'An approach to modelling products and their variants (SKUs) in e-commerce applications.'
title: Modelling Products and Variants for E-Commerce
---
{% capture note_content %}
Whilst the content of this post is technology-agnostic, the code samples shown will be [Laravel](https://laravel.com/).
{% endcapture %}
{% include note.html content=note_content %}

I often see developers asking how to model products and their variants in e-commerce projects. Whilst a lot of developers will create a `products` table in their database and then a `product_variants` table or similar, I take a more real-world approach when it comes to modelling a product and its variants.

## Products and <abbr class="initialism" title="Stock Keeping Units">SKUs</abbr>
In traditional retail, if a product comes in many variants then each variant will be referred to as a <abbr class="initialism" title="Stock Keeping Unit">SKU</abbr>. Therefore, I like to create `Product` and `Sku` models in my applications to model these two entites.

So what does this look like in practice? As an example, a particular t-shirt design usually comes in multiple sizes (small, medium, large, etc). But to the customer, it’s just one “product”. So the key here is identifying the data that belongs to the _product_ and the data that belongs to each individual _SKU_.

A _product_ would be the top-level representation of a product. So it will contain a product’s name, description, manufacturer name, etc. A _SKU_ represents a single variant, so its model needs to hold information unique to that particular variant, such as price, inventory, etc. The price is placed on the SKU model as different SKUs may have different prices (i.e. an XXL t-shirt may be more expensive due to requiring more material).

In a Laravel application, the migrations for these models may look like this:

```php
public function up()
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description')->nullable();
        $table->timestamps();
    });
}
```
```php
public function up()
{
    Schema::create('skus', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->string('sku')->unique();
        $table->char('currency_code', 3);
        $table->unsignedInteger('unit_amount');
        $table->timestamps();
    });
}
```

## Product attributes
Whilst the above takes care of the one-to-many relation between products and SKUs, it does leave out the topic of product attributes (like colour, size, etc). There are a number of ways to model these, but I usually create a `product_attributes` table that has a foreign key pointing the product, and then a string column to hold the attribute name:

```php
public function up()
{
    Schema::create('product_attributes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->string('name');
        $table->timestamps();

        $table->unique(['product_id', 'name']);
    });
}
```

A unique constraint is added on the `product_id` and `name` columns to prevent creating multiple attributes with the same name for a single product.

This approach is simple, but does mean that you may have attributes with the same name for _multiple_ products. For example, if you sell multiple t-shirts, you then may well have multiple attributes with a name of `size`. So if you want canonical attribute names, you will need to model attributes slightly differently that above.

So what about the _values_ of these attributes (i.e. “blue” for colour, “large” for size)? Here, I create a many-to-many relation between product attributes and SKUs, with a `value` column in the pivot table:

```php
public function up()
{
    Schema::create('product_attribute_sku', function (Blueprint $table) {
        $table->primary(['product_attribute_id', 'sku_id']);
        $table->foreignId('product_attribute_id')->constrained()->cascadeOnDelete();
        $table->foreignId('sku_id')->constrained()->cascadeOnDelete();
        $table->string('value');
    });
}
```

So say product attribute `1` was “colour”, we could say a given SKU (`3`) is blue by inserting values that looked like this:

```sql
INSERT INTO `product_attribute_sku` (`product_attribute_id`, `sku_id`, `value`) VALUES (1, 3, 'blue');
```

However, this approach is a simple approach and does mean that you may have duplicate data if you have many products that come in the same colour. If you wanted canonicalised values, then you’ll need to tweak this schema and use some form of foreign key for the value that points to a canonical value in some table.

## Conclusion
This is by no means the only way to represent products and their variants in a web application, but it’s a set-up that has worked well for me in a number of projects now. If you have thoughts on the above, or model products and variants differently then I’d love to hear from you!
