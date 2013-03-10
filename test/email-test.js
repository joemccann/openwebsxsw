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

function emailer(pathToEmailFile, pathToEmailAddressJson){
  
  var html = fs.readFileSync( pathToEmailFile )
  
  // var emails = signupUtil.getArrayOfEmails( path.resolve( __dirname, '..', 'util/signups.json') )
  var emails = require( pathToEmailAddressJson )
  
  //  sendEmail: function(fromSender, toRecipient, bcc, subject, emailText, emailHtml, cb){}
  mailer.sendEmail('boom@openwebsxsw.com','boom@openwebsxsw.com',emails,'[Open Web SXSW] Party Update!',null,html,function(err,data){
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

      
}

function writeFile(data, name){
  fs.writeFile(name, data, 'utf-8', function(err){
    if(err) return console.error(err)
    console.log("Wrote file: "+ name)
  })
}

