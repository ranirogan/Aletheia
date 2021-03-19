chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    message.innerText = request.source;
  }
});
  
document.addEventListener('DOMContentLoaded', function(){
  var links = document.getElementsByTagName("a");
  for(var i = 0; i < links.length; i++){
    (function (){
      var link = links[i];
      var location = link.href;
      link.onclick = function(){
        chrome.tabs.create({active: true, url: location});
      }
    })();
  }
  var read = document.getElementById("read");
  read.addEventListener('click', function(){
    var button = document.getElementById('read')
    button.disabled = true;
    // var message = document.querySelector('#message');
    // message.classList.add("active");
    var digest = document.querySelector("#digest");
    digest.classList.add("active");
    var welcome = document.querySelector("#welcome");
    welcome.classList.remove("active");
  });
});