# amd-resolve

Implements the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module
resolution algorithm, and supports [common config](https://github.com/amdjs/amdjs-api/wiki/Common-Config).

The purpose of this module is to assist AMD tooling, including optimizers and
compilers, that need to perform module resolution during a build step or as part
of an application server.

This is analogous to [James Halliday](http://substack.net/)'s [resolve](https://github.com/substack/node-resolve),
which implements [Node](http://nodejs.org/)'s algorithm.

## Installation

    $ npm install amd-resolve

## Usage

Synchronously lookup the location of module `bar`, using options defined by
[common config](https://github.com/amdjs/amdjs-api/wiki/Common-Config).

    resolve.sync('bar', { baseUrl: 'webapp/lib' })

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/amd-resolve.png)](http://travis-ci.org/jaredhanson/amd-resolve)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2012 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
