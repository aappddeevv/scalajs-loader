# Scala.js Webpack loader

[![npm](https://img.shields.io/npm/v/scalajs-loader.svg)](https://www.npmjs.com/package/scalajs-loader)

### Usage

This is a simple Webpack loader that shells out to SBT to build a [Scala.js](http://www.scala-js.org) project.

To use it, first install the package:

```bash
$ npm install --save scalajs-loader
```

then configure the loader in your Webpack config:

```js
module.exports = {
  // ...
  module: {
    rules: [
      { test: /\.scala$/, loader: 'scalajs-loader' },
      // ...
    ]
  }
}
```

Make sure you have the `sbt` binary somewhere in your `PATH`.

### Example

Check out the [example](example) directory for a simple Hello World example.

### Options
Options can be provided to specify the scalajs stage, fullOptJS or fastOptJS.
```js
... as above ...
{ 
  test: /\.scala$/,
  loader: 'scaljs-loader',
  options: { 
    jsStage: 'fullOptJS'
  }
}
```
An additional option `dirSegment` appends a directory segment after the standard
scalajs target output directory (such as target/scala-2.12) in case you are
using a sbt plugin like scalajs-bundler that alters the output directory.
