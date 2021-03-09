chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      message.innerText = request.source;
  }
});
  
document.addEventListener('DOMContentLoaded', function(){
  var read = document.getElementById("read");
  read.addEventListener('click', function(){
    var button = document.getElementById('read')
    button.disabled = true;
    var message = document.querySelector('#message');
    // toggles text on
    message.innerHTML = "Reading document";
    chrome.tabs.executeScript(null, {
      file: "getPageSource.js"
    }, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'Cannot read from extensions. Please try again on a valid page. \n';
      }
    });
  });
});