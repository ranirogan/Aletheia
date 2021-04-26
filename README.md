# Aletheia
A chrome extension toolkit to analyze news

Basic UI components:

  Heading: About this Article
  
  Author and news site with bias ratings
  
  Sentiment analysis
  
  Key Terms list with links to wikipedia
  
  Related Articles with links & sentiment/bias analysis
  
  For a more in depth explanation, right click on the Aletheia extension icon and select "Options"
  
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

## How to install the extension
1. Clone the github repository
2. On Google Chrome, click the puzzle icon (top right), then "Manage Extensions" to view your extensions
3. On the top right of your extensions page, turn on Developer mode by toggling the switch
4. Click "Load Unpacked" on the top left of your screen
5. Navigate to where you cloned the github repository and navigate to "/Aletheia/Aletheia" and chose the whole folder
6. You now have access to the extension! You may need to pin this extension to your browser. This can be achieved by clicking on the puzzle icon on your browser (top right) and clicking the pin icon next to Aletheia.
