var path = require('path')
  , fs = require('fs')
  , request = require('request')
  , mailer = require('../util/sendgrid-util.js')
  , signupUtil = require('../util/signup-util.js')
  , _ = require('lodash')


/******

Email testing...

******/

// Helper to slice an array up into 150 element instances
function sliceTo150(emails, all, num){

  all.push( _.first(emails, num || 150) )
  
  if(num){
    return all // we are done because the num would be the last 1-149 elements of the array
  }
  
  var remaining = _.rest(emails, num || 150)
  
  var sliceNum = remaining.length < 149 ? remaining.length : null
  
  return sliceTo150( remaining, all, sliceNum  )
  
}

// fucking google apps has a 500 emails/day limit
function emailTest(){
  
  var html = fs.readFileSync( path.resolve(__dirname, '..', 'public/email/welcome.html') )
  
  // var emails = signupUtil.getArrayOfEmails( path.resolve( __dirname, '..', 'util/signups.json') )
  // var emails = require('./remaining-lots.json')

  var fails = []
    , wins = []
  
  //  sendEmail: function(fromSender, toRecipient, bcc, subject, emailText, emailHtml, cb){}
  var emailLots = require('./remaining-lots-ignore.json')
  
  // emailLots.shift()
  // return writeFile(JSON.stringify(emailLots), 'remaining-lots.json')
  
  var emailInterval = setInterval(function(){
    
    if(!emailLots.length){
      console.log("All finished...")
      clearInterval(emailInterval)
      return
    }
    
    var el = emailLots.pop()

    mailer.sendEmail('boom@openwebsxsw.com','boom@openwebsxsw.com',el,'[Open Web SXSW] Saying Hello!',null,html,function(err,data){
      if(err) {
        console.warn("Error sending to email")
        console.error(err)
        writeFile(JSON.stringify(err), 'fails-'+new Date()+'.json')
      }
      else{
        console.log('------------------------')
        console.log('Successfully sent ')
        console.dir(data)
        writeFile(JSON.stringify(data), 'wins-'+new Date()+'.json')
      }
    }) // end sendEmail

    
  },5000) // end setInterval
      
}

function writeFile(data, name){
  fs.writeFile(name, data, 'utf-8', function(err){
    if(err) return console.error(err)
    console.log("Wrote file: "+ name)
  })
}

emailTest()