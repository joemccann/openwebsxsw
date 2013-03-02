var fs = require('fs')
  , _ = require('lodash')
  , request = require('request')
  ;

// Fetches the json from a url, then removes dupes
// returns un-duped array
module.exports = function (url, cb) {
  
  request(url, function(err,r,data){
    
    if(err) return cb(err)

    data = JSON.parse(data)

    var removeDupeNames = removeDupes(data, 'name')    
      , removeDupeEmails = removeDupes(removeDupeNames, 'email')    
      , removeDupeTwitter = removeDupes(removeDupeEmails, 'twitter') 
    
    return cb(null,removeDupeTwitter)

  })
  
}

// For removing from arrays where items are objects...
function removeDupes(arr,docType){return _.map(_.groupBy(arr,function(doc){return doc[docType]}),function(grouped){return grouped[0]})}




