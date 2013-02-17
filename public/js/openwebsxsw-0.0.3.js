
$(document).ready(function(){
  
  log('Ready...')
  
  // Global
  window.OW = {position:null, hasTouch:true}
  
  // Check for touch events (note: this is not exhaustive)
  if( !('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
    document.documentElement.className = "no-touch"
    OW.hasTouch = false
  } 

  // Get user's location and stash...
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError)
  } 
  else geoError("Not supported.")
  
  function geoSuccess(position) {
    OW.position = position.coords
    initLocationHandlers()
  }

  function geoError(msg) {
    log(arguments)
    OW.position = null
  }
  
  /* Handle Signup Form ****************************************/
  
  var $signupForm = $('#signup-form')
    , $signupButton = $('#signup-button')
    
  if($signupForm.length){
    
    var signupHandler = function(e){

      $signupButton.attr('disabled', true)
      
      $('.error').removeClass('error')
      
      var $inputEmail = $('input[type="email"]')
        , $inputName = $('input[type="name"]')
        , $inputTwitter = $('input[type="twitter"]')

      // Validate inputs
      if( $inputName.val().length < 2 ){
        log('Bad name.')
        $inputName
          .val('')
          .addClass('error')
          .focus()
        
        $signupButton.removeAttr('disabled')
          
        return false
      } else if( !( /(.+)@(.+){2,}\.(.+){2,}/.test( $inputEmail.val() ) ) ){
        log('Bad email.')
        $inputEmail
          .val('')
          .addClass('error')
          .focus()
        
        $signupButton.removeAttr('disabled')
        
        return false
      }        
      
      // Populate lat/lon if it's there...
      $('#signup-lat').val( OW.position ? OW.position.latitude : '')
      $('#signup-lon').val( OW.position ? OW.position.longitude : '')
      
      // Cleanup twitter handle...
      $inputTwitter.val( $inputTwitter.val().replace('@', '') )
      
      $.post('/signup', $signupForm.serialize(), function(resp){
        
        // This is a weird delta between zepto and jquery...
        var r = (typeof resp === 'string') ? JSON.parse(resp) : resp
        
        log(r)
        
        $signupForm.find('input').val('')
        
        $signupButton.removeAttr('disabled')
        
        alert("Signup was successful. Stay tuned...")
        
      }) // end post
      
      return false
      
    }
    
    $signupButton.on('click', function(e){
      signupHandler(e)
      e.preventDefault()
      return false

    }) // end click()
    
    $signupForm.on('submit', function(e){
      signupHandler(e)
      e.preventDefault()
      return false

    }) // end submit()
    
    
  }

  /* End Signup Form *******************************************/
  


  /* Handle Stripe Invoice Payments... *************************/
  
  var $stripeButton = $('#stripe-button')
  
  if($stripeButton.length){
    
    var stripeTokenCallback = function(res){
      
      var token = res.id
      
      var body = {
        amount : stripeConfig.amount,
        currency : stripeConfig.currency,
        card : token,
        description : stripeConfig.description
      }
      
      $.post('/charge', body, function(resp){
        var r = JSON.parse(resp)
        log(r)
        alert("Payment successful! You wil now be redirected to the home page.")
        location.href = "/"
      }) // end post
    }
    
    var stripeConfig = {
      key:         $stripeButton[0].dataset.key,
      address:     false,
      amount:      $stripeButton[0].dataset.amount,
      name:        $stripeButton[0].dataset.name,
      description: $stripeButton[0].dataset.description,
      currency:    $stripeButton[0].dataset.currency, 
      token:       stripeTokenCallback
    }
    
    $stripeButton.on('click', function(){
      StripeCheckout.open(stripeConfig)
      return false
    })
    
  } // end if stripeButton length
  
  /* End Stripe Invoice Payments... ****************************/
  
  /* Handle Location Mapping... ********************************/
  
  // A wrapper that is called after geo is found/not found...
  function initLocationHandlers(){
    // first hide the fallback div
    $('#location-fallback').hide()
    // now, show the map/directions
    loadMapJs()
    
  }
  
  function loadMapJs(cb){

    var key

    // Need different api key in localhost environment vs production
    if(/localhost/.test(location.href) || /127.0.0.1/.test(location.href)){
      key = 'AIzaSyB3EZrxj8MqP881fnxq3txiHtoERjrsop0'
    }
    else key = 'AIzaSyB22ZpoSy-x1R4mkDGwm6H2AoyVnnFzzY0'

    // the callback has to get added to the async js request
    var lib = 'https://maps.googleapis.com/maps/api/js?key='+key+
              '&callback=showMap&sensor='+ (OW.hasTouch ? true : false);

    (function() {
      var gmapsLib = document.createElement('script'); gmapsLib.type = 'text/javascript'; gmapsLib.async = true;
      gmapsLib.src = lib
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(gmapsLib, s);
  
      gmapsLib.onload = function(){
        log('Loaded gmaps js...')
        cb && cb()
      }
  
    })()
    
  }
  
  // needs to be added to global because of async fetch of gmaps js file
  window.showMap = function(){
      log("Location stuff is coming soon, bro.")
      // var mapOptions = {
      //     center: new google.maps.LatLng(30.269555,-97.751337),
      //     zoom: 15,
      //     mapTypeId: google.maps.MapTypeId.ROADMAP
      //   };
      //   var map = new google.maps.Map(document.getElementById("map"),
      //       mapOptions);
      //       
      //   $('#map').addClass('imgstyle')
  }
  
  /* End Location Mapping... ***********************************/
  
  
})
