document.addEventListener('DOMContentLoaded', function(){
  var read = document.getElementById("read");
  read.addEventListener('click', function(){
    var button = document.getElementById('read')
    button.disabled = true;
    var message = document.querySelector('#message');
    message.classList.add("active");
    message.setAttribute("style", "display: block");
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      if(tabs.length == 0)
        message.innerText= "Cannot read from this page type. Please try again from a valid page.";
      else{
        let url = tabs[0].url;
        fetch('http://ec2-18-144-60-190.us-west-1.compute.amazonaws.com:8080/', {
        method: 'POST',
        body: url
        }).then(function(response) {
            return response.json().then(json => getVals(json))
          });
      }
    }); 
  });
});

function getVals(json){
  var title = document.getElementById("title");
  title.innerText = json.title;
  var author = document.getElementById("author");
  author.innerText = json.authors;
  if(json.authors == "")
    author.innerText = "No authors found.";
  var sum = document.getElementById("summary");
  sum.innerText = json.summary;
  var sentiment = json.sentiment;
  var sent = document.getElementById("sentiment");
  getSentiment(sent, sentiment);
  getRating(sentiment);
  var entities = json.entities;
  getEntities(entities);
  var similar = json.similar;
  getSimilar(similar);
  var keyTerms = document.getElementById("keyTerms");
  activateLinks(keyTerms);
  var articles = document.getElementById("articles");
  activateLinks(articles);
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
  var p = sentiment.pos * 100;
  var ng = sentiment.neg * 100;
  var val = p + ng;
  if(val != 0){
    p = p/val * 100;
    ng = ng/val * 100;

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

    pos.setAttribute("aria-valuenow", p);
    pos.setAttribute("style", `width: ${p}%`);
    neg.setAttribute("aria-valuenow", ng);
    neg.setAttribute("style", `width: ${ng}%`); 

    neg.innerText = Math.floor(ng) + "%";
    pos.innerText = Math.floor(p) + "%";

    fragment.appendChild(neg);
    fragment.appendChild(pos);
  }
  else{
    var neu = document.createElement("div");
    var nu = sentiment.neu * 100;
    neu.classList.add("progress-bar");
    neu.classList.add("bg-secondary");
    neu.setAttribute("role", "progressbar");
    neu.setAttribute("aria-valuemin", "0");
    neu.setAttribute("aria-valuemax", "100");
    neu.setAttribute("aria-valuenow", nu);
    neu.setAttribute("style", `width: ${nu}%`);
    neu.innerText = Math.floor(nu) + "%";
    fragment.appendChild(neu);
  }
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

function getRating(sentiment){
  var p = sentiment.pos * 100;
  var ng = sentiment.neg * 100;
  var val = p + ng;
  p = Math.floor(p/val * 100);
  ng = Math.floor(ng / val * 100);
  var rating = document.getElementById("rating");
  var abr = document.createElement("abbr");
  if(val == 0){
    abr.innerText = "completely neutral.";
    abr.classList.add("text-secondary");
    abr.setAttribute("title", "No positive or negative sentiment");
  }
  else if(ng > 80){ 
    abr.innerText = `extremely negative (${ng}%)`;
    abr.setAttribute("style", "color: darkred");
    abr.setAttribute("title", `>80% negative`);
  }
  else if(ng > 60){
    abr.innerText = `negative (${ng}%)`;
    abr.classList.add("text-danger");
    abr.setAttribute("title", `>60% negative`);
  }
  else if (ng > 40){
    abr.innerText = "neutral.";
    abr.classList.add("text-secondary");
    abr.setAttribute("title", `Positive and negative sentiment are roughly equal`);
  }
  else if(ng > 20){
    abr.innerText = `positive (${p}%)`;
    abr.classList.add("text-success");
    abr.setAttribute("title", `>60% positive`);
  }
  else{
    abr.innerText = `extremely positive (${p}%)`;
    abr.setAttribute("style", "color: darkgreen");
    abr.setAttribute("title", ">80% positive");
  }
  rating.appendChild(abr);
}