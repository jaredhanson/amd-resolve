var resolve = require('../lib/index')
  , should = require('should')
  
function isFile(path) {
  if (path.indexOf('.js') == path.length - 3) return true;
  return false;
}

function isFileFalse(path) {
  return false;
}
  
describe('resolve.sync', function() {
  
  it('should resolve top-level modules relative to baseDir option', function() {
    resolve.sync('bar', { baseDir: '/www/modules', isFile: isFile }).should.equal('/www/modules/bar.js');
  })
  it('should resolve top-level modules relative to baseUrl option', function() {
    resolve.sync('bar', { baseUrl: '/www/modules', isFile: isFile }).should.equal('/www/modules/bar.js');
  })
  it('should resolve top-level modules relative to cwd by default', function() {
    resolve.sync('bar', { isFile: isFile }).should.equal(require('path').join(process.cwd(), 'bar.js'));
  })
  
  it('should resolve relative modules', function() {
    resolve.sync('./bar', { relDir: '/www/app/foo', isFile: isFile }).should.equal('/www/app/foo/bar.js');
  })
  it('should resolve relative modules with parent directory', function() {
    resolve.sync('../bar', { relDir: '/www/app/foo/folder', isFile: isFile }).should.equal('/www/app/foo/bar.js');
  })
  
  it('should resolve URL reference modules', function() {
    resolve.sync('http://www.example.com/scripts/bar.js', { baseDir: '/www/modules', relDir: '/www/app/foo' }).should.equal('http://www.example.com/scripts/bar.js');
  })
  
  it('should resolve special dependencies', function() {
    resolve.sync('require', { baseDir: '/www/modules', relDir: '/www/app/foo' }).should.equal('require');
    resolve.sync('exports', { baseDir: '/www/modules', relDir: '/www/app/foo' }).should.equal('exports');
    resolve.sync('module', { baseDir: '/www/modules', relDir: '/www/app/foo' }).should.equal('module');
  })
  
  describe('path mappings', function() {
    
    it('should map module prefix to path', function() {
      resolve.sync('some/module', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                    paths: { 'some': 'some/v1.0' },
                                    isFile: isFile })
        .should.equal('/www/modules/some/v1.0/module.js');
    })
    
    it('should map module prefix to first path', function() {
      resolve.sync('some/module', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                    paths: { 'some': ['some/v1.1', 'some/v1.2'] },
                                    isFile: isFile })
        .should.equal('/www/modules/some/v1.1/module.js');
    })
    
    it('should map module prefix to fallback path', function() {
      function isV12(path) {
        if (path.indexOf('v1.2/module.js') !== -1) return true;
        return false;
      }
      
      resolve.sync('some/module', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                    paths: { 'some': ['some/v1.1', 'some/v1.2'] },
                                    isFile: isV12 })
        .should.equal('/www/modules/some/v1.2/module.js');
    })
    
  })
  
  describe('dependency mappings', function() {
    var map = {
      'some/newmodule': {
        'foo': 'foo1.2'
      },
      'some/oldmodule': {
        'foo': 'foo1.0'
      }
    }
    
    it('should map some/newmodule require foo to foo1.2', function() {
      resolve.sync('foo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                            parentID: 'some/newmodule', map: map,
                            isFile: isFile })
        .should.equal('/www/modules/foo1.2.js');
    })
    it('should map some/newmodule require foo/bar to foo1.2', function() {
      resolve.sync('foo/bar', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                parentID: 'some/newmodule', map: map,
                                isFile: isFile })
        .should.equal('/www/modules/foo1.2/bar.js');
    })
    
    it('should map some/oldmodule require foo to foo1.0', function() {
      resolve.sync('foo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                            parentID: 'some/oldmodule', map: map,
                            isFile: isFile })
        .should.equal('/www/modules/foo1.0.js');
    })
    it('should map some/oldmodule require foo/bar to foo1.0', function() {
      resolve.sync('foo/bar', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                parentID: 'some/oldmodule', map: map,
                                isFile: isFile })
        .should.equal('/www/modules/foo1.0/bar.js');
    })
  })
  
  describe('dependency mappings with specificity', function() {
    var map = {
      'some/newmodule': {
        'foo': 'foo2',
        'foo/bar': 'foo1.2/bar3'
      },
      'some/oldmodule': {
        'foo/bar/baz': 'foo1.0/bar/baz2'
      }
    }
    
    it('should map some/newmodule require foo to foo2', function() {
      resolve.sync('foo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                            parentID: 'some/newmodule', map: map,
                            isFile: isFile })
        .should.equal('/www/modules/foo2.js');
    })
    it('should map some/newmodule require foo/bar to foo1.2/bar3', function() {
      resolve.sync('foo/bar', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                parentID: 'some/newmodule', map: map,
                                isFile: isFile })
        .should.equal('/www/modules/foo1.2/bar3.js');
    })
    it('should map some/oldmodule require foo/bar/baz to foo1.0/bar/baz2', function() {
      resolve.sync('foo/bar/baz', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                    parentID: 'some/oldmodule', map: map,
                                    isFile: isFile })
        .should.equal('/www/modules/foo1.0/bar/baz2.js');
    })
  })
  
  describe('dependency mappings with specificity declared highest to lowest', function() {
    var map = {
      'some/newmodule': {
        'foo/bar': 'foo1.2/bar3',
        'foo': 'foo2'
      },
      'some/oldmodule': {
        'foo/bar/baz': 'foo1.0/bar/baz2'
      }
    }
    
    it('should map some/newmodule require foo to foo2', function() {
      resolve.sync('foo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                            parentID: 'some/newmodule', map: map,
                            isFile: isFile })
        .should.equal('/www/modules/foo2.js');
    })
    it('should map some/newmodule require foo/bar to foo1.2/bar3', function() {
      resolve.sync('foo/bar', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                parentID: 'some/newmodule', map: map,
                                isFile: isFile })
        .should.equal('/www/modules/foo1.2/bar3.js');
    })
    it('should map some/oldmodule require foo/bar/baz to foo1.0/bar/baz2', function() {
      resolve.sync('foo/bar/baz', { baseDir: '/www/modules', relDir: '/www/app/foo',
                                    parentID: 'some/oldmodule', map: map,
                                    isFile: isFile })
        .should.equal('/www/modules/foo1.0/bar/baz2.js');
    })
  })
  
  describe('dependency mappings with wildcard', function() {
    var map = {
      '*': {
        'foo': 'foo1.2'
      },
      'some/oldmodule': {
        'foo': 'foo1.0'
      }
    }
    
    it('should map some/othermodule require foo to foo1.2', function() {
      resolve.sync('foo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                            parentID: 'some/othermodule', map: map,
                            isFile: isFile })
        .should.equal('/www/modules/foo1.2.js');
    })
    
    it('should map some/oldmodule require foo to foo1.0', function() {
      resolve.sync('foo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                            parentID: 'some/oldmodule', map: map,
                            isFile: isFile })
        .should.equal('/www/modules/foo1.0.js');
    })
  })
  
  describe('package configuration', function() {
    var packages = ["cart", "store"];
    
    it('should require cart/main when requiring cart package', function() {
      resolve.sync('cart', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/cart/main.js');
    })
    it('should require store/main when requiring store package', function() {
      resolve.sync('store', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/store/main.js');
    })
    it('should require store/util when requiring store/util package', function() {
      resolve.sync('store/util', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/store/util.js');
    })
  })
  
  describe('package configuration with main override', function() {
    var packages = [
      "cart",
      { name: "store", main: "store" }
    ];
    
    it('should require cart/main when requiring cart package', function() {
      resolve.sync('cart', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/cart/main.js');
    })
    it('should require store/store when requiring store package', function() {
      resolve.sync('store', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/store/store.js');
    })
    it('should require store/util when requiring store/util package', function() {
      resolve.sync('store/util', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/store/util.js');
    })
  })
  
  describe('package configuration with location override', function() {
    var packages = [
      { name: 'dojo', location: 'dojo/1.7.1', main: 'main' }
    ];
    
    it('should require dojo/1.7.1/main when requiring dojo package', function() {
      resolve.sync('dojo', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/dojo/1.7.1/main.js');
    })
    it('should require dojo/1.7.1/util when requiring dojo/util package', function() {
      resolve.sync('dojo/util', { baseDir: '/www/modules', relDir: '/www/app/foo',
                             packages: packages,
                             isFile: isFile })
        .should.equal('/www/modules/dojo/1.7.1/util.js');
    })
  })
  
  
  it('should throw error if not resolved from top-level directory', function() {
    (function(){
      resolve.sync('bar', { baseDir: '/www/modules', isFile: isFileFalse })
    }).should.throw("Cannot find module 'bar'");
  })
  it('should throw error if not resolved from relative directory', function() {
    (function(){
      resolve.sync('./bar', { relDir: '/www/app/foo', isFile: isFileFalse })
    }).should.throw("Cannot find module './bar'");
  })
  
})

describe('resolve.special', function() {
  
  it('should specify special dependencies', function() {
    Object.keys(resolve.special).should.have.length(3);
    resolve.special['require'].should.be.true;
    resolve.special['exports'].should.be.true;
    resolve.special['module'].should.be.true;
  })
  
})

describe('resolve.isSpecial', function() {
  
  it('should return true for special dependencies', function() {
    resolve.isSpecial('require').should.be.true;
    resolve.isSpecial('exports').should.be.true;
    resolve.isSpecial('module').should.be.true;
  })
  
})

