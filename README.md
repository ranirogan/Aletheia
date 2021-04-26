# Aletheia
A chrome extension toolkit to analyze news

Basic UI components:

  Heading: About this Article
  
  Author and news site with bias ratings
  
  Sentiment analysis
  
  Key Terms list with links to wikipedia
  
  Related Articles with links & sentiment/bias analysis
  
  
## Backend
Responds to POST requests with a URL in the request body

To install, run the following
```
 pip install -r requirements.txt
 python -m spacy download en_core_web_sm
```
To run the server, run the following
```
 python app.py
```

