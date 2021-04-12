document.addEventListener('DOMContentLoaded', function(){
  var read = document.getElementById("read");
  read.addEventListener('click', function(){
    var button = document.getElementById('read')
    button.disabled = true;
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
  title.innerText = json.title;
  var author = document.getElementById("author");
  author.innerHTML = json.authors;
  var sum = document.getElementById("summary");
  sum.innerText = json.summary;
  var sentiment = json.sentiment;
  var sent = document.getElementById("sentiment");
  getSentiment(sent, sentiment);
  // var entities = json.entities;
  // getEntities(entities);
  // var similar = json.similar;
  // getSimilar(similar);
  // var keyTerms = document.getElementById("keyTerms");
  // activateLinks(keyTerms);
  // var articles = document.getElementById("articles");
  // activateLinks(articles);
  var message = document.querySelector('#message');
  message.classList.remove("active");
  var digest = document.querySelector("#digest");
  digest.classList.add("active");
  var welcome = document.querySelector("#welcome");
  welcome.classList.remove("active");
}

function getEntities(entities){
  var keyTerms = document.getElementById("keyTerms");
  for(var i = 0; i < entities.length; i++){
    var ent = entities[i];
    var a = document.createElement("a");
    a.innerHTML = ent.text;
    a.setAttribute("href", ent.wiki);
    a.classList.add("list-group-item");
    a.classList.add("list-group-item-action");
    keyTerms.appendChild(a);
  }
}

function activateLinks(place){
  var links = place.getElementsByTagName("a");
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
  var pos = document.createElement("div");
  var neg = document.createElement("div");
  var neu = document.createElement("div");
  var p = sentiment.pos * 100;
  var ng = sentiment.neg * 100;
  var nu = sentiment.neu * 100;

  pos.classList.add("progress-bar");
  pos.classList.add("bg-success");
  pos.setAttribute("role", "progressbar");
  pos.setAttribute("aria-valuemin", "0");
  pos.setAttribute("aria-valuemax", "100");

  neg.classList.add("progress-bar");
  neg.classList.add("bg-danger");
  neg.setAttribute("role", "progressbar");
  neg.setAttribute("aria-valuemin", "0");
  neg.setAttribute("aria-valuemax", "100");

  neu.classList.add("progress-bar");
  neu.classList.add("bg-secondary");
  neu.setAttribute("role", "progressbar");
  neu.setAttribute("aria-valuemin", "0");
  neu.setAttribute("aria-valuemax", "100");

  pos.setAttribute("aria-valuenow", p);
  pos.setAttribute("style", `width: ${p}%`);

  neg.setAttribute("aria-valuenow", ng);
  neg.setAttribute("style", `width: ${ng}%`);

  neu.setAttribute("aria-valuenow", nu);
  neu.setAttribute("style", `width: ${nu}%`);

  neg.innerText = Math.floor(ng) + "%";
  neu.innerText = Math.floor(nu) + "%";
  pos.innerText = Math.floor(p) + "%";

  fragment.appendChild(neg);
  fragment.appendChild(neu);
  fragment.appendChild(pos);
  sent.appendChild(fragment);
}

function getSimilar(similar){
  var articles = document.getElementById("articles");
  for(var i = 0; i < similar.length; i++){
    var div = document.createElement("div");
    var art = similar[i];
    var a = document.createElement("a");
    a.innerText = art.title;
    a.setAttribute("href", art.url);
    div.appendChild(a);
    if(art.sediment){
      var sed = document.createElement("div");
      sed.classList.add("progress");
      getSentiment(sed, art.sediment);
      div.appendChild(sed);
    }
    div.classList.add("list-group-item");
    articles.appendChild(div);
  }
}