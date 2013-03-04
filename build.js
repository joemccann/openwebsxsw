var fs = require('fs')
  , path = require('path')
  , walkdir = require('walkdir')
  , smoosh = require('smoosh')


// Pass in a path of a directory to walk and a 
// regex to match against.  The file(s) matching
// the patter will be deleted.
function walkAndUnlink(dirPath, regex){

  var emitter = walkdir(dirPath)

  emitter.on('file',function(filename,stat){
    if( regex.test(filename) ){
      console.log("Removing old file: " + filename)
      fs.unlinkSync( path.resolve( dirPath, filename) )
    }
  })

}

// Removes old css/js files.
function cleaner(){
  walkAndUnlink( path.join(__dirname, 'public', 'css'), new RegExp(/style-/) )
  walkAndUnlink( path.join(__dirname, 'public', 'js'), new RegExp(/openwebsxsw-/) )
}

// Concats, minifies js and css for production
function smoosher(){

  var version = require('./package.json').version
  
  // Smoosh the things
  
  smoosh.make({
    "VERSION": version,
    "JSHINT_OPTS": {
      "browser": true,
      "evil":true, 
      "boss":true, 
      "asi": true, 
      "laxcomma": true, 
      "expr": true, 
      "lastsemic": true, 
      "laxbreak":true,
      "regexdash": true,
    },
    "JAVASCRIPT": {
      "DIST_DIR": "./public/js",
      "openwebsxsw": [ "./public/js/openwebsxsw.js" ]
    },
    "CSS": {
      "DIST_DIR": "./public/css",
      "style": [ "./public/css/style.css" ]
    }
  })
  .done(function(){
    // Write boot.prod-VERSION.js
    var js = fs.readFileSync( path.resolve(__dirname, 'public', 'js', 'boot.js'), 'utf-8')
    
    var newProdFile = 'openwebsxsw-'+ version +'.min'
    
    var write = js.replace('openwebsxsw', newProdFile)
    
    fs.writeFile( path.resolve(__dirname, 'public', 'js', 'boot.prod.js'), write, 'utf-8', function(err,data){
     if(err) return console.error(err)
     
     console.log("Wrote the latest version: " + newProdFile)
      
    })
    console.log('\nSmoosh done.\n')
  })
      
}

// Concat/minify
cleaner()
setTimeout(smoosher,750) // pure laziness...
