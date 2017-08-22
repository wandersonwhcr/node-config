# config

A Simple Configuration Loader for Node.js

[![Travis](https://img.shields.io/travis/wandersonwhcr/node-config.svg)](https://travis-ci.org/wandersonwhcr/node-config)
[![npm](https://img.shields.io/npm/v/@wandersonwhcr/config.svg)](https://www.npmjs.com/package/@wandersonwhcr/config)
[![license](https://img.shields.io/github/license/wandersonwhcr/node-config.svg)](https://github.com/wandersonwhcr/node-config/blob/master/LICENSE)

## Usage

This package can be used to load configurations asynchronously using Promises.

```js
// Dependencies
const Config = require("@wandersonwhcr/config").Config;

// config/default.d/00-default.json   -> { "foo": "bar" }
// config/default.d/10-something.json -> { "baz": "qux" }
// config/local.d/99-local.json       -> { "foo": "one", "somebody": "someone" }

// Construction
var config = new Config([
    "config/default.d/*.json",
    "config/local.d/*.json"
]);

// Fetch Files
config.fetch().then(function (config) {
    // { "foo": "one", "baz": "qux", "somebody": "someone" }
}).catch(function (error) {
    // Whoops!
});
```

Synchronous configuration loading can be used directly, but it's not
recommended.

```js
// Fetch Files (Sync)
var result = config.fetchSync();
// { "foo": "one", "baz": "qux", "somebody": "someone" }
```

## License

This project is licensed under MIT License. See
[`LICENSE`](//github.com/wandersonwhcr/node-config/blob/master/LICENSE)
file for details.
