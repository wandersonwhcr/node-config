# config

A Simple Configuration Loader for Node.js

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
