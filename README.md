# amd-resolve

Implements the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module
resolution algorithm, and supports [common config](https://github.com/amdjs/amdjs-api/wiki/Common-Config).

The purpose of this module is to assist AMD tooling, including optimizers and
compilers, that need to perform module resolution during a build step or as part
of an application server.

This is analogous to [James Halliday](http://substack.net/)'s [resolve](https://github.com/substack/node-resolve),
which implements [Node](http://nodejs.org/)'s algorithm.

## Install

    $ npm install amd-resolve

## Usage

Synchronously lookup the location of module `bar`, using options defined by
[common config](https://github.com/amdjs/amdjs-api/wiki/Common-Config).

    resolve.sync('bar', { baseUrl: 'webapp/lib' })

## Tests

    $ npm install
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/amd-resolve.png)](http://travis-ci.org/jaredhanson/amd-resolve)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
