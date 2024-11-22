---
excerpt: 'How to define and use slots with dynamic names in Vue 3 applications.'
title: Dynamic named slots in Vue 3
vue_version: 3
---
I’ve recently been re-building an admin panel in a personal [Laravel][1]-based project, convering it from “traditional” [Blade][2] views to an [Inertia][3]-based solution. As part of this, I’ve been identifying repeating elements that can be extracted into reusable [Vue][4] components.

One such component is a table, listing records. In my application, I’ve named this a `ResourceTable`. My first pass at this was to just pass headers and items as props. Headers was a map of the model attribute name and the human-friendly name for those attributes; and items was an array of models.

{% raw %}
```
<script lang="ts" setup>
defineProps<{
    headers: Record<string, string>;
    items: Record<string, any>[];
}>();
</script>

<template>
    <table>
        <thead>
            <tr>
                <template v-bind:key="key" v-for="(value, key) in headers">
                    <th scope="col">{{ value }}</th>
                </template>
            </tr>
        </thead>
        <tbody>
            <tr>
                <template v-bind:key="index" v-for="(item, index) in items">
                    <template v-bind:key="key" v-for="(value, key) in headers">
                        <td>{{ item[key] }}</td>
                    </template>
                </template>
            </tr>
        </tbody>
    </table>
</template>
```
{% endraw %}

* For the table header, the component just loops over `headers` prop and outputs the value in a `<th>` element.
* For the table body, the component loops over each item in the `items` prop, and then iterates over the `headers` again to print the attribute value for each headers’ key.

An example of using this component looks like this:

```
<ResourceTable
    v-bind:headers="{
        'name': 'Name',
        'birth_date': 'Birthday'
    }"
    v-bind:items="[
        { 'name': 'John Doe', 'birth_date': null },
        { 'name': 'Jane Doe', 'birth_date': '1984-03-21' },
        { 'name': 'Joe Bloggs', 'birth_date' null }
    ]"
/>
```

However, data is not always necessarily consistent. For example, the items above all have a `birth_date` property, but the property value can be either a string or `null`. It would be nice to handle these cases.

## Handling `null` values
The first case I handled was `null` values. I decided to output an em dash, with a more helpful label for those using assistive technologies like screen readers:

{% raw %}
```
<template v-bind:key="key" v-for="(value, key) in headers">
    <td>
        <template v-if="item[key] === null">
            <span aria-label="No value">&mdash;</span>
        </template>
        <template v-else>{{ item[key] }}</template>
    </td>
</template>
```
{% endraw %}

## Using dynamic named slots for each cell
Next, to have full control over how individual cells rendered, I used a slot with a dynamic name:

{% raw %}
```
<td>
    <template v-if="item[key] === null">
        <span aria-label="No value">&mdash;</span>
    </template>
    <template v-else>
        <slot v-bind:name="`cell(${key})`" v-bind:value="item[key]">{{ item.key }}</slot>
    </template>
</td>
```
{% endraw %}

For each cell, a new slot is defined. So for cells for the attribute `name`, there would be a corresponding slot with the name `cell(name)`.

If I don’t use these slots in my template, then they’ll just get the default value as before. But now if I _do_ use these slots in my template, I can control have the value is displayed. So for `birth_date` values, I may want to do some formatting, or use a completely different component to handle the rendering of it:

{% raw %}
```
<ResourceTable
    v-bind:headers="{
        'name': 'Name',
        'birth_date': 'Birthday'
    }"
    v-bind:items="[
        { 'name': 'John Doe', 'birth_date': null },
        { 'name': 'Jane Doe', 'birth_date': '1984-03-21' },
        { 'name': 'Joe Bloggs', 'birth_date' null }
    ]"
>
    <template v-slot:cell(birth_date)="{ value }">
        <FormattedDate v-model="value" />
    </template>
</ResourceTable>
```
{% endraw %}

## Adding row actions
It’s common in web applications for each row to have associated actions, i.e. edit that record, delete that record, etc. To accomplish this, I used an optional slot. If I defined a slot named `actions` in my template, then it would automatically add a new table heading, and a cell at the end of each row to hold the defined actions:

```diff
  <thead>
      <tr>
          <template v-bind:key="key" v-for="(value, key) in headers">
              <th scope="col">{{ value }}</th>
+             <template v-if="'actions' in $slots">
+                 <th scope="col">Actions</th>
+             </template>
          </template>
      </tr>
  </thead>
  <tbody>
      <tr>
          <template v-bind:key="index" v-for="(item, index) in items">
              <template v-bind:key="key" v-for="(value, key) in headers">
                  <td>{{ item[key] }}</td>
              </template>
+             <template v-if="'actions' in $slots">
+                 <td>
+                     <slot name="actions" v-bind:item="{ item }"></slot>
+                 </td>
+             </template>
          </template>
      </tr>
  </tbody>
```

The `actions` slot is a scoped slot that makes the `item` available, so that I can use its attributes, i.e. for building URLs:

{% raw %}
```
<ResourceTable
    v-bind:headers="{
        'name': 'Name',
        'birth_date': 'Birthday'
    }"
    v-bind:items="[
        { 'name': 'John Doe', 'birth_date': null },
        { 'name': 'Jane Doe', 'birth_date': '1984-03-21' },
        { 'name': 'Joe Bloggs', 'birth_date' null }
    ]"
>
    <template v-slot:cell(birth_date)="{ value }">
        <FormattedDate v-model="value" />
    </template>
    <template v-slot:actions="{ item }">
        <ResourceTableAction
            title="Edit"
            v-bind:url="editUrl(item)"
        />
        <ResourceTableAction
            confirm="Are you sure you want to delete this item?"
            method="delete"
            title="Delete"
            v-bind:url="deleteUrl(item)"
        />
    </template>
</ResourceTable>
```
{% endraw %}

## Conclusion
I now have a re-usable “resource table” component that will handle most cases by default, but also gives me the ability to have full control over cell values if I need it.

[1]: https://laravel.com
[2]: https://laravel.com/docs/blade
[3]: https://inertiajs.com
[4]: https://vuejs.org
