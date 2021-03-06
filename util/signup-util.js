var fs = require('fs')
  , _ = require('lodash')
  , request = require('request')
  ;

// Fetches the json from a url, then removes dupes
// returns un-duped array
module.exports.removeDupes = function (url, cb) {
  
  request(url, function(err,r,data){
    
    if(err) return cb(err)

    // Try/Catch parse json, if not, then it's an
    // error string from iriscouch. They will still send a 200
    // even when there's an internal error so can't trust response code

    try{
      data = JSON.parse(data)
    }catch(e){
      return cb(new Error(data))
    }

    var removeDupeNames = removeDupes(data, 'name')    
      , removeDupeEmails = removeDupes(removeDupeNames, 'email')    
      , removeDupeTwitter = removeDupes(removeDupeEmails, 'twitter') 
    
    return cb(null,removeDupeTwitter)

  })
  
}

// Returns just an array of the emails from a signups file
module.exports.getArrayOfEmails = function (pathToJsonFile){
  
  var json = require(pathToJsonFile)
    ,  emails = []
  
  json.forEach(function(el,i){
    emails.push( cleanEmail(el.email) )
  })
  
  return emails
  
}

// trims whitespace from emails
function cleanEmail(email){
  
  if (typeof String.prototype.trim != 'function') { // detect native implementation
    String.prototype.trim = function () {
      return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
  }
  
  return email.trim()
  
}

// For removing from arrays where items are objects...
function removeDupes(arr,docType){return _.map(_.groupBy(arr,function(doc){return doc[docType]}),function(grouped){return grouped[0]})}




