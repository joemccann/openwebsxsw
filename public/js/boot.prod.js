/* Conditional load of zepto or jquery */
var $lib = ('__proto__' in {} ? 'zepto.min' : 'jquery.min')
require(["log",  $lib ], function(l, zepto){
  log($lib + ' and Log loaded...')
  require(["openwebsxsw-0.0.4-16.min"], function(openwebsxsw){
    log('All JS files loaded...')
  })
})