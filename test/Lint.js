'use strict';

const lint = require('mocha-eslint');

const paths = ['index.js', 'lib', 'test'];

lint(paths, { contextName: 'Lint', timeout: Number.MAX_SAFE_INTEGER });
