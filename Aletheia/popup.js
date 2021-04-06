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
    var digest = document.querySelector("#digest");
    digest.classList.add("active");
    var welcome = document.querySelector("#welcome");
    welcome.classList.remove("active");
    var message = document.querySelector('#message');
    message.classList.add("active");
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0].url;
      fetch('http://ec2-18-144-60-190.us-west-1.compute.amazonaws.com:8080/', {
      method: 'POST',
      body: url
      })
      .then(function(response) {
        return response.json().then(json => getVals(json))
      });
    });
    
  });
});

function getVals(json){
  var title = document.getElementById("title");
  title.innerHTML = json.title;
  var author = document.getElementById("author");
  author.innerHTML = json.authors;
  var sentiment = json.sentiment;
  var sent = document.getElementById("sentiment");
  getSentiment(sent, sentiment);
  var entities = json.entities;
  getEntities(entities);
  var similar = json.similar;
  getSimilar(similar);
  activateLinks();
}

function getEntities(entities){
  var keyTerms = document.getElementById("keyTerms");
  for(var i = 0; i < entities.length; i++){
    var ent = entities[i];
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.innerHTML = ent.text;
    a.setAttribute("href", ent.wiki);
    li.appendChild(a);
    keyTerms.appendChild(li);
  }
}

function activateLinks(){
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
}

function getSentiment(sent, sentiment){
  var fragment = document.createDocumentFragment();
  var pos = document.createElement("p");
  var neg = document.createElement("p");
  var neu = document.createElement("p");
  pos.innerHTML = sentiment.pos;
  neg.innerHTML = sentiment.neg;
  neu.innerHTML = sentiment.neu;
  fragment.appendChild(neg);
  fragment.appendChild(neu);
  fragment.appendChild(pos);
  sent.appendChild(fragment);
}

function getSimilar(similar){
  var articles = document.getElementById("articles");
  for(var i = 0; i < similar.length; i++){
    var li = document.createElement("li");
    var p = document.createElement("p");
    var art = similar[i];
    p.innerHTML = art.title;
    li.appendChild(p);
    var a = document.createElement("a");
    a.innerText = "From " + art.url.substring(0,100);
    a.setAttribute("href", art.url);
    li.appendChild(a);
    if(art.sediment){
      var sed = document.createElement("p");
      getSentiment(sed, art.sediment)
      li.appendChild(sed);
    }
    articles.appendChild(li);
  }
}