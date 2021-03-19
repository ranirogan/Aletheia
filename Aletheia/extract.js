const Article = require('newspaperjs/lib/article');

//curr_url = window.location.href;
curr_url = 'https://www.cnn.com/2021/03/19/cnn-underscored/does-checking-credit-hurt-credit-score/index.html'


function getContent(url){
  Article(url)
  .then(result=>{
    console.log("Title: " + result.title);
    console.log("Author: " + result.author);
    console.log("Date: " + result.date);
    console.log("Text: " + result.text);
    var retString = '';
    retString+="["+result.title+"]";
    retString+="["+result.author+"]"
    retString+="["+result.date+"]"
    retString+="["+result.text+"]"
    return retString;
  }).catch(resaton=>{
    console.log(reason);
  })
}

chrome.runtime.sendMessage({
  action: "getContent",
  source: getContent(window.location.href)
});