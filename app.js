
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , request = require('request')
  , mailer = require('./util/google-apps-email-util.js')
  , klout = require('./util/klout-filter-util.js')
  , _ = require('lodash')
  , async = require('async')
  , stripe
  , signups
  , kloutCache = []
  ;

// Init Invoices...
var invoices = require(path.resolve(__dirname, 'invoices', './invoices-config.json'))

// Init Signups...
var couchdb = require(path.resolve(__dirname, 'config', './couch-config.json'))

// Init Express app...
var app = express()

app.configure(function(){

  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "2013 Open Web SXSW Pool Party"
  app.locals.description = "2013 Open Web SXSW Pool Party in Austin, Texas celebrating the open web."
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV
  
  app.set('port', process.env.PORT || 3100)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger(app.locals.env === 'production' ? 'tiny' : 'dev' ))
  app.use(express.compress())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))
  app.use(express.static(path.join(__dirname, 'public')))


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

})

app.configure('development', function(){
  app.use(express.errorHandler())
})

// Handle index page.
app.get('/', routes.index)


// Handle emails page.
// TODO:  ADD SOME BASELINE CACHING SO WE AREN'T DOING THIS ON EVERY REQUEST
app.get('/emails', function(req,res){
  
  var handles = []
  
  // If we have a cached version, serve this...
  if(kloutCache.length) return res.render('view-email-addresses', {emails: kloutCache})
    
  // If no signups, then something went wrong when fetching the 
  // signups.json  
  if(signups.length){

    // Iterate over all the signups adding cleaned twitter handles
    // to the handles array
    signups.forEach(function(el,i){
      handles.push(el.twitter ? el.twitter.replace('@','').replace("'", "").replace('"', '') : 'tester')
    })

    // Create array of urls as klout only lets us batch
    // requests with 99 usernames at a time.
    var urls = klout.getKlout(handles, null, null)

    // Now, let's get a large object containing all the klout scores
    klout.getKloutScores(urls, function(err, data){

      if(err){
        console.error(err)
        return res.send(500)
      }
      
      // Now, let's add the klout scores to each individual's object
      // which includes their email address, name, twitter, etc.
      var addedToSet = klout.addKloutScoreToSet(signups, handles, data)

      // For Fun, let's filter folks that have a Klout score higher than 59 and add to cache
      var filtered = kloutCache = _.filter(addedToSet, function(el) { return parseInt(el.klout) > 59 })
      
      // Create a quick cache so we aren't pounding Klout's API every time.
      setTimeout( function(){
        var f = new Date()
        var d = f.toLocaleDateString()
        var t = f.toLocaleTimeString() 
        console.log("Invalidated Klout Cache at " + t + " on " + d)
        kloutCache = []
      }, 60000)

      return res.render('view-email-addresses', {emails: filtered})

    }) // end getKloutScores
    
  }
  else return res.render('view-email-addresses', {emails: []})
  
})

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
  
  // Prune the list of signups on start of app...
  getPrunedSignupsList(null, function(err,data){
    if(err) return console.error(err)

    fetchHeadFromCouch(function(e,d){
      // console.dir(d)
      var rev = d._rev
      writeToCouch(rev, null, data, function(e,d){
        if(e) return console.error(e)
        console.log("Updated signups attachment after pruning it.")
        
        // Fetch the signups
        fetchSignupsFromCouch(function(e,d){
          if(e) return console.error(e)

          console.log('Fetched Signups Attachment doc.')
          // If it's not an array back from couch, then make it an empty one.
          signups = ( Object.prototype.toString.call( d ) === '[object Array]' ? d : [])
          // console.dir(signups)

        }) // end fetchSignupsFromCouch
      }) // end writeToCouch  
    }) // end fetchHeadFromCouch
  }) // end getPrunedSignupsList
  
  
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://127.0.0.1:" + app.get('port'))
})

// Helper method to just clean up twitter handles to only
// the handles and no special chars
function cleanTwitterNames(set){
  set.forEach(function(el,i){
    if(el.twitter){
      set[i].twitter = set[i].twitter.replace('@', '').replace('"', '').replace("'", "").replace('#','')
    } 
  })
  return set
}

