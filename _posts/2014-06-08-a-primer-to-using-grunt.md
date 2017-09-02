---
excerpt: Grunt is a JavaScript task runner. This post shows you how to get started automating your front-end tasks.
layout: post
nav: blog
title: A primer to using Grunt
---
<p class="lead">Grunt is a JavaScript task runner that lives within your web projects.
  You can use it to automate tasks that you may have up to now ran manually from the command line.</p>

Think things like:

* compiling LESS/Sass to CSS and CoffeeScript to JavaScript
* minifying CSS and JavaScript files for production
* running unit tests and linters

And so on. It’s pretty boring to run these commands over and over again.
Thankfully, the people behind Grunt (and other similar task runners) thought the same.

Grunt works on the concept of plugins.
There are plugins for the task mentioned above, plus hundreds more.
The plugins you install offer tasks, which you configure to your projects’ needs.

## Installing

### Node.js

Grunt isn’t a standalone package. To install it, you first you need to install npm, the Node Package Manager.
npm is installed automatically when you install Node.js.
You can find installation instructions on the official Node.js website at http://nodejs.org/.

### Grunt

Once you’ve installed Node.js (and npm), you can install Grunt.
Grunt is a Node.js package (hence the need for Node.js and npm).
If you open your command line application, you can install Grunt with the following command:

    $ npm install -g grunt-cli

The `-g` flag tells Node.js to install Grunt globally on your machine, so you don’t need to install Grunt for each and every project you wish to use it on.

## Using Grunt

If you now have Grunt installed, we can add it to a project.
Either open an existing project’s directory, or create a new directory for a project.

### Create a **package.json** manifest

Grunt needs a npm package manifest.
This simply describes your project (such as name, description, version number, authors, licence etc).
You can generate one by running the following command:

    $ npm init

The command line utility is interactive and will ask you a few simple questions about your project.
It also has sane defaults, so you can hit <kbd>Enter</kbd> if you’re happy with the default for a question.

Just a note: if your project’s source code is not for public consumption (i.e. it’s proprietary) then you can mark it as private.
This means that, it will *never* be added to the npm registry, either accidentally or purposefully.
If you would like to mark your project as such, open up the new **package.json** file that was created and change it to the following:

<div lang="en-US">
```js
{
  "name": "vendor/package",
  "version": "0.0.0",
  "description": "Your project’s description.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Martin Bean <martin@martinbean.co.uk>",
  "license": "ISC",
  "private": true
}
```
</div>

You need to add `"private": true` at the second-from-bottom line, just before the closing `}`.
Also, don’t forget the comma on at the end of the <span lang="en-US">`license`</span> line!

### Installing Grunt in your project

If your project is to be worked on by other developers, then they may not have Grunt installed.
Simple we have a npm package description, we can make use of it and its features, such as dependency declarations.
We can specify Grunt as a dependency, so when other developers run `npm install` in the project directory, npm knows to grab Grunt as well.

To add Grunt to your **package.json** file, you can run the following command:

    $ npm install grunt --save-dev

This will download Grunt to a new directory in your project called **node_modules**.
If you use version control (such as Git), then you will need to add this directory to your ignore list too.

### Creating the “Gruntfile”

Now we have Grunt, we can create what’s called a “Gruntfile”.
This is basically a file that does things with Grunt.
At its simplest, it looks like this:

```js
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

};
```

It’s initialised Grunt, and reading in the **package.json** file to learn about your project (such as its name).

### Installing tasks

A Gruntfile like above is pretty useless. It doesn’t do anything. **Yet**.
So let’s install a Grunt plugin that contains a task.

A popular task is compiling LESS files into CSS.
In your project, you can work in your LESS files, and then run the `lessc` command line utility to generate CSS.
But you have to run that command *every* time you change a **.less** file.
Not fun.

Grunt has a plugin called `grunt-contrib-less`.
You can install it similarly to how you installed Grunt itself.
Run this command:

    $ npm install grunt-contrib-less --save-dev

This downloads the plugin, again to **node_modules**.
You can now add it as a task to your Gruntfile:

```js
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  grunt.loadNpmTasks('grunt-contrib-less');

};
```

### Configuring tasks

The above loads the LESS task, but it still doesn’t know what to do.
Mainly because every project and every developer have their own way of naming files, where they save files, and so on.

You can change the `config` option to specify the options for the LESS task:

```js
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      compile: {
        options: {
          compress: true
        },
        files: {
          'public/css/styles.css': 'public/less/styles.less'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');

};
```

You can now generate your CSS from your LESS files by running the following command:

    $ grunt less

You may be thinking to yourself, “What’s the benefit of running `grunt less` over `lessc -x public/less/styles.less public/css/styles.css`?”
Well, the answer is to nothing.
So to make life easier, we can install another Grunt plugin that will **watch** your LESS files, and when they’re changed automatically compile them.

To do this, we need to install the `grunt-contrib-watch` plugin:

    $ npm install grunt-contrib-watch --save-dev

Then load the plugin in your Gruntfile:

```js
grunt.loadNpmTasks('grunt-contrib-watch');
```

As with the LESS task, we need to configure the watch task.
Your Grunt config will end up looking something like this:

```js
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  less: {
    compile: {
      options: {
        compress: true
      },
      files: {
        'public/css/styles.css': 'public/less/styles.less'
      }
    }
  },
  watch: {
    less: {
      files: 'public/less/*.less',
      tasks: ['less']
    }
  }
});
```

We created a watch task for LESS files that, whenever a file in the **public/less** directory with an extension of **.less** is modified, runs the `less` task.
You can start this process off with the following command:

    $ grunt watch

Now any time you modify a **.less** file, it will be compiled to CSS.

As the watch task can be configured for multiple tasks, you can also configure it to minify your JavaScript every time you modify a **.js** file (so long as you install the relevant plugin beforehand).

## Wrapping up

Hopefully this has given you an insight into Grunt, and how helpful it can be for your projects and automating tasks you may have done manually in the past.
Any questions, feel free to leave a comment below.
