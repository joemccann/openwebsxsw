
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')

// Snage stripe api key.
var stripeKeys = require(path.resolve(__dirname, 'config', './stripe-config.json'))
var api_key = stripeKeys['api-key-secret-test']
var stripe = require('stripe')(api_key)

var app = express()

app.configure(function(){
  
  app.set('port', process.env.PORT || 3100)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))
  app.use(express.static(path.join(__dirname, 'public')))

  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "2013 Open Web SXSW Pool Party"
  app.locals.description = "2013 Open Web SXSW Pool Party in Austin, Texas celebrating the open web."
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV
  
  // "api-key-secret-test": "fyWaZg1ADwrdnEElG7yG415Q97MHhboG",
  // "api-key-secret-production": "Q9csjIBz69B0m73H8y4R9bDtQOMkPQO0",
  // "api-key-publishable-test": "pk_qp4FNrU3HaVyHTfulR5ISLyGDX1Te",
  // "api-key-publishable-production": "pk_j7Ka3mf1YDjxB8YPrXF72IKTexg3K"
  
  app.locals['api_key_publishable_test'] = stripeKeys["api-key-publishable-test"]
  app.locals['api_key_publishable_production'] = stripeKeys["api-key-publishable-production"]
  
  // Concat/minify
  smoosher()

})

app.configure('development', function(){
  app.use(express.errorHandler())
})

app.get('/', routes.index)

app.post('/charge', function(req, res){
  
  var body = req.body

  return handleStripePost(body,res)

})


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://127.0.0.1:" + app.get('port'))
})


function handleStripePost(obj, res){
    
  // Post the charge
  stripe.charges.create(obj, function(err,data){
    if(err){
      console.log("Unsuccessful charge at " + (new Date).toLocaleTimeString())
      console.error(err)
      return res.send("Error:  " + err)
    }
    console.log("Successful charge at " + (new Date).toLocaleTimeString())
    // console.dir(data)
    res.json(data)
  })
}


// Concats, minifies js and css for production
function smoosher(){

  // Compress/concat files for deploy env...
  // Need to run this locally BEFORE deploying
  // to nodejitsu
  if(app.locals.env === 'predeploy'){
    // Smoosh the things
    var smoosh = require('smoosh')
    
    smoosh.make({
      "VERSION": app.locals.app_version,
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
    
  } // end if production env

  
}