// Helper method to create couchdb url
function generateCouchDbUrl(){
  return  'http://'
          + couchdb.username
          +":"
          + couchdb.password
          + "@"
          + couchdb.db_url 
          + "/" 
          + couchdb.db_name
}

// Snag latest id and rev with HEAD; fire callback
function fetchHeadFromCouch(cb){

  var fullCouchDbUrl = generateCouchDbUrl() + "/signups"
    , h = {'content-type':'application/json', 'accept':'application/json'}
  
  var config = {
    type: 'HEAD',
    url: fullCouchDbUrl,
    headers: h
  }
  
  request(config, function(e,r,b){
    if(e){
      console.error(e)
      return cb(e)
    }
    if(b){
      // console.dir(b)
      return cb(null,JSON.parse(b))
    }
  })
  
}

// Fetch the signups doc; firecallback
function fetchSignupsFromCouch(cb){
  
  var fullCouchDbUrl = generateCouchDbUrl() + "/signups/signups.json"
    , h = {'content-type':'application/json', 'accept':'application/json'}

  var config = {
    type: 'GET',
    url: fullCouchDbUrl,
    headers: h
  }
  
  request(config, function(e,r,b){
    if(e){
      console.error(e)
      return cb(e)
    }
    if(b){
      // console.dir(b)
      return cb(null, JSON.parse(b))
    }
  })


}

// Helper method to generate couchdb signups attachment
function generateSignupsAttachment(signupBody){
  
  var body = signupBody || signups // array of signups outside this scope
  
  return JSON.stringify
    (
      { _attachments: 
        { 'signups.json': 
          { follows: true
          ,  length: JSON.stringify(body).length
          , 'content_type': 'text/json' 
          }
        }
      }
    )
}

// Write new signup to couch; fire callback
function writeToCouch(rev, res, signupBody, cb){
  
  var fullCouchDbUrl = generateCouchDbUrl() + "/signups?rev="+rev
  
  var config = { 
                  method: 'PUT'
                , uri: fullCouchDbUrl
                , multipart: 
                  [ { 'content-type': 'application/json'
                    , body: generateSignupsAttachment(signupBody)
                    }
                  , { 
                      body: JSON.stringify(signupBody) 
                    }
                  ]
              }
  
  request(config, function (error, response, body){
    if(response.statusCode == 201){
      console.log('document saved as: '+ fullCouchDbUrl)
      cb()
    }
    else{
      console.error('error: '+ response.statusCode)
      cb('error: '+ response.statusCode)
    }
  }) // end request
  
}

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

// Add signed up user...
function handleSignupPost(obj, res){
    
  signups.push(obj)
  
  fetchHeadFromCouch(function(e,d){
    // console.dir(d)
    var rev = d._rev
    // Pass the latest revision, the response object
    // the signups array and the callback...
    writeToCouch(rev, res, signups, function(e){
      if(e) return res.json(e)
      return res.json(obj)
    })  
  })

}

// A helper method to fetch the signups.json attachment (file)
// and remove dupes
function getPrunedSignupsList(url, cb){

  var url = url || generateCouchDbUrl() + "/signups/signups.json"

  require('./util/signup-util.js')(url, function(err,data){
    if(err) {
      console.warn("Error from signup-util trying to fetch json doc from an url...")
      // Todo is
      return console.error(err)
    }

    // Cleanup any old, rogue twitter names...
    data = cleanTwitterNames(data)
    
    fs.writeFile( path.resolve(__dirname, "util", "signups.json"), JSON.stringify(data), 'utf-8', function(err){
      if(err) return console.error(err)

      // console.log('signups.json File written')

      var f = fs.readFileSync(path.resolve(__dirname, "util", "signups.json"), 'utf-8')

      console.dir(JSON.parse(f).length + " is the total number of signups.")
      
      cb(null,JSON.parse(f))
      
    }) // end writeFile
    
  })
  
}

/******

Email testing...

******/

function emailTest(){
  mailer.sendEmail(null,null,null,null,null,function(err,data){
    if(err) return console.error(err)
    console.log(data)
  })
}

// emailTest()


