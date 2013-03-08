var path = require('path')
  , fs = require('fs')
  , request = require('request')
  , mailer = require('../util/google-apps-email-util.js')
  , signupUtil = require('../util/signup-util.js')
  , _ = require('lodash')



/******

Email testing...

******/

// sendEmail: function(fromSender, toRecipient, subject, emailText, emailHtml, cb)

function emailTest(){
  
  var html = fs.readFileSync( path.resolve(__dirname, '..', 'public/email/welcome.html') )
  
  var emails = signupUtil.getArrayOfEmails( path.resolve( __dirname, '..', 'util/signups.json') )
  
  var fails = []
    , wins = []
    
  emails.forEach(function(el,i){
    
      mailer.sendEmail('boom@openwebsxsw.com',el,'[Open Web SXSW] Saying Hello!',null,html,function(err,data){
        if(err) {
          console.warn("Error sending to email: "+ el)
          console.error(err)
          fails.push(el)
          writeFile(JSON.stringify(fails), 'fails.json')
        }
        else{
          console.log('------------------------')
          console.log('Successfully sent to: ' + el)
          console.dir(data)
          wins.push(el)
          writeFile(JSON.stringify(wins), 'wins.json')
        }
      }) // end sendEmail
  
  }) // end forEach  

  // Send email to myself to let me know if it worked or not...
  var sent = "<p>All email sent with "+fails.length+" failures and "+wins.length+" wins.</p>"

  mailer.sendEmail('boom@openwebsxsw.com','joe@subprint.com','[open web sxsw] All Email Sent!',null,,function(err,data){
    if(err) {
      console.warn("Error sending to email: "+ el)
      console.error(err)
      fails.push(el)
    }
    else{
      console.log('------------------------')
      console.log('Successfully sent to: ' + el)
      console.dir(data)
      wins.push(el)
    }
  }) // end sendEmail

}

function writeFile(data, name){
  fs.writeFile(name, data, 'utf-8', function(err){
    if(err) return console.error(err)
    console.log("Wrote file: "+ name)
  })
}

emailTest()