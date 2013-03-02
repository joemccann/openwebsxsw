var nodemailer = require('nodemailer')
  , fs = require('fs')
  , path = require('path')

function Email(){

  var email_config
    , smtpTransport

  // Load up the config file from an optional path or hardcoded fallback.
  function _loadConfig(filepath){
    email_config = JSON.parse( filepath || (fs.readFileSync( path.resolve(__dirname, '..', 'config', 'google-apps-config.json'), 'utf-8' ) ) )
  }

  // Create the SMTP transport for later use
  function _createSmtpTransport(){
    // create reusable transport method (opens pool of SMTP connections)
    smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: email_config.username,
            pass: email_config.password
        }
    })

    var d = new Date()
    console.log('SMTP transport created on ' + d.toLocaleDateString() + ' at ' + d.toLocaleTimeString()  )

  }

  // "Constructor"
  !function(){

    // Order is important...
    _loadConfig()
    _createSmtpTransport()

  }()

  return {
    loadConfig: _loadConfig,
    sendEmail: function(fromSender, toRecipient, subject, emailText, emailHtml, cb){

      var fromAddress = fromSender || "Open Web SXSW <boom@openwebsxsw.com>"
        , toAddress = toRecipient || "joe@subprint.com" 
        , subject = subject || "Party Time!"
        , text = emailText || "Almost time for a party, bro." 
        , html = emailHtml || "Almost time for a party, <b>bro.</b>" 

      var mailOptions = {
          from: fromAddress, 
          to: toAddress, 
          subject: subject, 
          text: text, 
          html: html 
      }

      // send mail with defined transport object
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error) return cb(error)
          return cb(null, response)
      }) // end sendmail()
    } // end sendEmail
  }
}

module.exports = new Email() 