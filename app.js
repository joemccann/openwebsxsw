
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , stripe
  ;

// Init Invoices...
var invoices = require(path.resolve(__dirname, 'invoices', './invoices-config.json'))

// Init Express app...
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

  // Init Stripe...
  var stripeKeys = require(path.resolve(__dirname, 'config', './stripe-config.json'))
    , api_key

  // Set proper key based on environment...
  if(app.locals.env === 'production'){
    api_key = stripeKeys['api-key-secret-production']
  }
  else{
    api_key = stripeKeys['api-key-secret-test']
  }
  
  // Load stripe
  stripe = require('stripe')(api_key)
  
  // Set these for use in views...
  app.locals['api_key_publishable_test'] = stripeKeys["api-key-publishable-test"]
  app.locals['api_key_publishable_production'] = stripeKeys["api-key-publishable-production"]
  
  // Concat/minify
  smoosher()

})

app.configure('development', function(){
  app.use(express.errorHandler())
})

// Handle index page.
app.get('/', routes.index)

// Handle incoming invoice number
app.get('/invoice/:number', function(req,res,next){
  // first, get the invoice number and see if it exists
  var invoiceNum = req.params.number

  if(!invoices[invoiceNum]) return next()

  var theInvoice = invoices[invoiceNum]
  
  // Since it exists, populate the config object for the
  // invoice view...
  
  // NOTE: THE API KEY IS IN THE APP.LOCALS
  var config = {
    amount: theInvoice.amount,
    currency: theInvoice.currency || 'usd',
    description: theInvoice.description,
    name: theInvoice.name
  }
  
  return res.render('invoice', config)  
  
})

// Handle incoming signup post
app.post('/signup', function(req,res,next){
  return handleSignupPost(req.body, res)
})

// Handle incoming stripe charge
app.post('/charge', function(req, res){
  
  return handleStripePost(req.body,res)

})

// Fire up server...
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://127.0.0.1:" + app.get('port'))
})

// When a charge is posted, let's call out to Stripe...
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

// When a charge is posted, let's call out to Stripe...
function handleSignupPost(obj, res){
    
  return res.json(obj)

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
    .done(function(){
      // Write boot.prod-VERSION.js
      var js = fs.readFileSync( path.resolve(__dirname, 'public', 'js', 'boot.js'), 'utf-8')
      
      var newProdFile = 'openwebsxsw-'+app.locals.app_version+'.min'
      
      var write = js.replace('openwebsxsw', newProdFile)
      
      fs.writeFile( path.resolve(__dirname, 'public', 'js', 'boot.prod.js'), write, 'utf-8', function(err,data){
       if(err) return console.error(err)
       
       console.log("Wrote the latest version: " + newProdFile)
        
      })
      console.log('\nSmoosh don.e\n')
    })
    
  } // end if production env
  
}
