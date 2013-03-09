var nodemailer = require('nodemailer')
  , fs = require('fs')
  , path = require('path')

function Email(){

  var email_config
    , smtpTransport

  // Load up the config file from an optional path or hardcoded fallback.
  function _loadConfig(filepath){
    email_config = JSON.parse( filepath || (fs.readFileSync( path.resolve(__dirname, '..', 'config', 'sendgrid-config.json'), 'utf-8' ) ) )
  }

  // Create the SMTP transport for later use
  function _createSmtpTransport(){
    // create reusable transport method (opens pool of SMTP connections)
    smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Sendgrid",
        auth: {
            user: email_config.username,
            pass: email_config.password
        }
    })

    var d = new Date()
    console.log('SMTP transport for Sendgrid created on ' + d.toLocaleDateString() + ' at ' + d.toLocaleTimeString()  )

  }

  // "Constructor"
  !function(){

    // Order is important...
    _loadConfig()
    _createSmtpTransport()

  }()

  return {
    loadConfig: _loadConfig,
    sendEmail: function(fromSender, toRecipient, bcc, subject, emailText, emailHtml, cb){

      var fromAddress = fromSender || "Open Web SXSW <boom@openwebsxsw.com>"
        , toAddress = toRecipient || "boom@openwebsxsw.com" 
        , bcc = bcc || "boom@openwebsxsw.com" 
        , subject = subject || "Party Time!"
        , text = emailText || "Almost time for a party, bro." 
        , html = emailHtml || "Almost time for a party, <b>bro.</b>" 

      var mailOptions = {
          from: fromAddress, 
          to: toAddress, 
          bcc: bcc,
          subject: subject, 
          text: text, 
          html: html,
          generateTextFromHTML: true
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