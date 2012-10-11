/**
 * Module dependencies.
 */
var path = require('path')
  , url = require('url')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync;

// test if `path` is a file
function isFileSync(path) {
  return existsSync(path) && fs.statSync(path).isFile()
}

/**
 * Expose special dependencies.
 */
var special = exports.special = ['require', 'exports', 'module'];


/**
 * Resolves module `id` to an absolute path.
 *
 * This function implements the AMD module resolution algorithm.  This algorithm
 * is similar to that used by CommonJS, with deviations necessitated by
 * targetting a browser-based environment.
 *
 * Additionally, this implementation supports the common configuration currently
 * being drafted by the AMD implementers group.  This is not a strict
 * requirement of the AMD API, but the options are necessary when utilizing
 * modules in any sufficiently large project.
 *
 * The resolution algorithm used by AMD is, unfortunately, not clearly defined
 * in a single location.  As such, there are likely to be incompatiblities
 * between AMD implementations.  Where ambiguities exist, this implementation
 * attempts to conform to the behavior of RequireJS, the most widely used AMD
 * loader.
 *
 * For further details, consult relevant specifications and documentation:
 *   https://github.com/amdjs/amdjs-api/wiki/AMD
 *   https://github.com/amdjs/amdjs-api/wiki/Common-Config
 *   http://requirejs.org/docs/api.html#jsfiles
 *   http://requirejs.org/docs/api.html#config-baseUrl
 *   http://requirejs.org/docs/api.html#config-paths
 *   http://requirejs.org/docs/api.html#config-map
 *
 * as well as these implementations:
 *   https://github.com/jrburke/r.js/blob/2.1.0/build/jslib/requirePatch.js#L146
 *
 * @param {String} id
 * @param {Object} options
 * @return {String}
 * @api public
 */
exports.sync = function(id, opts) {
  if (special.indexOf(id) !== -1) return id;
  
  var parentID = opts.parentID;
  var relDir = opts.relDir;
  var baseDir = opts.baseDir || opts.baseUrl || process.cwd();
  var paths = opts.paths || {};
  var map = opts.map || {};
  var packages = opts.packages || [];
  var extensions = opts.extensions || [ '.js' ];
  var isFile = opts.isFile || isFileSync;
  
  // TODO: Implement proper handling of module IDs that end in ".js".
  //       http://requirejs.org/docs/api.html#config-baseUrl
  
  // TODO: Are "paths", "map", and "packages" options mutually explusive?
  //       If yes, which takes priority; if no, how should the output from one
  //       tranform apply as input to the other?
  
  if (id.charAt(0) === '.') {
    // relative module
    var m = loadAsFileSync(path.resolve(relDir, id));
    if (m) { return m; }
  } else {
    // top-level module
    var ids;
    
    // apply mappings specified in "paths" to the requested module
    for (var prefix in paths) {
      // TODO: Do more specific prefixes take priority (as is the case with the
      //       "map" option)?  This is not stated in the specification.
      
      if (id.indexOf(prefix) === 0) {
        var p = paths[prefix]
          , r = id.slice(prefix.length);
        if (typeof p === 'string') {
          ids = [ p + r ];
        } else if (Array.isArray(p)) {
          ids = p.map(function(pi) { return pi + r });
        }
        break;
      }
    }
    ids = ids || [ id ];
    
    // apply mappings specified in "map" for the parent module to the requested
    // module
    for (var pprefix in map) {
      var pprio = -1;
      if ((parentID && parentID.indexOf(pprefix) === 0) ||
          (pprefix === '*' && 0 > pprio)) {
        var dmap = map[pprefix]
          , prio = -1;
        for (var prefix in dmap) {
          if (id.indexOf(prefix) === 0 && prefix.length > prio) {
            var p = dmap[prefix]
              , r = id.slice(prefix.length);
            ids = [ p + r ];
            prio = prefix.length;
          }
        }
        pprio = pprefix !== '*' ? pprefix.length : 0;
      }
    }
    
    // apply configuration specified in "packages" to the requested module
    for (var i = 0, len = packages.length; i < len; i++) {
      var pkg = packages[i];
      if (typeof pkg === 'string') {
        pkg = { name: pkg }
      }
      pkg.main = pkg.main || 'main';
      pkg.location = pkg.location || pkg.name;
      
      if (id.indexOf(pkg.name) === 0) {
        var r = id.slice(pkg.name.length);
        if (r.length === 0) {
          ids = [ pkg.location + '/' + pkg.main ]
        } else {
          ids = [ pkg.location + '/' + r ]
        }
      }
    }
    
    for (var i = 0, len = ids.length; i < len; i++) {
      var mid = ids[i];
      // module referenced by URL
      if (url.parse(mid).protocol) { return mid; }
      var m = loadAsFileSync(path.resolve(baseDir, mid));
      if (m) { return m; }
    }
  }
  
  var err = new Error("Cannot find module '" + id + "'");
  err.code = 'MODULE_NOT_FOUND';
  throw err;
  
  
  function loadAsFileSync(path) {
    if (isFile(path)) {
      return path;
    }

    for (var i = 0, len = extensions.length; i < len; i++) {
      var file = path + extensions[i];
      if (isFile(file)) {
        return file;
      }
    }
  }
}