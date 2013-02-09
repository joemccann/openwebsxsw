/* Wire stripe payments */
$(document).ready(function(){
  
  // Check for touch events (note: this is not exhaustive)
  if( !('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) 
    document.documentElement.className = "no-touch"


  // Handle Stripe...
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
  
})
