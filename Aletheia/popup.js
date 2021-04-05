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
    var digest = document.querySelector("#digest");
    digest.classList.add("active");
    var welcome = document.querySelector("#welcome");
    welcome.classList.remove("active");
    var message = document.querySelector('#message');
    message.classList.add("active");
    fetch('http://ec2-18-144-60-190.us-west-1.compute.amazonaws.com:8080/', {
      method: 'POST',
      mode: 'no-cors',
      body: 'https://apnews.com/article/derek-chauvin-trial-live-updates-c3e3fe08773cd2f012654e782e326f6e'
    })
    .then(function(response) {
      return response.text().then(function(text) {
        message.innerHTML = text;
      });
    });
  });
});