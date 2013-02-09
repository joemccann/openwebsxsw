require(["log", "zepto.min"], function(l, zepto){
  log('Zepto and Log loaded...')
  require(["openwebsxsw"], function(openwebsxsw){
    log('All JS files loaded...')
  })
})