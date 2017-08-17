# config

A Simple Configuration Loader for Node.js

## Usage

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
    console.log(config);
    // { "foo": "one", "baz": "qux", "somebody": "someone" }
}).catch(function (error) {
    // Whoops!
});
```
